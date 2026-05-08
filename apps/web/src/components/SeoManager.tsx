import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { BRAND } from '@/lib/brand';

type SeoConfig = {
  title: string;
  description: string;
};

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? BRAND.siteUrl).replace(/\/$/, '');
// Source asset is /public/og-image.svg; rendered as PNG via Netlify Image CDN
// so social platforms that don't support SVG previews still get a 1200x630 image.
const OG_IMAGE = `${SITE_URL}/.netlify/images?url=/og-image.svg&w=1200&h=630&fit=cover&fm=png`;

const DEFAULT_SEO: SeoConfig = {
  title: `${BRAND.displayName} — AI Freight Command Center`,
  description: BRAND.description,
};

const SEO_BY_PATH: Record<string, SeoConfig> = {
  '/': {
    title: `${BRAND.displayName} — AI Freight Operating System`,
    description:
      'Run dispatch, visibility, and carrier operations from one AI-powered operating system built for modern fleets.'
  },
  '/home': {
    title: `${BRAND.displayName} — AI Freight Operating System`,
    description:
      'Run dispatch, visibility, and carrier operations from one AI-powered operating system built for modern fleets.'
  },
  '/request-quote': {
    title: `Request a Freight Quote | ${BRAND.displayName}`,
    description:
      `Submit shipment details and receive a fast quote with AI-assisted lane and carrier matching from ${BRAND.displayName}.`
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
]);

const SeoManager = () => {
  const location = useLocation();
  const pathname = (location.pathname || '/').replace(/\/$/, '') || '/';
  const seo = SEO_BY_PATH[pathname] ?? DEFAULT_SEO;
  const canonicalPath = pathname === '/home' ? '/' : pathname;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const isIndexable = INDEXABLE_ROUTES.has(pathname) || pathname.startsWith('/services/') || pathname.startsWith('/resources/');
  const isArticle = pathname.startsWith('/resources/') && pathname !== '/resources';

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
      <meta property="og:image:alt" content={BRAND.ogImageAlt} />
      {isArticle && <meta property="article:published_time" content="2026-05-08T00:00:00Z" />}
      {isArticle && <meta property="article:author" content={BRAND.displayName} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content={BRAND.ogImageAlt} />
    </Helmet>
  );
};

export default SeoManager;
