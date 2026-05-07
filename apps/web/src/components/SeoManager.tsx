import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { BRAND } from '@/lib/brand';
import { servicePages } from '@/data/publicPages';

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
    title: `${BRAND.displayName} | Verified Freight Quote, Dispatch, and Tracking`,
    description:
      'Request local and regional freight quotes, track active shipments, and coordinate verified box truck, cargo van, sprinter van, and dispatch support.'
  },
  '/home': {
    title: `${BRAND.displayName} | Verified Freight Quote, Dispatch, and Tracking`,
    description:
      'Request local and regional freight quotes, track active shipments, and coordinate verified box truck, cargo van, sprinter van, and dispatch support.'
  },
  '/services': {
    title: `Freight Services | ${BRAND.displayName}`,
    description:
      'Explore box truck, cargo van, sprinter van, local freight, regional freight, and dispatch support services from Infamous Freight.'
  },
  '/request-quote': {
    title: `Request a Freight Quote | ${BRAND.displayName}`,
    description:
      `Submit pickup, delivery, equipment, freight, and accessorial details so ${BRAND.displayName} can review capacity and respond with pricing.`
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
  }
};

servicePages.forEach((service) => {
  SEO_BY_PATH[`/services/${service.slug}`] = {
    title: `${service.title} | ${BRAND.displayName}`,
    description: service.summary,
  };
});

const INDEXABLE_ROUTES = new Set([
  '/',
  '/home',
  '/services',
  ...servicePages.map((service) => `/services/${service.slug}`),
  '/request-quote',
  '/track-shipment',
  '/freight-assistant',
]);

const SeoManager = () => {
  const location = useLocation();
  const pathname = (location.pathname || '/').replace(/\/$/, '') || '/';
  const seo = SEO_BY_PATH[pathname] ?? DEFAULT_SEO;
  const canonicalPath = pathname === '/home' ? '/' : pathname;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const isIndexable = INDEXABLE_ROUTES.has(pathname);

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={isIndexable ? 'index,follow' : 'noindex,nofollow'} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
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
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content={BRAND.ogImageAlt} />
    </Helmet>
  );
};

export default SeoManager;
