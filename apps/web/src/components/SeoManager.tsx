import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { BRAND } from '@/lib/brand';

type SeoConfig = {
  title: string;
  description: string;
};

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? BRAND.siteUrl).replace(/\/$/, '');
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const OG_IMAGE_ALT = `${BRAND.displayName} freight services and quote intake`;

const DEFAULT_SEO: SeoConfig = {
  title: `${BRAND.displayName} — Freight Quotes and Logistics Services`,
  description: BRAND.description,
};

const SEO_BY_PATH: Record<string, SeoConfig> = {
  '/': {
    title: `${BRAND.displayName} — Freight Quotes, Dispatch, and Tracking`,
    description:
      'Request freight quotes for truckload, LTL, flatbed, reefer, expedited, local, regional, box truck, cargo van, sprinter van, and dispatch support.'
  },
  '/home': {
    title: `${BRAND.displayName} — Freight Quotes, Dispatch, and Tracking`,
    description:
      'Request freight quotes for truckload, LTL, flatbed, reefer, expedited, local, regional, box truck, cargo van, sprinter van, and dispatch support.'
  },
  '/request-quote': {
    title: `Request a Freight Quote | ${BRAND.displayName}`,
    description:
      `Submit lane, equipment, pickup timing, freight details, and contact information for dispatch follow-up from ${BRAND.displayName}.`
  },
  '/track-shipment': {
    title: `Track Shipment in Real Time | ${BRAND.displayName}`,
    description:
      'Track shipments in real time with live status updates, ETA visibility, and proactive issue alerts.'
  },
  '/freight-assistant': {
    title: `AI Freight Assistant | ${BRAND.displayName}`,
    description:
      `Use the ${BRAND.displayName} AI assistant to automate dispatch workflows, booking tasks, and operational decisions.`
  },
  '/services': {
    title: `Freight Services | ${BRAND.displayName}`,
    description: 'Review full truckload, LTL, flatbed, reefer, expedited, dedicated lanes, final mile, local, regional, van, box truck, brokerage, and dispatch services.'
  },
  '/services/full-truckload': {
    title: `Full Truckload Freight Services | ${BRAND.displayName}`,
    description: 'Request full truckload freight for larger shipments with dedicated equipment planning, lane review, and dispatch follow-up.'
  },
  '/services/ltl-freight': {
    title: `LTL Freight Services | ${BRAND.displayName}`,
    description: 'Request less-than-truckload freight for palletized partial shipments with pickup details, delivery timing, and proof workflows.'
  },
  '/services/flatbed': {
    title: `Flatbed Freight Services | ${BRAND.displayName}`,
    description: 'Request flatbed freight for construction materials, machinery, steel, lumber, and open-deck shipments.'
  },
  '/services/reefer': {
    title: `Reefer Freight Services | ${BRAND.displayName}`,
    description: 'Request refrigerated freight support with documented temperature requirements, handling notes, and delivery follow-up.'
  },
  '/services/expedited': {
    title: `Expedited Freight Services | ${BRAND.displayName}`,
    description: 'Request expedited freight for urgent shipments where timing, lane, equipment, and carrier capacity need fast review.'
  },
  '/services/dedicated-lanes': {
    title: `Dedicated Freight Lanes | ${BRAND.displayName}`,
    description: 'Plan recurring freight lanes with documented rate expectations, capacity planning, and clear dispatch communication.'
  },
  '/services/freight-brokerage': {
    title: `Freight Brokerage Support | ${BRAND.displayName}`,
    description: 'Request brokerage support with lane intake, equipment review, carrier document review, and written rate confirmation.'
  },
  '/services/final-mile': {
    title: `Final Mile Delivery Services | ${BRAND.displayName}`,
    description: 'Coordinate final mile delivery from distribution centers, warehouses, hubs, and retail locations with delivery documentation.'
  },
  '/services/amazon-delivery': {
    title: `Amazon Delivery Integration | ${BRAND.displayName}`,
    description: 'Plan Amazon MCF and shipping workflows for eligible e-commerce orders, inventory visibility, labels, tracking, and customer delivery updates.'
  },
  '/services/box-truck': {
    title: `Box Truck Freight Services | ${BRAND.displayName}`,
    description: 'Book 16 to 26 ft box truck freight for retail replenishment, commercial equipment, warehouse transfers, and regional lanes.'
  },
  '/services/cargo-van': {
    title: `Cargo Van Freight Services | ${BRAND.displayName}`,
    description: 'Fast small freight delivery by cargo van for parts runs, medical supplies, retail goods, and same-day local moves.'
  },
  '/services/sprinter-van': {
    title: `Sprinter Van Freight Services | ${BRAND.displayName}`,
    description: 'Expedited light freight by sprinter van for trade shows, light pallets, regional same-day, and time-sensitive shipments.'
  },
  '/services/local-freight': {
    title: `Local Freight Delivery Services | ${BRAND.displayName}`,
    description: 'Same-city and metro freight delivery with pickup and delivery window coordination, status updates, and proof of delivery.'
  },
  '/services/regional-freight': {
    title: `Regional Freight Shipping Services | ${BRAND.displayName}`,
    description: 'Multi-city freight lanes for distribution, manufacturing, retail supply chains, and recurring freight with carrier coordination.'
  },
  '/services/freight-dispatch': {
    title: `Freight Dispatch Support Services | ${BRAND.displayName}`,
    description: 'Quote-to-dispatch workflow support for dispatch teams, small fleets, brokerage operations, and shipper coordination.'
  },
  '/pricing': {
    title: `Freight Pricing | ${BRAND.displayName}`,
    description: 'Compare shipper, driver, and partner pricing options for Infamous Freight workflows.'
  },
  '/partners': {
    title: `Logistics Partner Program | ${BRAND.displayName}`,
    description: 'Apply for logistics-adjacent partner placements for shippers, drivers, and carriers.'
  },
  '/contact': {
    title: `Contact Dispatch and Support | ${BRAND.displayName}`,
    description: 'Contact Infamous Freight for quote questions, shipment tracking, driver onboarding, partnerships, or support.'
  },
  '/about': {
    title: `About | ${BRAND.displayName}`,
    description: 'Learn how Infamous Freight approaches verified freight operations, tracking, PODs, and cleaner handoffs.'
  },
  '/faq': {
    title: `Frequently Asked Questions | ${BRAND.displayName}`,
    description: 'Find answers to common questions about freight quotes, services, shipment tracking, carrier operations, pricing, and the Infamous Freight platform.'
  },
  '/drive': {
    title: `Apply to Drive | ${BRAND.displayName}`,
    description: 'Apply to join the Infamous Freight driver network for verified local and regional freight opportunities.'
  },
  '/customer-portal': {
    title: `Customer Portal | ${BRAND.displayName}`,
    description: 'Open customer freight tools for quotes, shipment visibility, documents, and support workflows.'
  },
  '/carrier-portal': {
    title: `Carrier Portal | ${BRAND.displayName}`,
    description: 'Open carrier freight tools for onboarding, assigned loads, proof workflows, and dispatch updates.'
  },
  '/load-board': {
    title: `Freight Load Board | ${BRAND.displayName}`,
    description: 'Browse available freight loads with verified lanes, equipment requirements, and real-time status from Infamous Freight dispatch.'
  },
  '/terms': {
    title: `Terms of Service | ${BRAND.displayName}`,
    description: 'Review the terms of service for using the Infamous Freight platform, services, and tools.'
  },
  '/privacy': {
    title: `Privacy Policy | ${BRAND.displayName}`,
    description: 'Read the Infamous Freight privacy policy covering data collection, usage, and protection practices.'
  },
  '/carrier-agreement': {
    title: `Carrier Agreement | ${BRAND.displayName}`,
    description: 'Review the carrier agreement for operating under Infamous Freight dispatch and brokerage services.'
  },
  '/shipper-agreement': {
    title: `Shipper Agreement | ${BRAND.displayName}`,
    description: 'Review the shipper agreement for freight services, liability, and terms with Infamous Freight.'
  },
  '/resources': {
    title: `Freight Guides and Resources | ${BRAND.displayName}`,
    description: 'Practical freight knowledge: equipment guides, industry explanations, and decision frameworks for shippers, carriers, and logistics teams.'
  },
  '/case-studies': {
    title: `Freight Workflow Examples | ${BRAND.displayName}`,
    description: 'Review practical freight workflow examples for quote intake, document review, written terms, shipment updates, and delivery follow-up.'
  },
  '/product-hunt': {
    title: `Infamous Freight on Product Hunt | ${BRAND.displayName}`,
    description: 'The TMS that actually understands trucking. AI-powered load management, real-time tracking, and automated exception handling.'
  },
  '/gdpr': {
    title: `Privacy & Data Protection (GDPR) | ${BRAND.displayName}`,
    description: 'Learn about your GDPR data rights, how Infamous Freight collects and uses data, and how to exercise your privacy rights.'
  },
  '/resources/ltl-vs-ftl-freight': {
    title: `LTL vs FTL Freight: How to Choose | ${BRAND.displayName}`,
    description: 'Understand the differences between less-than-truckload and full truckload freight, when each makes sense, and how to decide based on shipment size, budget, and timeline.'
  },
  '/resources/box-truck-shipping-guide': {
    title: `Complete Guide to Box Truck Freight Shipping | ${BRAND.displayName}`,
    description: 'Everything shippers need to know about box truck freight: capacity, pricing, best use cases, and how to book reliable box truck delivery.'
  },
  '/resources/what-is-freight-dispatch': {
    title: `What Is Freight Dispatch? A Complete Guide | ${BRAND.displayName}`,
    description: 'Learn what freight dispatchers do, how dispatch operations work, and how dispatch support helps fleets and owner-operators move freight efficiently.'
  },
  '/resources/freight-tracking-explained': {
    title: `How Real-Time Freight Tracking Works | ${BRAND.displayName}`,
    description: 'Learn how freight tracking technology provides real-time visibility into shipment status, ETAs, proof of delivery, and exception alerts.'
  },
  '/resources/cargo-van-vs-sprinter-van': {
    title: `Cargo Van vs Sprinter Van: Which Is Right? | ${BRAND.displayName}`,
    description: 'Compare cargo van and sprinter van freight options side by side — capacity, cost, speed, and best use cases — to decide which vehicle fits your shipment.'
  },
};

const INDEXABLE_ROUTES = new Set([
  '/',
  '/home',
  '/request-quote',
  '/track-shipment',
  '/freight-assistant',
  '/services',
  '/pricing',
  '/partners',
  '/contact',
  '/about',
  '/drive',
  '/faq',
  '/customer-portal',
  '/carrier-portal',
  '/load-board',
  '/terms',
  '/privacy',
  '/carrier-agreement',
  '/shipper-agreement',
  '/resources',
  '/case-studies',
  '/product-hunt',
  '/gdpr',
]);

const ORGANIZATION_JSONLD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.displayName,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: BRAND.description,
  contactPoint: {
    '@type': 'ContactPoint',
    email: BRAND.supportEmail,
    telephone: BRAND.dispatchPhone,
    contactType: 'customer service',
  },
  sameAs: [
    'https://www.producthunt.com/posts/infamous-freight',
  ],
});

const FAQ_ITEMS = [
  {
    question: 'How do I get a freight quote from Infamous Freight?',
    answer:
      'Submit your shipment details including pickup location, destination, freight type, and timing on the Request a Quote page. Our dispatch team reviews your request and provides a rate with carrier and equipment confirmation, typically within hours.',
  },
  {
    question: 'What types of freight services do you offer?',
    answer:
      'Infamous Freight handles box truck (16–26 ft), cargo van, sprinter van, local metro, and regional multi-city freight. We also provide full freight dispatch support for owner-operators, small fleets, and brokerage operations.',
  },
  {
    question: 'How does real-time shipment tracking work?',
    answer:
      'Every load gets a live tracking timeline from pickup to delivery. You receive status updates, ETA changes, and proof-of-delivery events as they happen. Enter your reference number on the Track Shipment page for instant visibility.',
  },
  {
    question: 'What is your carrier vetting process?',
    answer:
      'Carrier documents and shipment requirements are reviewed before dispatch, and equipment, timing, communication expectations, and written confirmations are kept with the load workflow.',
  },
  {
    question: 'How do carriers and drivers get paid?',
    answer:
      'Carrier payment terms are confirmed in writing before dispatch. Carriers should review the written rate confirmation and payment terms for each load.',
  },
  {
    question: 'What areas does Infamous Freight service?',
    answer:
      'Local and regional freight can be requested across U.S. lanes. Availability depends on lane, equipment, timing, freight details, and carrier capacity.',
  },
  {
    question: 'Do you offer same-day or expedited freight?',
    answer:
      'Expedited options can be requested for time-sensitive freight. Availability depends on lane, timing, equipment, and carrier capacity.',
  },
  {
    question: 'How do I apply to drive with Infamous Freight?',
    answer:
      'Visit the Apply to Drive page and submit your name, contact info, city, equipment type, and any notes. Our onboarding team reviews applications and connects verified drivers with freight opportunities on matching lanes.',
  },
];

const FAQ_JSONLD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

const SeoManager = () => {
  const location = useLocation();
  const pathname = (location.pathname || '/').replace(/\/$/, '') || '/';
  const canonicalPath = pathname === '/home' ? '/' : pathname;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const isIndexable = INDEXABLE_ROUTES.has(pathname) || pathname.startsWith('/services/') || pathname.startsWith('/resources/');
  const isArticle = pathname.startsWith('/resources/') && pathname !== '/resources';
  const isHome = pathname === '/' || pathname === '/home';
  const isFaq = pathname === '/faq';
  const isServiceDetail = pathname.startsWith('/services/') && pathname !== '/services';
  const isResourceArticle = pathname.startsWith('/resources/') && pathname !== '/resources';

  const seo = SEO_BY_PATH[pathname] ?? ((): SeoConfig => {
    const slug = pathname.split('/').pop() ?? '';
    const readable = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    if (isServiceDetail) {
      return {
        title: `${readable} Freight Services | ${BRAND.displayName}`,
        description: `Request ${readable.toLowerCase()} freight services with quote intake, carrier coordination, and delivery follow-up from ${BRAND.displayName}.`,
      };
    }
    if (isResourceArticle) {
      return {
        title: `${readable} | ${BRAND.displayName}`,
        description: `Read about ${readable.toLowerCase()} — practical freight knowledge for shippers, carriers, and logistics teams from ${BRAND.displayName}.`,
      };
    }
    return DEFAULT_SEO;
  })();

  const breadcrumbJsonLd = (isServiceDetail || isResourceArticle) ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isServiceDetail ? 'Services' : 'Resources',
        item: `${SITE_URL}${isServiceDetail ? '/services' : '/resources'}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: seo.title.split(' | ')[0],
        item: canonicalUrl,
      },
    ],
  }) : null;

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={isIndexable ? 'index,follow' : 'noindex,nofollow'} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta property="og:site_name" content={BRAND.displayName} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />
      {isArticle && <meta property="article:published_time" content="2026-05-08T00:00:00Z" />}
      {isArticle && <meta property="article:author" content={BRAND.displayName} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
      <script type="application/ld+json">{ORGANIZATION_JSONLD}</script>
      {(isHome || isFaq) && <script type="application/ld+json">{FAQ_JSONLD}</script>}
      {breadcrumbJsonLd && <script type="application/ld+json">{breadcrumbJsonLd}</script>}
    </Helmet>
  );
};

export default SeoManager;
