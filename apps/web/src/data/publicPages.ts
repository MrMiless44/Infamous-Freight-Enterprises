import type { LucideIcon } from 'lucide-react';
import { Boxes, Container, MapPinned, Route, Send, Snowflake, Truck, Warehouse, Zap } from 'lucide-react';

export type ServicePage = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  Icon: LucideIcon;
  bullets: string[];
  bestFor: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: 'full-truckload',
    title: 'Full Truckload (FTL)',
    eyebrow: 'Dedicated capacity',
    summary: 'Full truckload freight for shipments that fill an entire trailer — dry van, flatbed, or reefer.',
    description:
      'Full truckload is the right choice when your freight fills or nearly fills a 53-foot trailer. Shipment details are verified before booking so equipment, timing, and route expectations are clear before dispatch.',
    Icon: Truck,
    bullets: ['Dedicated trailer planning for larger freight', 'Direct pickup and delivery coordination', 'Dry van, flatbed, and reefer options', 'Carrier documents reviewed before dispatch'],
    bestFor: ['Large volume shipments', 'Time-sensitive full loads', 'High-value freight', 'Consistent lane commitments'],
  },
  {
    slug: 'ltl-freight',
    title: 'Less Than Truckload (LTL)',
    eyebrow: 'Shared capacity',
    summary: 'LTL freight for palletized shipments that don\'t need an entire trailer.',
    description:
      'Less than truckload lets you share trailer space with other shippers, reducing cost for smaller shipments while still getting the tracking and proof of delivery you need.',
    Icon: Boxes,
    bullets: ['Cost-effective for partial loads', 'Palletized freight coordination', 'Tracking and status updates included', 'Proof of delivery on every shipment'],
    bestFor: ['1-10 pallet shipments', 'Budget-conscious freight', 'Retail distribution', 'Recurring partial loads'],
  },
  {
    slug: 'flatbed',
    title: 'Flatbed freight',
    eyebrow: 'Open-deck trailers',
    summary: 'Flatbed freight for oversized, heavy, or irregularly shaped loads that can\'t fit in enclosed trailers.',
    description:
      'Flatbed trailers provide open-deck capacity for construction materials, machinery, steel, lumber, and other freight that requires top or side loading. Tarping and securement coordinated.',
    Icon: Container,
    bullets: ['Open-deck and step-deck options', 'Oversize and heavy haul coordination', 'Tarping, chains, and securement included', 'Permit coordination for oversized loads'],
    bestFor: ['Construction materials', 'Heavy machinery', 'Steel and lumber', 'Oversized equipment'],
  },
  {
    slug: 'reefer',
    title: 'Reefer freight',
    eyebrow: 'Temperature-controlled',
    summary: 'Temperature-controlled freight for perishable goods, pharmaceuticals, and anything requiring climate management.',
    description:
      'Reefer trailers maintain precise temperatures throughout transit. Continuous monitoring, temperature logs, and compliance documentation included on every load.',
    Icon: Snowflake,
    bullets: ['Temperature requirements documented before booking', 'Transit updates coordinated through delivery', 'Handling notes reviewed with pickup details', 'Delivery documentation collected when available'],
    bestFor: ['Perishable food products', 'Pharmaceutical shipments', 'Frozen goods', 'Temperature-sensitive materials'],
  },
  {
    slug: 'expedited',
    title: 'Expedited freight',
    eyebrow: 'Time-critical',
    summary: 'Expedited freight for urgent shipments that need same-day or next-day delivery with priority handling.',
    description:
      'When time matters more than cost, expedited freight gets your shipment moving immediately. Dedicated equipment, direct routes, and real-time tracking from pickup to delivery.',
    Icon: Zap,
    bullets: ['Same-day and next-day options', 'Dedicated driver and equipment', 'Direct routing — no stops', 'Priority dispatch and real-time tracking'],
    bestFor: ['Production line shutdowns', 'Emergency parts delivery', 'Medical supplies', 'Time-critical documents'],
  },
  {
    slug: 'dedicated-lanes',
    title: 'Dedicated lanes',
    eyebrow: 'Recurring freight',
    summary: 'Dedicated lane freight for recurring routes with planned capacity, documented pricing, and consistent handoffs.',
    description:
      'Dedicated lanes help recurring freight move with fewer surprises. Lane details, payment terms, capacity expectations, and communication steps are confirmed in writing before dispatch.',
    Icon: Route,
    bullets: ['Written rate and service expectations', 'Recurring lane and equipment notes', 'Capacity planning for known schedules', 'Shipment notes reviewed before each move'],
    bestFor: ['Weekly recurring freight', 'Distribution center lanes', 'Manufacturing supply chains', 'Retail replenishment routes'],
  },
  {
    slug: 'freight-brokerage',
    title: 'Freight brokerage',
    eyebrow: 'Full-service',
    summary: 'Freight brokerage support for matching shipment details with available carrier capacity.',
    description:
      'Freight brokerage support starts with clear intake: lane, equipment, timing, freight details, and written rate confirmation before the load is booked.',
    Icon: Warehouse,
    bullets: ['Shipment details verified before booking', 'Carrier documents reviewed before dispatch', 'Rate and payment terms confirmed in writing', 'Clear communication from quote to delivery'],
    bestFor: ['Shippers without carrier relationships', 'Overflow capacity needs', 'New market or lane coverage', 'Seasonal freight surges'],
  },
  {
    slug: 'final-mile',
    title: 'Final mile delivery',
    eyebrow: 'Last-mile logistics',
    summary: 'Final mile delivery for the last leg of shipment from distribution center to end customer or retail location.',
    description:
      'Final mile delivery handles the most visible part of the supply chain — getting freight from a hub, warehouse, or distribution center to the final destination with scheduling and proof of delivery.',
    Icon: MapPinned,
    bullets: ['Delivery window scheduling', 'White glove and inside delivery options', 'Photo proof of delivery', 'Customer notification and ETA updates'],
    bestFor: ['E-commerce deliveries', 'Retail store replenishment', 'Furniture and appliance delivery', 'B2B last-mile freight'],
  },
  {
    slug: 'amazon-delivery',
    title: 'Amazon delivery integration',
    eyebrow: 'MCF and shipping orchestration',
    summary: 'Amazon delivery workflow planning for routing eligible orders through Amazon fulfillment and shipping services.',
    description:
      'Amazon delivery integration helps connect Infamous Freight order intake, inventory context, rate review, label generation, tracking, and customer updates with Amazon logistics workflows where the shipper has approved access.',
    Icon: Warehouse,
    bullets: [
      'Inventory and fulfillment-center availability review',
      'Order routing rules for local carrier or Amazon fulfillment paths',
      'Shipping rate, label, and tracking workflow planning',
      'Status update intake for dispatcher and customer visibility',
    ],
    bestFor: ['Multi-channel sellers', 'E-commerce fulfillment', 'Parcel and final-mile routing', 'Shipper operations teams'],
  },
  {
    slug: 'box-truck',
    title: 'Box truck freight',
    eyebrow: '16 to 26 ft capacity',
    summary: 'Local and regional box truck freight for pallets, retail replenishment, equipment, and scheduled business deliveries.',
    description:
      'Box truck freight is a strong fit when a full tractor-trailer is too much but the load still needs professional pickup, delivery windows, tracking, and proof of delivery.',
    Icon: Truck,
    bullets: ['Liftgate and dock delivery coordination', 'Scheduled pickup and delivery windows', 'Palletized retail and commercial freight', 'Proof of delivery and shipment notes'],
    bestFor: ['Retail replenishment', 'Commercial equipment', 'Warehouse transfers', 'Local and regional lanes'],
  },
  {
    slug: 'cargo-van',
    title: 'Cargo van freight',
    eyebrow: 'Fast small freight',
    summary: 'Cargo van freight for urgent small shipments, parts, documents, samples, and lightweight commercial freight.',
    description:
      'Cargo vans are ideal for lighter freight that needs direct pickup, direct delivery, and fewer touches than standard parcel networks.',
    Icon: Send,
    bullets: ['Direct pickup and delivery', 'Small freight and parts movement', 'Same-day and scheduled options', 'Status updates through delivery'],
    bestFor: ['Parts runs', 'Small business freight', 'Medical or retail supplies', 'Hotshot local moves'],
  },
  {
    slug: 'sprinter-van',
    title: 'Sprinter van freight',
    eyebrow: 'Expedited light freight',
    summary: 'Sprinter van capacity for time-sensitive shipments that need more room than a cargo van without the cost of a box truck.',
    description:
      'Sprinter vans bridge the gap between cargo van and box truck. They are useful for expedited shipments, longer local lanes, and lightweight pallet freight.',
    Icon: Route,
    bullets: ['Flexible cargo space', 'Expedited regional movement', 'Fewer handling points', 'Driver and shipment visibility'],
    bestFor: ['Expedited freight', 'Light palletized shipments', 'Regional same-day lanes', 'Trade show or event freight'],
  },
  {
    slug: 'local-freight',
    title: 'Local freight',
    eyebrow: 'Metro and short-haul',
    summary: 'Local freight support for same-city, metro-area, and short-distance commercial deliveries.',
    description:
      'Local freight requires tight communication, clean pickup details, and reliable proof. Infamous Freight organizes the request, driver assignment, tracking, and POD in one workflow.',
    Icon: MapPinned,
    bullets: ['Same-city and metro delivery', 'Pickup and delivery window coordination', 'Driver status updates', 'POD collection and follow-up'],
    bestFor: ['Local business delivery', 'Warehouse moves', 'Retail replenishment', 'Scheduled routes'],
  },
  {
    slug: 'regional-freight',
    title: 'Regional freight',
    eyebrow: 'Multi-city lanes',
    summary: 'Regional freight for shipments moving between cities, distribution points, warehouses, and customer locations.',
    description:
      'Regional freight benefits from clear lane details, dispatch oversight, ETA communication, and documentation that stays attached to the shipment.',
    Icon: Warehouse,
    bullets: ['City-to-city freight moves', 'Carrier fit and equipment coordination', 'ETA and exception tracking', 'POD and invoice support'],
    bestFor: ['Distribution lanes', 'Manufacturing moves', 'Retail supply chains', 'Recurring freight'],
  },
  {
    slug: 'freight-dispatch',
    title: 'Freight dispatch support',
    eyebrow: 'Ops workflow',
    summary: 'Dispatch workflow support for quotes, assignments, load visibility, PODs, and follow-up.',
    description:
      'Freight dispatch is where details turn into execution. The platform keeps quotes, lane data, driver assignment, tracking, and delivery proof organized so fewer things fall through the cracks.',
    Icon: Boxes,
    bullets: ['Quote-to-dispatch workflow', 'Load assignment and follow-up', 'Exception visibility', 'Document and POD organization'],
    bestFor: ['Dispatch teams', 'Small fleets', 'Brokerage operations', 'Shipper support desks'],
  },
];

export const findServicePage = (slug?: string): ServicePage | undefined =>
  servicePages.find((service) => service.slug === slug);
