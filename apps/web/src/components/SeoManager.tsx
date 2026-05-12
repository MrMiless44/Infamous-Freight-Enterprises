import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { BRAND } from '@/lib/brand';

type SeoConfig = {
  title: string;
  description: string;
};

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? BRAND.siteUrl).replace(/\/$/, '');
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const OG_IMAGE_ALT = `${BRAND.displayName} freight quote and logistics support`;

const DEFAULT_SEO: SeoConfig = {
  title: `${BRAND.displayName} - Freight Quotes and Logistics Support`,
  description: 'Request freight quotes, share shipment details, and contact dispatch support for freight coordination.',
};

const SEO_BY_PATH: Record<string, SeoConfig> = {
  '/': {
    title: `${BRAND.displayName} - Request Freight Quotes and Dispatch Support`,
    description:
      'Request freight quotes, share shipment details, and connect with dispatch and logistics support from quote request to delivery.'
  },
  '/home': {
    title: `${BRAND.displayName} - Request Freight Quotes and Dispatch Support`,
    description:
      'Request freight quotes, share shipment details, and connect with dispatch and logistics support from quote request to delivery.'
  },
  '/request-quote': {
    title: `Request a Freight Quote | ${BRAND.displayName}`,
    description:
      `Submit origin, destination, equipment needs, pickup timing, and contact details for dispatch review from ${BRAND.displayName}.`
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
    description: 'Review local, regional, box truck, cargo van, sprinter van, and dispatch support services.'
  },
  '/services/full-truckload': {
    title: `Full Truckload Freight Services | ${BRAND.displayName}`,
    description: 'Request full truckload freight quotes for dedicated dry van, flatbed, or reefer capacity with dispatch review.'
  },
  '/services/ltl-freight': {
    title: `LTL Freight Services | ${BRAND.displayName}`,
    description: 'Request less-than-truckload freight quotes for palletized shipments that do not need a full trailer.'
  },
  '/services/flatbed': {
    title: `Flatbed Freight Services | ${BRAND.displayName}`,
    description: 'Request flatbed freight quotes for open-deck, oversized, heavy, or irregular freight with securement planning.'
  },
  '/services/reefer': {
    title: `Reefer Freight Services | ${BRAND.displayName}`,
    description: 'Request temperature-controlled reefer freight quotes with pickup timing, lane details, and equipment needs reviewed.'
  },
  '/services/expedited': {
    title: `Expedited Freight Services | ${BRAND.displayName}`,
    description: 'Request expedited freight options reviewed by lane, pickup timing, equipment type, and available capacity.'
  },
  '/services/dedicated-lanes': {
    title: `Dedicated Freight Lanes | ${BRAND.displayName}`,
    description: 'Request recurring dedicated lane support with written terms, repeatable dispatch details, and capacity planning.'
  },
  '/services/freight-brokerage': {
    title: `Freight Brokerage Support | ${BRAND.displayName}`,
    description: 'Request freight brokerage support connecting shipment requirements with reviewed carrier capacity and written terms.'
  },
  '/services/final-mile': {
    title: `Final Mile Delivery Services | ${BRAND.displayName}`,
    description: 'Request final mile delivery support for hub, warehouse, retail, and customer delivery freight.'
  },
  '/services/box-truck': {
    title: `Box Truck Freight Services | ${BRAND.displayName}`,
    description: 'Book 16 to 26 ft box truck freight for retail replenishment, commercial equipment, warehouse transfers, and regional lanes.'
  },
  '/services/cargo-van': {
    title: `Cargo Van Freight Services | ${BRAND.displayName}`,
    description: 'Cargo van freight for parts runs, retail goods, documents, samples, and scheduled or expedited local moves by lane availability.'
  },
  '/services/sprinter-van': {
    title: `Sprinter Van Freight Services | ${BRAND.displayName}`,
    description: 'Expedited light freight by sprinter van for trade shows, light pallets, regional lanes, and time-sensitive shipments by capacity.'
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
    title: `Customer Success Stories | ${BRAND.displayName}`,
    description: 'See how fleets of all sizes use Infamous Freight to grow revenue, reduce costs, and keep drivers happy.'
  },
  '/product-hunt': {
    title: `Infamous Freight on Product Hunt | ${BRAND.displayName}`,
    description: 'Product preview information for Infamous Freight freight workflows, quote intake, tracking, and dispatch tools.'
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
      'Submit your shipment details including pickup location, destination, freight type, equipment needs, pickup timing, and contact details on the Request a Quote page. Dispatch reviews your request and follows up with next steps.',
  },
  {
    question: 'What types of freight services do you offer?',
    answer:
      'Infamous Freight handles box truck (16–26 ft), cargo van, sprinter van, local metro, and regional multi-city freight. We also provide full freight dispatch support for owner-operators, small fleets, and brokerage operations.',
  },
  {
    question: 'How does real-time shipment tracking work?',
    answer:
      'Shipment tracking organizes status updates, ETA changes, delivery details, and proof-of-delivery events when they are available. Enter your reference number on the Track Shipment page for visibility.',
  },
  {
    question: 'What is your carrier vetting process?',
    answer:
      'Carrier qualification is reviewed before assignment, and operational details are confirmed before dispatch.',
  },
  {
    question: 'How do carriers and drivers get paid?',
    answer:
      'Carrier payment terms are confirmed in writing before a shipment is assigned. Any faster payment option depends on the written agreement for that load.',
  },
  {
    question: 'What areas does Infamous Freight service?',
    answer:
      'Local and regional freight support depends on lane, timing, equipment needs, and available capacity. Share the route on the quote form so dispatch can review it.',
  },
  {
    question: 'Do you offer same-day or expedited freight?',
    answer:
      'Expedited options are available by lane, pickup timing, equipment, and carrier capacity. Share the timing on the quote form so dispatch can review the request.',
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
  const seo = SEO_BY_PATH[pathname] ?? DEFAULT_SEO;
  const canonicalPath = pathname === '/home' ? '/' : pathname;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const isIndexable = INDEXABLE_ROUTES.has(pathname) || pathname.startsWith('/services/') || pathname.startsWith('/resources/');
  const isArticle = pathname.startsWith('/resources/') && pathname !== '/resources';
  const isHome = pathname === '/' || pathname === '/home';
  const isServiceDetail = pathname.startsWith('/services/') && pathname !== '/services';
  const isResourceArticle = pathname.startsWith('/resources/') && pathname !== '/resources';

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
      {isHome && <script type="application/ld+json">{FAQ_JSONLD}</script>}
      {breadcrumbJsonLd && <script type="application/ld+json">{breadcrumbJsonLd}</script>}
    </Helmet>
  );
};

export default SeoManager;
