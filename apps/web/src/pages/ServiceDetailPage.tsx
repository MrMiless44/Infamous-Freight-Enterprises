import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { findServicePage, servicePages } from '@/data/publicPages';

const ServiceDetailPage: React.FC = () => {
  const { serviceSlug } = useParams();
  const service = findServicePage(serviceSlug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <Link to="/services" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
              Services
            </Link>
            <div className="mb-5 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
              {service.icon}
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">{service.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{service.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">{service.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/request-quote" className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:opacity-90">
                Request a quote <ArrowRight size={17} />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50">
                Ask a question
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-infamous-border bg-infamous-card p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">What is included</h2>
            <div className="mt-5 space-y-3">
              {service.bullets.map((bullet) => (
                <div key={bullet} className="flex gap-3 rounded-2xl border border-infamous-border bg-[#111] p-4">
                  <CheckCircle2 className="mt-0.5 flex-shrink-0 text-green-400" size={18} />
                  <p className="text-sm leading-6 text-gray-300">{bullet}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-14 rounded-3xl border border-infamous-border bg-[#0f0f0f] p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Best fit</p>
              <h2 className="mt-2 text-3xl font-bold">Common use cases</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {service.bestFor.map((item) => (
                <div key={item} className="rounded-2xl border border-infamous-border bg-infamous-card p-4 text-sm font-semibold text-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-bold">Other services</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {servicePages
              .filter((item) => item.slug !== service.slug)
              .slice(0, 3)
              .map((item) => (
                <Link key={item.slug} to={`/services/${item.slug}`} className="rounded-2xl border border-infamous-border bg-infamous-card p-5 transition hover:border-infamous-orange/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-orange">{item.eyebrow}</p>
                  <h3 className="mt-2 font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{item.summary}</p>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ServiceDetailPage;
