import type { LucideIcon } from 'lucide-react';
import { Boxes, MapPinned, Route, Send, Truck, Warehouse } from 'lucide-react';

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
      'Regional freight benefits from verified carriers, dispatch oversight, ETA visibility, and documentation that stays attached to the shipment.',
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
