import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { findServicePage, servicePages } from '@/data/publicPages';
import { resourceArticles } from '@/data/resourceArticles';
import Breadcrumb from '@/components/Breadcrumb';

const serviceResourceMap: Record<string, string[]> = {
  'box-truck': ['box-truck-shipping-guide', 'ltl-vs-ftl-freight'],
  'cargo-van': ['cargo-van-vs-sprinter-van', 'freight-tracking-explained'],
  'sprinter-van': ['cargo-van-vs-sprinter-van', 'box-truck-shipping-guide'],
  'local-freight': ['freight-tracking-explained', 'what-is-freight-dispatch'],
  'regional-freight': ['ltl-vs-ftl-freight', 'freight-tracking-explained'],
  'freight-dispatch': ['what-is-freight-dispatch', 'ltl-vs-ftl-freight'],
  'full-truckload': ['ltl-vs-ftl-freight', 'freight-tracking-explained'],
  'ltl-freight': ['ltl-vs-ftl-freight', 'box-truck-shipping-guide'],
  'flatbed': ['freight-tracking-explained'],
  'reefer': ['freight-tracking-explained'],
  'expedited': ['cargo-van-vs-sprinter-van', 'freight-tracking-explained'],
  'dedicated-lanes': ['ltl-vs-ftl-freight'],
  'freight-brokerage': ['what-is-freight-dispatch', 'ltl-vs-ftl-freight'],
  'final-mile': ['freight-tracking-explained', 'box-truck-shipping-guide'],
};

const ServiceDetailPage: React.FC = () => {
  const { serviceSlug } = useParams();
  const service = findServicePage(serviceSlug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const ServiceIcon = service.Icon;
  const relatedSlugs = serviceResourceMap[service.slug] ?? [];
  const relatedGuides = relatedSlugs
    .map((slug) => resourceArticles.find((a) => a.slug === slug))
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-infamous-dark px-6 py-16 text-[#F5E8E8]">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: 'Services', href: '/services' }, { label: service.title }]} />
        <section className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="mb-5 inline-flex rounded-xl bg-infamous-red/10 p-3 text-infamous-red-light">
              <ServiceIcon size={24} />
            </div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">{service.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">{service.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#B88989]">{service.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/request-quote" className="btn-primary btn-lg inline-flex items-center justify-center gap-2 glow-high">
                Request a quote <ArrowRight size={17} />
              </Link>
              <Link to="/contact" className="btn-secondary btn-lg inline-flex items-center justify-center gap-2">
                Ask a question
              </Link>
            </div>
          </div>

          <aside className="rounded-[18px] border border-infamous-border/60 bg-infamous-card p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">What is included</h2>
            <div className="mt-5 space-y-3">
              {service.bullets.map((bullet) => (
                <div key={bullet} className="flex gap-3 rounded-xl border border-infamous-border/60 bg-infamous-panel p-4">
                  <CheckCircle2 className="mt-0.5 flex-shrink-0 text-infamous-green" size={18} />
                  <p className="text-sm leading-6 text-[#F5E8E8]/80">{bullet}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-16 rounded-[18px] border border-infamous-border/60 bg-infamous-darker p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">Best fit</p>
              <h2 className="mt-3 font-display text-3xl font-bold">Common use cases</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {service.bestFor.map((item) => (
                <div key={item} className="rounded-xl border border-infamous-border/60 bg-infamous-card p-4 text-sm font-semibold text-[#F5E8E8]/85">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {relatedGuides.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={20} className="text-infamous-red-light" />
              <h2 className="font-display text-2xl font-bold">Related guides</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedGuides.map((guide) => guide && (
                <Link key={guide.slug} to={`/resources/${guide.slug}`} className="group rounded-[18px] border border-infamous-border/60 bg-infamous-card p-5 transition hover:border-infamous-red/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-red-light">{guide.category}</p>
                  <h3 className="mt-2 font-bold text-[#F5E8E8] group-hover:text-infamous-red-light transition">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#B88989]">{guide.description}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-infamous-red-light">Read guide <ArrowRight size={14} /></p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16">
          <h2 className="font-display mb-6 text-2xl font-bold">Other services</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {servicePages.filter((item) => item.slug !== service.slug).slice(0, 3).map((item) => (
              <Link key={item.slug} to={`/services/${item.slug}`} className="rounded-[18px] border border-infamous-border/60 bg-infamous-card p-5 transition hover:border-infamous-red/30">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-red-light">{item.eyebrow}</p>
                <h3 className="mt-2 font-bold text-[#F5E8E8]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#B88989]">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ServiceDetailPage;
