/**
 * RECOMMENDATION: Samsara ELD Integration
 * #1 ELD provider - 20,000+ customers
 * Automatic GPS tracking, HOS compliance, vehicle diagnostics
 */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

const SAMSARA_BASE_URL = 'https://api.samsara.com';

@Injectable()
export class SamsaraService {
  private apiToken: string;

  constructor(private readonly httpService: HttpService) {
    this.apiToken = process.env.SAMSARA_API_TOKEN || '';
  }

  // Get all vehicles
  async getVehicles() {
    const response = await lastValueFrom(
      this.httpService.get(`${SAMSARA_BASE_URL}/fleet/vehicles`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      })
    );
    return response.data;
  }

  // Get vehicle locations (GPS tracking)
  async getVehicleLocations(vehicleIds?: string[]) {
    const params = vehicleIds ? { vehicleIds: vehicleIds.join(',') } : {};
    const response = await lastValueFrom(
      this.httpService.get(`${SAMSARA_BASE_URL}/fleet/vehicles/locations`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        params,
      })
    );
    return response.data;
  }

  // Get HOS (Hours of Service) clocks
  async getHOSClocks(driverIds?: string[]) {
    const params = driverIds ? { driverIds: driverIds.join(',') } : {};
    const response = await lastValueFrom(
      this.httpService.get(`${SAMSARA_BASE_URL}/fleet/hos/clocks`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        params,
      })
    );
    return response.data;
  }

  // Get vehicle stats (speed, fuel, etc.)
  async getVehicleStats(vehicleIds?: string[]) {
    const params = vehicleIds ? { vehicleIds: vehicleIds.join(',') } : {};
    const response = await lastValueFrom(
      this.httpService.get(`${SAMSARA_BASE_URL}/fleet/vehicles/stats`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        params,
      })
    );
    return response.data;
  }

  // Get driver safety scores
  async getSafetyScores(driverIds?: string[], startTime?: string, endTime?: string) {
    const params: any = {};
    if (driverIds) params.driverIds = driverIds.join(',');
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const response = await lastValueFrom(
      this.httpService.get(`${SAMSARA_BASE_URL}/fleet/drivers/safety-scores`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        params,
      })
    );
    return response.data;
  }

  // Create dispatch route
  async createDispatchRoute(routeData: {
    name: string;
    driverId: string;
    vehicleId: string;
    stops: Array<{
      address: string;
      latitude: number;
      longitude: number;
      scheduledDepartureTime: string;
    }>;
  }) {
    const response = await lastValueFrom(
      this.httpService.post(
        `${SAMSARA_BASE_URL}/fleet/dispatch/routes`,
        routeData,
        {
          headers: { Authorization: `Bearer ${this.apiToken}` },
        }
      )
    );
    return response.data;
  }

  // Get route progress
  async getRouteProgress(routeId: string) {
    const response = await lastValueFrom(
      this.httpService.get(`${SAMSARA_BASE_URL}/fleet/dispatch/routes/${routeId}`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      })
    );
    return response.data;
  }

  // Webhook handler for Samsara events
  async handleWebhook(event: any) {
    switch (event.eventType) {
      case 'VehicleLocationUpdate':
        await this.handleLocationUpdate(event);
        break;
      case 'HosClockUpdate':
        await this.handleHOSUpdate(event);
        break;
      case 'SafetyEvent':
        await this.handleSafetyEvent(event);
        break;
      case 'VehicleFaultCode':
        await this.handleFaultCode(event);
        break;
      default:
        break;
    }
  }

  private async handleLocationUpdate(event: any) {
    // Update vehicle position in database
    // Trigger exception engine checks
  }

  private async handleHOSUpdate(event: any) {
    // Alert dispatch if driver approaching limit
    // Update driver status in dashboard
  }

  private async handleSafetyEvent(event: any) {
    // Log safety incident
    // Update driver safety score
    // Alert fleet manager
  }

  private async handleFaultCode(event: any) {
    // Create maintenance alert
    // Notify maintenance team
  }
}
