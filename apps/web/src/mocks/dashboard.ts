export interface ActiveLoad {
  ref: string;
  origin: string;
  destination: string;
  carrier: string;
  status: string;
  statusLabel: string;
  eta: string;
  rate: string;
  equipment: string;
  weight: string;
  miles: string;
  driver: string;
  phone: string;
  pickupDate: string;
  deliveryDate: string;
  docStatus: { bol: boolean; pod: boolean; rateCon: boolean; invoice: boolean };
  margin: string;
}

export interface DeliveryStatusSeed {
  label: string;
  count: number;
  color: string;
  textColor: string;
}

export interface AlertSeed {
  id: number;
  severity: 'critical' | 'warning' | 'info' | 'resolved';
  message: string;
  time: string;
}

export interface DashboardMetricSeed {
  label: string;
  value: string;
  tone: 'red' | 'green';
}

export const mockActiveLoads: ActiveLoad[] = [
  { ref: 'IF-77391', origin: 'Atlanta, GA', destination: 'Dallas, TX', carrier: 'Swift Logistics', status: 'in_transit', statusLabel: 'In Transit', eta: '6:30 PM', rate: '$3,200', equipment: 'Dry Van', weight: '38,000 lbs', miles: '781 mi', driver: 'Marcus Johnson', phone: '(404) 555-0192', pickupDate: 'May 9, 2026', deliveryDate: 'May 10, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$480' },
  { ref: 'IF-77392', origin: 'Chicago, IL', destination: 'Memphis, TN', carrier: 'Road Runner Inc.', status: 'at_pickup', statusLabel: 'At Pickup', eta: '4:00 PM', rate: '$1,850', equipment: 'Reefer', weight: '22,000 lbs', miles: '530 mi', driver: 'James Wright', phone: '(312) 555-0234', pickupDate: 'May 10, 2026', deliveryDate: 'May 11, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$310' },
  { ref: 'IF-77393', origin: 'Houston, TX', destination: 'Phoenix, AZ', carrier: 'Desert Haul Co.', status: 'exception', statusLabel: 'Delayed', eta: 'TBD', rate: '$4,100', equipment: 'Flatbed', weight: '44,000 lbs', miles: '1,178 mi', driver: 'Carlos Rivera', phone: '(713) 555-0187', pickupDate: 'May 8, 2026', deliveryDate: 'May 11, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$615' },
  { ref: 'IF-77394', origin: 'Los Angeles, CA', destination: 'Seattle, WA', carrier: 'Pacific Freight', status: 'in_transit', statusLabel: 'In Transit', eta: '11:00 PM', rate: '$2,900', equipment: 'Dry Van', weight: '32,000 lbs', miles: '1,135 mi', driver: 'Sarah Chen', phone: '(213) 555-0145', pickupDate: 'May 9, 2026', deliveryDate: 'May 11, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$420' },
  { ref: 'IF-77395', origin: 'Miami, FL', destination: 'Atlanta, GA', carrier: 'Southeast Express', status: 'delivered', statusLabel: 'Delivered', eta: 'Complete', rate: '$1,450', equipment: 'Box Truck', weight: '12,000 lbs', miles: '662 mi', driver: 'David Moore', phone: '(305) 555-0198', pickupDate: 'May 8, 2026', deliveryDate: 'May 9, 2026', docStatus: { bol: true, pod: true, rateCon: true, invoice: true }, margin: '$225' },
  { ref: 'IF-77396', origin: 'Nashville, TN', destination: 'Indianapolis, IN', carrier: 'Midwest Haul', status: 'pickup_scheduled', statusLabel: 'Pickup Scheduled', eta: '2:00 PM', rate: '$1,200', equipment: 'Dry Van', weight: '18,000 lbs', miles: '290 mi', driver: 'Tony Patel', phone: '(615) 555-0173', pickupDate: 'May 10, 2026', deliveryDate: 'May 10, 2026', docStatus: { bol: false, pod: false, rateCon: true, invoice: false }, margin: '$180' },
];

export const deliveryStatuses: DeliveryStatusSeed[] = [
  { label: 'In Transit', count: 87, color: 'bg-infamous-red-light', textColor: 'text-infamous-red-light' },
  { label: 'At Pickup', count: 14, color: 'bg-infamous-ember', textColor: 'text-infamous-ember' },
  { label: 'Delivered', count: 41, color: 'bg-infamous-green', textColor: 'text-infamous-green' },
  { label: 'Delayed', count: 8, color: 'bg-infamous-orange', textColor: 'text-infamous-orange' },
  { label: 'Pickup Scheduled', count: 12, color: 'bg-infamous-muted', textColor: 'text-infamous-muted' },
];

export const alerts: AlertSeed[] = [
  { id: 1, severity: 'critical', message: 'IF-77393 delayed — ETA shift pending carrier update', time: '12 min ago' },
  { id: 2, severity: 'warning', message: 'IF-77396 pickup appointment in 90 minutes — no driver check-in', time: '25 min ago' },
  { id: 3, severity: 'info', message: 'IF-77395 POD uploaded — invoice ready for review', time: '1 hr ago' },
  { id: 4, severity: 'resolved', message: 'IF-77391 ETA confirmed — on schedule for 6:30 PM delivery', time: '2 hr ago' },
];

export const dashboardMetricSeeds: DashboardMetricSeed[] = [
  { label: 'Active Loads', value: '128', tone: 'red' },
  { label: 'In Transit', value: '87', tone: 'red' },
  { label: 'Available Drivers', value: '34', tone: 'green' },
  { label: 'On-Time Rate', value: '96.2%', tone: 'green' },
  { label: 'Revenue MTD', value: '$2.4M', tone: 'red' },
];
