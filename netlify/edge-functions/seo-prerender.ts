import type { Context, Config } from '@netlify/edge-functions';

const SITE_URL = 'https://www.infamousfreight.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const BRAND_NAME = 'Infamous Freight';
const OG_IMAGE_ALT = 'Infamous Freight AI Freight Command Center';

type SeoEntry = { title: string; description: string };

const SEO: Record<string, SeoEntry> = {
  '/': {
    title: 'Infamous Freight — AI Freight Operating System',
    description:
      'Run dispatch, visibility, and carrier operations from one AI-powered operating system built for modern fleets.',
  },
  '/request-quote': {
    title: 'Request a Freight Quote | Infamous Freight',
    description:
      'Submit shipment details and receive a fast quote with AI-assisted lane and carrier matching from Infamous Freight.',
  },
  '/track-shipment': {
    title: 'Track Shipment in Real Time | Infamous Freight',
    description:
      'Track shipments in real time with live status updates, ETA visibility, and proactive issue alerts.',
  },
  '/freight-assistant': {
    title: 'AI Freight Assistant | Infamous Freight',
    description:
      'Use the Infamous Freight AI assistant to automate dispatch workflows, booking tasks, and operational decisions.',
  },
  '/services': {
    title: 'Freight Services | Infamous Freight',
    description:
      'Full truckload, LTL, flatbed, reefer, expedited, dedicated lanes, freight brokerage, final mile, and more — all with verified carriers and real-time tracking.',
  },
  '/services/box-truck': {
    title: 'Box Truck Freight Services | Infamous Freight',
    description:
      'Book 16 to 26 ft box truck freight for retail replenishment, commercial equipment, warehouse transfers, and regional lanes.',
  },
  '/services/cargo-van': {
    title: 'Cargo Van Freight Services | Infamous Freight',
    description:
      'Fast small freight delivery by cargo van for parts runs, medical supplies, retail goods, and same-day local moves.',
  },
  '/services/sprinter-van': {
    title: 'Sprinter Van Freight Services | Infamous Freight',
    description:
      'Expedited light freight by sprinter van for trade shows, light pallets, regional same-day, and time-sensitive shipments.',
  },
  '/services/local-freight': {
    title: 'Local Freight Delivery Services | Infamous Freight',
    description:
      'Same-city and metro freight delivery with pickup and delivery window coordination, status updates, and proof of delivery.',
  },
  '/services/regional-freight': {
    title: 'Regional Freight Shipping Services | Infamous Freight',
    description:
      'Multi-city freight lanes for distribution, manufacturing, retail supply chains, and recurring freight with carrier coordination.',
  },
  '/services/freight-dispatch': {
    title: 'Freight Dispatch Support Services | Infamous Freight',
    description:
      'Quote-to-dispatch workflow support for dispatch teams, small fleets, brokerage operations, and shipper coordination.',
  },
  '/services/full-truckload': {
    title: 'Full Truckload (FTL) Freight Services | Infamous Freight',
    description:
      'Dedicated full truckload freight with verified carriers — dry van, flatbed, and reefer. Direct pickup to direct delivery with safety and insurance checks.',
  },
  '/services/ltl-freight': {
    title: 'Less Than Truckload (LTL) Freight Services | Infamous Freight',
    description:
      'Cost-effective LTL freight for palletized shipments that don\'t need an entire trailer. Tracking, status updates, and proof of delivery included.',
  },
  '/services/flatbed': {
    title: 'Flatbed Freight Services | Infamous Freight',
    description:
      'Open-deck flatbed freight for construction materials, heavy machinery, steel, lumber, and oversized loads with tarping and permit coordination.',
  },
  '/services/reefer': {
    title: 'Reefer Temperature-Controlled Freight | Infamous Freight',
    description:
      'Temperature-controlled reefer freight for perishable goods, pharmaceuticals, and frozen products with continuous monitoring and compliance documentation.',
  },
  '/services/expedited': {
    title: 'Expedited Freight Services | Infamous Freight',
    description:
      'Time-critical expedited freight with same-day and next-day options. Dedicated driver and equipment, direct routing, and priority dispatch.',
  },
  '/services/dedicated-lanes': {
    title: 'Dedicated Lane Freight Services | Infamous Freight',
    description:
      'Recurring freight lanes with locked-in pricing, consistent carrier assignment, and performance tracking for reliable supply chain operations.',
  },
  '/services/freight-brokerage': {
    title: 'Freight Brokerage Services | Infamous Freight',
    description:
      'Licensed freight brokerage connecting shippers with vetted carriers across all equipment types. Rate negotiation, compliance, and end-to-end management.',
  },
  '/services/final-mile': {
    title: 'Final Mile Delivery Services | Infamous Freight',
    description:
      'Last-mile freight delivery from distribution center to end customer with delivery window scheduling, photo proof, and customer notifications.',
  },
  '/pricing': {
    title: 'Freight Pricing | Infamous Freight',
    description:
      'Compare shipper, driver, and partner pricing options for Infamous Freight workflows.',
  },
  '/partners': {
    title: 'Logistics Partner Program | Infamous Freight',
    description:
      'Apply for logistics-adjacent partner placements for shippers, drivers, and carriers.',
  },
  '/contact': {
    title: 'Contact Dispatch and Support | Infamous Freight',
    description:
      'Contact Infamous Freight for quote questions, shipment tracking, driver onboarding, partnerships, or support.',
  },
  '/about': {
    title: 'About | Infamous Freight',
    description:
      'Learn how Infamous Freight approaches verified freight operations, tracking, PODs, and cleaner handoffs.',
  },
  '/drive': {
    title: 'Apply to Drive | Infamous Freight',
    description:
      'Apply to join the Infamous Freight driver network for verified local and regional freight opportunities.',
  },
  '/customer-portal': {
    title: 'Customer Portal | Infamous Freight',
    description:
      'Open customer freight tools for quotes, shipment visibility, documents, and support workflows.',
  },
  '/carrier-portal': {
    title: 'Carrier Portal | Infamous Freight',
    description:
      'Open carrier freight tools for onboarding, assigned loads, proof workflows, and dispatch updates.',
  },
  '/load-board': {
    title: 'Freight Load Board | Infamous Freight',
    description:
      'Browse available freight loads with verified lanes, equipment requirements, and real-time status from Infamous Freight dispatch.',
  },
  '/terms': {
    title: 'Terms of Service | Infamous Freight',
    description:
      'Review the terms of service for using the Infamous Freight platform, services, and tools.',
  },
  '/privacy': {
    title: 'Privacy Policy | Infamous Freight',
    description:
      'Read the Infamous Freight privacy policy covering data collection, usage, and protection practices.',
  },
  '/carrier-agreement': {
    title: 'Carrier Agreement | Infamous Freight',
    description:
      'Review the carrier agreement for operating under Infamous Freight dispatch and brokerage services.',
  },
  '/shipper-agreement': {
    title: 'Shipper Agreement | Infamous Freight',
    description:
      'Review the shipper agreement for freight services, liability, and terms with Infamous Freight.',
  },
  '/resources': {
    title: 'Freight Guides and Resources | Infamous Freight',
    description:
      'Practical freight knowledge: equipment guides, industry explanations, and decision frameworks for shippers, carriers, and logistics teams.',
  },
  '/resources/ltl-vs-ftl-freight': {
    title: 'LTL vs FTL Freight: How to Choose | Infamous Freight',
    description:
      'Understand the differences between less-than-truckload and full truckload freight, when each makes sense, and how to decide based on shipment size, budget, and timeline.',
  },
  '/resources/box-truck-shipping-guide': {
    title: 'Complete Guide to Box Truck Freight Shipping | Infamous Freight',
    description:
      'Everything shippers need to know about box truck freight: capacity, pricing, best use cases, and how to book reliable box truck delivery.',
  },
  '/resources/what-is-freight-dispatch': {
    title: 'What Is Freight Dispatch? A Complete Guide | Infamous Freight',
    description:
      'Learn what freight dispatchers do, how dispatch operations work, and how dispatch support helps fleets and owner-operators move freight efficiently.',
  },
  '/resources/freight-tracking-explained': {
    title: 'How Real-Time Freight Tracking Works | Infamous Freight',
    description:
      'Learn how freight tracking technology provides real-time visibility into shipment status, ETAs, proof of delivery, and exception alerts.',
  },
  '/resources/cargo-van-vs-sprinter-van': {
    title: 'Cargo Van vs Sprinter Van: Which Is Right? | Infamous Freight',
    description:
      'Compare cargo van and sprinter van freight options side by side — capacity, cost, speed, and best use cases — to decide which vehicle fits your shipment.',
  },
};

const FAQ_DATA = [
  {
    q: 'How do I get a freight quote from Infamous Freight?',
    a: 'Submit your shipment details including pickup location, destination, freight type, and timing on the Request a Quote page. Our dispatch team reviews your request and provides a rate with carrier and equipment confirmation, typically within hours.',
  },
  {
    q: 'What types of freight services do you offer?',
    a: 'Infamous Freight handles full truckload, LTL, flatbed, reefer, expedited, dedicated lanes, freight brokerage, final mile, box truck, cargo van, sprinter van, local, and regional freight. We also provide full freight dispatch support for owner-operators, small fleets, and brokerage operations.',
  },
  {
    q: 'How does real-time shipment tracking work?',
    a: 'Every load gets a live tracking timeline from pickup to delivery. You receive status updates, ETA changes, and proof-of-delivery events as they happen. Enter your reference number on the Track Shipment page for instant visibility.',
  },
  {
    q: 'What is your carrier vetting process?',
    a: 'Every carrier is verified for FMCSA authority, active insurance, safety scores, and driver identity before touching a load. We re-check credentials on policy events and maintain documented records for every assignment.',
  },
  {
    q: 'How do carriers and drivers get paid?',
    a: 'Standard carrier pay terms are included with every load. QuickPay options are available at 2.5% for 48-hour and 3.5% for same-day settlement. Instant payout is also available at 4% with transparent fee structure.',
  },
  {
    q: 'What areas does Infamous Freight service?',
    a: 'We cover local and regional freight lanes across core U.S. markets with verified carrier capacity. Service areas include major metro regions and multi-city distribution corridors with coordinated pickup and delivery windows.',
  },
  {
    q: 'Do you offer same-day or expedited freight?',
    a: 'Yes. Cargo van and sprinter van services support same-day pickup and delivery for time-sensitive freight. Expedited options are available for parts runs, medical supplies, trade show materials, and urgent commercial shipments.',
  },
  {
    q: 'How do I apply to drive with Infamous Freight?',
    a: 'Visit the Apply to Drive page and submit your name, contact info, city, equipment type, and any notes. Our onboarding team reviews applications and connects verified drivers with freight opportunities on matching lanes.',
  },
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripSeoMeta(html: string): string {
  return html
    .replace(/\s*<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>/g, '')
    .replace(/\s*<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>/g, '');
}

function buildBreadcrumb(pathname: string): object {
  const items: { name: string; url: string }[] = [
    { name: 'Home', url: SITE_URL + '/' },
  ];
  if (pathname !== '/') {
    const segments = pathname.split('/').filter(Boolean);
    let path = '';
    for (const seg of segments) {
      path += '/' + seg;
      const name = seg
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      items.push({ name, url: SITE_URL + path });
    }
  }
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function buildJsonLd(pathname: string): string {
  const graph: object[] = [
    {
      '@type': 'Organization',
      '@id': SITE_URL + '/#organization',
      name: BRAND_NAME,
      url: SITE_URL,
      logo: SITE_URL + '/favicon.svg',
      description:
        'AI-powered freight command center with auto-dispatch, rate negotiation, ELD sync, and end-to-end shipment visibility.',
      email: 'support@infamousfreight.com',
      sameAs: [],
    },
    buildBreadcrumb(pathname),
  ];

  if (pathname === '/') {
    graph.push({
      '@type': 'WebSite',
      '@id': SITE_URL + '/#website',
      name: BRAND_NAME,
      url: SITE_URL,
      publisher: { '@id': SITE_URL + '/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE_URL + '/track-shipment?ref={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    });
    graph.push({
      '@type': 'FAQPage',
      mainEntity: FAQ_DATA.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    });
  }

  if (pathname.startsWith('/services/') && pathname !== '/services') {
    const slug = pathname.replace('/services/', '');
    const serviceNames: Record<string, string> = {
      'box-truck': 'Box Truck Freight',
      'cargo-van': 'Cargo Van Freight',
      'sprinter-van': 'Sprinter Van Freight',
      'local-freight': 'Local Freight Delivery',
      'regional-freight': 'Regional Freight Shipping',
      'freight-dispatch': 'Freight Dispatch Support',
    };
    const name = serviceNames[slug];
    if (name) {
      const seo = SEO[pathname];
      graph.push({
        '@type': 'Service',
        name,
        description: seo?.description ?? '',
        provider: { '@id': SITE_URL + '/#organization' },
        url: SITE_URL + pathname,
        areaServed: { '@type': 'Country', name: 'United States' },
      });
    }
  }

  if (pathname === '/contact') {
    graph.push({
      '@type': 'ContactPage',
      name: 'Contact Infamous Freight',
      url: SITE_URL + '/contact',
      mainEntity: {
        '@type': 'Organization',
        '@id': SITE_URL + '/#organization',
        contactPoint: [
          { '@type': 'ContactPoint', email: 'dispatch@infamousfreight.com', contactType: 'sales', description: 'Dispatch and Quotes' },
          { '@type': 'ContactPoint', email: 'drivers@infamousfreight.com', contactType: 'customer support', description: 'Driver Onboarding' },
          { '@type': 'ContactPoint', email: 'support@infamousfreight.com', contactType: 'customer support', description: 'General Support' },
        ],
      },
    });
  }

  if (pathname === '/drive') {
    graph.push({
      '@type': 'JobPosting',
      title: 'Freight Driver — Owner Operator / Carrier',
      description:
        'Join the Infamous Freight driver network. Verified local and regional freight opportunities for cargo van, sprinter van, box truck, and power-only operators. Free to start with transparent dispatch support.',
      datePosted: '2026-05-08',
      validThrough: '2027-05-08',
      employmentType: 'CONTRACTOR',
      hiringOrganization: { '@id': SITE_URL + '/#organization' },
      jobLocation: {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressCountry: 'US' },
      },
      applicantLocationRequirements: { '@type': 'Country', name: 'United States' },
      jobLocationType: 'TELECOMMUTE',
      url: SITE_URL + '/drive',
    });
  }

  if (pathname === '/pricing') {
    graph.push(
      {
        '@type': 'Service',
        name: 'Infamous Freight Platform — Starter',
        description: 'Starter plan for shippers needing quote intake, tracking, and basic freight tools.',
        provider: { '@id': SITE_URL + '/#organization' },
        url: SITE_URL + '/pricing',
        areaServed: { '@type': 'Country', name: 'United States' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          url: SITE_URL + '/pricing',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Service',
        name: 'Infamous Freight Platform — Professional',
        description: 'Professional plan with dispatch automation, carrier management, and AI freight tools.',
        provider: { '@id': SITE_URL + '/#organization' },
        url: SITE_URL + '/pricing',
        areaServed: { '@type': 'Country', name: 'United States' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          url: SITE_URL + '/pricing',
          availability: 'https://schema.org/InStock',
        },
      },
    );
  }

  if (pathname.startsWith('/resources/') && pathname !== '/resources') {
    const seoEntry = SEO[pathname];
    if (seoEntry) {
      graph.push({
        '@type': 'Article',
        headline: seoEntry.title.replace(/ \| Infamous Freight$/, ''),
        description: seoEntry.description,
        url: SITE_URL + pathname,
        publisher: { '@id': SITE_URL + '/#organization' },
        author: { '@id': SITE_URL + '/#organization' },
        datePublished: '2026-05-08',
        dateModified: '2026-05-08',
      });
    }
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  let pathname = url.pathname.replace(/\/$/, '') || '/';
  if (pathname === '/home') pathname = '/';

  const seo = SEO[pathname];
  if (!seo) return;

  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();

  const canonicalUrl = `${SITE_URL}${pathname}`;
  const safeTitle = escapeHtml(seo.title);
  const safeDesc = escapeHtml(seo.description);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`,
  );

  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  );

  const ogType = pathname.startsWith('/resources/') && pathname !== '/resources' ? 'article' : 'website';

  html = stripSeoMeta(html);

  const injected = `
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${BRAND_NAME}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${OG_IMAGE_ALT}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="twitter:image:alt" content="${OG_IMAGE_ALT}" />
    <script type="application/ld+json">${buildJsonLd(pathname)}</script>`;

  html = html.replace('</head>', `${injected}\n  </head>`);

  const headers = new Headers(response.headers);
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  headers.set('x-seo-prerender', 'true');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'SAMEORIGIN');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('strict-transport-security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('cross-origin-embedder-policy', 'credentialless');
  headers.set('cross-origin-opener-policy', 'same-origin-allow-popups');
  headers.set('cross-origin-resource-policy', 'same-origin');
  headers.set(
    'permissions-policy',
    'camera=(), microphone=(), geolocation=(), payment=(self https://js.stripe.com), usb=(), bluetooth=(), serial=(), hid=(), accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=(), autoplay=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(self), idle-detection=(), interest-cohort=(), picture-in-picture=(self), screen-wake-lock=(), xr-spatial-tracking=()',
  );
  headers.set('x-dns-prefetch-control', 'off');
  headers.set('x-permitted-cross-domain-policies', 'none');

  return new Response(html, { status: response.status, headers });
};

export const config: Config = {
  path: [
    '/',
    '/home',
    '/about',
    '/contact',
    '/services',
    '/services/*',
    '/request-quote',
    '/track-shipment',
    '/freight-assistant',
    '/pricing',
    '/partners',
    '/drive',
    '/customer-portal',
    '/carrier-portal',
    '/load-board',
    '/terms',
    '/privacy',
    '/carrier-agreement',
    '/shipper-agreement',
    '/resources',
    '/resources/*',
  ],
  onError: 'bypass',
};
