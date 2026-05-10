export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
  sections: { heading: string; body: string }[];
  relatedLinks: { label: string; href: string }[];
};

export const resourceArticles: ResourceArticle[] = [
  {
    slug: 'ltl-vs-ftl-freight',
    title: 'LTL vs FTL Freight: How to Choose the Right Option',
    description:
      'Understand the differences between less-than-truckload and full truckload freight, when each makes sense, and how to decide based on shipment size, budget, and timeline.',
    readTime: '6 min read',
    category: 'Freight Basics',
    sections: [
      {
        heading: 'What is FTL freight?',
        body: 'Full truckload (FTL) freight means your shipment fills an entire trailer — or you are paying for exclusive use of the trailer regardless of how much space you actually need. FTL is the standard choice when the shipment is large enough to justify a dedicated truck, when the cargo is fragile and benefits from fewer handling points, or when the delivery timeline is tight. FTL loads move directly from origin to destination with no intermediate terminals or transfers. This reduces transit time and the risk of damage from extra touches. Most box truck, cargo van, and sprinter van freight falls into the FTL category because the vehicle is assigned to your load specifically.',
      },
      {
        heading: 'What is LTL freight?',
        body: 'Less-than-truckload (LTL) freight combines shipments from multiple shippers onto a single trailer. This brings the per-shipment cost down because you only pay for the space your freight occupies rather than the whole vehicle. LTL carriers pick up freight from several locations, consolidate it at a terminal, and sort it onto outbound trailers headed toward each destination. The tradeoff is that transit times are longer and there are more handling points — your freight gets loaded and unloaded multiple times. LTL typically makes sense for shipments between 150 and 10,000 pounds that are palletized and can withstand being handled alongside other freight.',
      },
      {
        heading: 'Cost comparison',
        body: 'FTL pricing is based on mileage, equipment type, fuel, and market conditions for the lane. You pay a flat rate for the truck regardless of whether it is fully loaded. LTL pricing uses freight class, weight, dimensions, origin/destination zip codes, and accessorial charges. For shipments under 5,000 pounds moving standard freight class goods on common lanes, LTL is almost always cheaper. Once a shipment approaches 8,000–10,000 pounds or fills more than half a trailer, FTL rates often become competitive because LTL carriers apply significant weight-break surcharges at that volume.',
      },
      {
        heading: 'Transit time and reliability',
        body: 'FTL shipments move point to point. A 500-mile lane might deliver next day. The same lane via LTL could take 3–5 business days because the freight passes through one or more terminals. If your freight is time-sensitive — production parts, retail replenishment with store windows, or event materials — FTL provides a predictable timeline that LTL cannot match. LTL reliability has improved in recent years with better tracking and fewer service failures, but terminal processing still introduces variability that direct FTL routes avoid.',
      },
      {
        heading: 'When to use each option',
        body: 'Choose FTL when your freight fills or nearly fills a truck, when delivery timing is critical, when the cargo is fragile or high-value, or when you need a dedicated vehicle for security or compliance reasons. Choose LTL when the shipment is under 6,000 pounds, when you have flexible delivery windows, when cost savings outweigh speed, and when the freight is properly palletized and classified. Many shippers use both: LTL for routine smaller replenishment shipments and FTL for larger orders, time-critical moves, or lanes where LTL service is unreliable.',
      },
    ],
    relatedLinks: [
      { label: 'Request a freight quote', href: '/request-quote' },
      { label: 'Box truck freight services', href: '/services/box-truck' },
      { label: 'Regional freight services', href: '/services/regional-freight' },
    ],
  },
  {
    slug: 'box-truck-shipping-guide',
    title: 'Complete Guide to Box Truck Freight Shipping',
    description:
      'Everything shippers need to know about box truck freight: capacity, pricing, best use cases, and how to book reliable box truck delivery for commercial shipments.',
    readTime: '7 min read',
    category: 'Equipment Guides',
    sections: [
      {
        heading: 'What is a box truck?',
        body: 'A box truck is a straight truck with an enclosed cargo area attached directly to the cab. Unlike a tractor-trailer combination, a box truck is a single vehicle that does not articulate. Standard box trucks range from 12 to 26 feet in length, with 16-foot and 26-foot being the most common sizes in commercial freight. The 26-foot box truck is the most widely used in last-mile, local, and regional freight because it offers roughly 1,800 cubic feet of cargo space and can carry 10,000–12,000 pounds while remaining under the CDL weight threshold in most configurations.',
      },
      {
        heading: 'Box truck capacity and dimensions',
        body: 'A standard 26-foot box truck has an interior length of approximately 26 feet, a width of 8 feet, and a height of 8 feet. This translates to about 1,700–1,800 cubic feet of cargo space. Most 26-foot box trucks can handle 10 to 12 standard pallets loaded side by side. Weight capacity typically ranges from 10,000 to 12,000 pounds depending on the specific vehicle configuration. A 16-foot box truck offers roughly 800 cubic feet and fits 4–6 pallets. Equipment options include liftgate, ramp, pallet jack, and E-track tie-downs.',
      },
      {
        heading: 'Common use cases',
        body: 'Box trucks are the workhorse of commercial freight for mid-size shipments. Retail stores use them for replenishment deliveries that are too large for parcel but do not need a full 53-foot trailer. Office and commercial moves rely on box trucks for equipment, furniture, and supplies. Warehouse-to-warehouse transfers use box trucks for inventory redistribution within a metro area or region. Manufacturing operations use box trucks for parts delivery, finished goods distribution, and vendor pickups. E-commerce fulfillment centers use box trucks for zone-skip and consolidation shipments.',
      },
      {
        heading: 'How box truck pricing works',
        body: 'Box truck freight pricing depends on distance, weight, delivery requirements, and market conditions. Local moves (under 50 miles) are typically priced as a flat rate or hourly rate. Regional moves (50–500 miles) are priced per mile, usually between $2.50 and $5.00 per mile depending on the lane, season, and equipment. Accessorial charges apply for liftgate service, residential delivery, inside delivery, appointment scheduling, and wait time beyond standard free time. Getting an accurate quote requires providing pickup and delivery addresses, freight weight and dimensions, required equipment, and timing.',
      },
      {
        heading: 'How to book box truck freight',
        body: 'Start by gathering your shipment details: origin and destination addresses, freight weight and dimensions, number of pallets or pieces, any special handling requirements, and your preferred pickup and delivery dates. Submit these details through a freight quote request. A dispatch team will match your shipment with a verified carrier who has the right equipment and availability for your lane. Once a carrier is confirmed, you will receive booking confirmation with driver details, a tracking reference, and pickup instructions. After delivery, proof of delivery is captured and available for your records.',
      },
    ],
    relatedLinks: [
      { label: 'Box truck freight services', href: '/services/box-truck' },
      { label: 'Request a freight quote', href: '/request-quote' },
      { label: 'Cargo van vs sprinter van', href: '/resources/cargo-van-vs-sprinter-van' },
    ],
  },
  {
    slug: 'what-is-freight-dispatch',
    title: 'What Is Freight Dispatch? A Complete Guide',
    description:
      'Learn what freight dispatchers do, how dispatch operations work, the tools and workflows involved, and how dispatch support helps fleets and owner-operators move freight efficiently.',
    readTime: '8 min read',
    category: 'Industry Knowledge',
    sections: [
      {
        heading: 'What does a freight dispatcher do?',
        body: 'A freight dispatcher coordinates the movement of freight from shipper to consignee. This involves finding available loads that match a carrier\'s equipment and lane preferences, negotiating rates with brokers or shippers, scheduling pickups and deliveries, communicating updates to all parties, and handling exceptions when things go wrong. Dispatchers serve as the operational bridge between the driver on the road and the customers or brokers who need freight moved. The role requires knowledge of freight markets, equipment types, regulatory requirements, and strong communication skills.',
      },
      {
        heading: 'How dispatch operations work',
        body: 'Dispatch operations follow a repeating cycle: load sourcing, rate negotiation, carrier assignment, execution monitoring, and post-delivery follow-up. Load sourcing involves reviewing available freight from load boards, broker relationships, and direct shipper contracts. Rate negotiation compares the offered rate against current market conditions, fuel costs, deadhead miles, and the carrier\'s operating expenses. Once a rate is agreed, the dispatcher assigns the load to a specific driver and vehicle, sends dispatch instructions, and confirms the pickup appointment. During transit, the dispatcher monitors check calls, tracks ETAs, and addresses detention, lumper fees, or routing changes.',
      },
      {
        heading: 'Dispatch tools and technology',
        body: 'Modern dispatch operations rely on technology to reduce manual work and improve accuracy. Transportation management systems (TMS) centralize load information, carrier data, and customer records. Load board integrations surface available freight matching carrier preferences. Rate intelligence tools show current market rates for specific lanes and equipment types. GPS and ELD integrations provide real-time driver location without manual check calls. Document management systems capture rate confirmations, bills of lading, proof of delivery, and invoices in one place. Communication tools coordinate updates between dispatchers, drivers, brokers, and shippers.',
      },
      {
        heading: 'Independent dispatch vs. in-house dispatch',
        body: 'Owner-operators and small fleets face a choice between handling their own dispatch, hiring an in-house dispatcher, or contracting with an independent dispatch service. Self-dispatch gives the carrier full control but takes time away from driving and requires constant load board monitoring and rate negotiation. In-house dispatch adds a dedicated team member but carries fixed payroll costs regardless of volume. Independent dispatch services operate on a percentage of the load revenue — typically 5–10% — and bring established broker relationships, market knowledge, and operational systems. The right choice depends on fleet size, volume consistency, and whether the owner-operator prefers to focus on driving or operations.',
      },
      {
        heading: 'How to improve dispatch efficiency',
        body: 'The most common dispatch bottlenecks are manual data entry, scattered communication, and poor visibility into driver status. Improving dispatch efficiency starts with centralizing load information so dispatchers are not switching between spreadsheets, emails, and phone notes. Automating repetitive tasks like check-call scheduling, document requests, and status updates frees dispatchers to focus on rate negotiation and exception management. Standardizing the quote-to-dispatch workflow reduces errors from inconsistent intake processes. Finally, maintaining organized records for every load — from initial quote through delivery and payment — prevents the information gaps that cause disputes and delays.',
      },
    ],
    relatedLinks: [
      { label: 'Freight dispatch services', href: '/services/freight-dispatch' },
      { label: 'Apply to drive', href: '/drive' },
      { label: 'LTL vs FTL freight', href: '/resources/ltl-vs-ftl-freight' },
    ],
  },
  {
    slug: 'freight-tracking-explained',
    title: 'How Real-Time Freight Tracking Works',
    description:
      'Learn how freight tracking technology provides real-time visibility into shipment status, ETAs, proof of delivery, and exception alerts throughout the transportation lifecycle.',
    readTime: '5 min read',
    category: 'Technology',
    sections: [
      {
        heading: 'Why freight tracking matters',
        body: 'Freight visibility has become a baseline expectation for shippers, receivers, and logistics teams. When a shipment is in transit, the people responsible for it need to know where it is, when it will arrive, and whether anything has gone wrong. Without tracking, teams rely on phone calls and manual check-ins that are time-consuming and often inaccurate. Real-time tracking reduces "where is my shipment" calls, enables proactive exception management, improves delivery scheduling at receiving facilities, and provides documentation for billing and dispute resolution.',
      },
      {
        heading: 'How tracking technology works',
        body: 'Modern freight tracking combines GPS location data, electronic logging device (ELD) telemetry, driver status updates, and system event triggers. GPS and ELD devices on the truck report location at regular intervals — typically every 5 to 15 minutes. These location updates are processed against the planned route to calculate estimated arrival times. Driver-initiated status updates mark key milestones: arrived at pickup, loaded, departed, arrived at delivery, unloaded. System events capture proof-of-delivery signatures, photos, and exception notes. All of these data points feed into a tracking timeline that stakeholders can view without calling the driver or dispatcher.',
      },
      {
        heading: 'Key tracking milestones',
        body: 'A complete freight tracking timeline includes these events: load tendered and accepted, driver assigned, en route to pickup, arrived at pickup, loading complete and departed, in transit checkpoints, arrived at delivery, delivery complete with proof of delivery captured. Each milestone updates the shipment status and recalculates the ETA. Exception events — detention at pickup or delivery, route deviation, mechanical issues, weather delays — are flagged and timestamped so operations teams can respond before small problems become large ones.',
      },
      {
        heading: 'Proof of delivery',
        body: 'Proof of delivery (POD) is the documentation that confirms freight was delivered to the correct location in acceptable condition. Traditional POD is a signed paper bill of lading that the driver returns to the carrier. Digital POD captures the same information electronically: delivery timestamp, GPS location at delivery, receiver signature on a mobile device, and photographs of the freight at the point of delivery. Digital POD eliminates the delays and disputes that come from lost or illegible paper documents and makes the delivery record immediately available to all parties.',
      },
    ],
    relatedLinks: [
      { label: 'Track a shipment', href: '/track-shipment' },
      { label: 'Local freight services', href: '/services/local-freight' },
      { label: 'What is freight dispatch?', href: '/resources/what-is-freight-dispatch' },
    ],
  },
  {
    slug: 'cargo-van-vs-sprinter-van',
    title: 'Cargo Van vs Sprinter Van: Which Is Right for Your Freight?',
    description:
      'Compare cargo van and sprinter van freight options side by side — capacity, cost, speed, and best use cases — to decide which vehicle fits your shipment.',
    readTime: '5 min read',
    category: 'Equipment Guides',
    sections: [
      {
        heading: 'Cargo van overview',
        body: 'A cargo van is a standard full-size van (like a Ford Transit, RAM ProMaster, or Chevrolet Express) with the rear passenger area converted to open cargo space. Cargo vans typically offer 200–400 cubic feet of interior space and can carry 2,500–4,000 pounds depending on the model. They are the fastest and most cost-effective option for small, urgent freight. Cargo vans excel at same-day delivery, parts runs, medical supply transport, document courier service, and any shipment that is too time-sensitive or too small for standard freight carriers.',
      },
      {
        heading: 'Sprinter van overview',
        body: 'A sprinter van refers to the Mercedes-Benz Sprinter or similar high-roof, extended-length commercial vans. Sprinter vans offer 300–600 cubic feet of cargo space and can carry 3,500–5,500 pounds. The higher roof and longer wheelbase provide significantly more usable space than a standard cargo van, allowing taller items and light pallets to fit. Sprinter vans bridge the gap between cargo vans and box trucks, making them ideal for shipments that are too large for a standard van but do not need a full box truck.',
      },
      {
        heading: 'Capacity comparison',
        body: 'The main difference is interior volume and weight capacity. A standard cargo van maxes out around 400 cubic feet and 4,000 pounds. A sprinter van can reach 600 cubic feet and 5,500 pounds. If your freight is a few boxes, a small parts order, or document pouches, a cargo van is the right tool. If you are moving a pallet, trade show booth, multiple large packages, or anything that needs headroom, the sprinter van is the better fit. Both vehicles fit in standard parking spaces and loading docks, unlike box trucks which may face access restrictions at some delivery locations.',
      },
      {
        heading: 'Cost comparison',
        body: 'Cargo van rates are the lowest in the expedited freight category because operating costs are minimal — fuel efficiency is better, insurance is cheaper, and most cargo van drivers do not need a CDL. Sprinter van rates run 10–25% higher than cargo van rates on the same lane because the vehicle costs more to operate and maintain. However, sprinter rates are still significantly less than box truck rates. If a cargo van can handle your shipment, it will always be the cheaper option. The sprinter van makes sense when the freight physically does not fit in a cargo van but a box truck would be overkill.',
      },
      {
        heading: 'Best use cases for each',
        body: 'Choose a cargo van for: parts runs under 100 pounds, same-day courier and document delivery, medical supply transport, small retail restocks, and any urgent small freight where speed matters most. Choose a sprinter van for: trade show materials and booth setups, light pallet freight (1–2 pallets), regional same-day freight that needs more space, multiple large packages or crates, and expedited shipments where cargo van capacity is insufficient but box truck cost is unnecessary.',
      },
    ],
    relatedLinks: [
      { label: 'Cargo van freight services', href: '/services/cargo-van' },
      { label: 'Sprinter van freight services', href: '/services/sprinter-van' },
      { label: 'Box truck shipping guide', href: '/resources/box-truck-shipping-guide' },
    ],
  },
];

export const findArticle = (slug?: string): ResourceArticle | undefined =>
  resourceArticles.find((a) => a.slug === slug);
