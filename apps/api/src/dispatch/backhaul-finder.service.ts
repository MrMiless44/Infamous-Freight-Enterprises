import { Injectable, Logger } from '@nestjs/common';
import { LoadBoardAggregatorService, UnifiedLoad } from '../loads/load-board-aggregator.service';
import { ELDService } from '../eld/eld.service';
import { RedisService } from '../redis/redis.service';
import { CanadianHOSValidator } from '../../compliance/canadian-hos-rules';

export interface BackhaulMatch {
  load: UnifiedLoad;
  score: number;
  driverId: string;
  driverName: string;
  deadheadMiles: number;
  deadheadMinutes: number;
  driverHosRemaining: number;
  arrivalAtPickup: Date;
  revenuePerHour: number;
  isFeasible: boolean;
  reason?: string;
}

export interface BackhaulSearchRequest {
  driverId: string;
  currentLat: number;
  currentLng: number;
  deliveryTime: Date;
  driverHosMinutesRemaining: number;
  driverHomeLat?: number;
  driverHomeLng?: number;
  preferredEquipment?: string[];
  minRatePerMile?: number;
  maxDeadheadMiles?: number;
  routeToHome?: boolean;
}

@Injectable()
export class BackhaulFinderService {
  private readonly logger = new Logger(BackhaulFinderService.name);
  private readonly HOSValidator = new CanadianHOSValidator('south');

  constructor(
    private readonly loadBoard: LoadBoardAggregatorService,
    private readonly eld: ELDService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Find return loads after a delivery to minimize deadhead
   */
  async findBackhauls(request: BackhaulSearchRequest): Promise<BackhaulMatch[]> {
    const { driverId, currentLat, currentLng, deliveryTime, driverHosMinutesRemaining } = request;

    // Search for loads within radius of current location
    const radiusMiles = request.maxDeadheadMiles || 150;

    // Get nearby loads from load boards
    const nearbyLoads = await this.loadBoard.searchAllBoards({
      radiusMiles: 300, // Search broadly
      minRatePerMile: request.minRatePerMile || 1.50,
      equipmentTypes: request.preferredEquipment,
      pickupDateFrom: deliveryTime,
      pickupDateTo: new Date(deliveryTime.getTime() + 24 * 3600 * 1000), // Within 24h
    });

    // Filter and score loads
    const matches: BackhaulMatch[] = [];

    for (const load of nearbyLoads) {
      const deadheadMiles = this.haversine(
        currentLat, currentLng,
        load.origin.lat, load.origin.lng,
      );

      // Skip if deadhead too far
      if (deadheadMiles > radiusMiles) continue;

      const deadheadMinutes = (deadheadMiles / 55) * 60; // Assume 55 mph
      const arrivalAtPickup = new Date(deliveryTime.getTime() + deadheadMinutes * 60000);

      // Check if pickup is within driver HOS
      const totalDriveMinutes = deadheadMinutes + ((load.distance / 55) * 60);
      const hosFeasible = totalDriveMinutes <= driverHosMinutesRemaining;

      // Revenue per hour (including deadhead)
      const totalHours = (totalDriveMinutes + 120) / 60; // +2 hours for loading
      const revenuePerHour = load.rate / totalHours;

      // Scoring (0-100)
      let score = 0;
      score += Math.max(0, 30 - (deadheadMiles / radiusMiles) * 30); // Proximity (30%)
      score += Math.min(30, (load.ratePerMile / 4) * 30); // Rate quality (30%)
      score += hosFeasible ? 20 : 0; // HOS fit (20%)
      score += Math.min(20, (revenuePerHour / 100) * 20); // Revenue/hour (20%)

      // Route-to-home bonus
      if (request.routeToHome && request.driverHomeLat && request.driverHomeLng) {
        const milesSaved = this.haversine(load.destination.lat, load.destination.lng, request.driverHomeLat, request.driverHomeLng);
        const currentHomeDist = this.haversine(currentLat, currentLng, request.driverHomeLat, request.driverHomeLng);
        if (milesSaved < currentHomeDist) {
          score += 10; // Route home bonus
        }
      }

      matches.push({
        load,
        score: Math.round(score),
        driverId,
        driverName: '', // Populated from driver profile
        deadheadMiles: Math.round(deadheadMiles),
        deadheadMinutes: Math.round(deadheadMinutes),
        driverHosRemaining: driverHosMinutesRemaining,
        arrivalAtPickup,
        revenuePerHour: Math.round(revenuePerHour * 100) / 100,
        isFeasible: hosFeasible,
        reason: hosFeasible ? undefined : `Requires ${Math.round(totalDriveMinutes)} min drive, driver has ${driverHosMinutesRemaining} min remaining`,
      });
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Cache for 5 minutes
    await this.redis.set(`backhaul:${driverId}`, matches.slice(0, 10), 300);

    this.logger.log(`Found ${matches.length} backhaul options for driver ${driverId}`);
    return matches.slice(0, 20);
  }

  /**
   * Auto-suggest backhauls after delivery
   * Called when a load is marked delivered
   */
  async autoSuggestAfterDelivery(driverId: string, deliveryLocation: { lat: number; lng: number }, deliveryTime: Date): Promise<BackhaulMatch[]> {
    // Get driver's current HOS from ELD
    // In production: look up carrierId from driver profile
    const hosRemaining = 480; // 8 hours placeholder

    return this.findBackhauls({
      driverId,
      currentLat: deliveryLocation.lat,
      currentLng: deliveryLocation.lng,
      deliveryTime,
      driverHosMinutesRemaining: hosRemaining,
    });
  }

  /**
   * Send push notification with top backhaul options
   */
  async notifyDriverOfBackhauls(driverId: string): Promise<void> {
    const cached = await this.redis.get<BackhaulMatch[]>(`backhaul:${driverId}`);
    if (!cached || cached.length === 0) return;

    const top = cached[0];
    this.logger.log(`Notifying driver ${driverId}: ${cached.length} backhauls, best: ${top.load.origin.city}→${top.load.destination.city} @ $${top.load.ratePerMile}/mi (${top.deadheadMiles}mi deadhead)`);

    this.logger.warn('Push notification delivery not configured — backhaul alert logged only');
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
