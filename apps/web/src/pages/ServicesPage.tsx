import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { servicePages } from '@/data/publicPages';

const ServicesPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-infamous-dark px-6 py-16 text-[#F5E8E8]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 max-w-3xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">Services</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Freight services built around verified execution.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#B88989]">
            From small freight to full truckload, every service runs on the same operating standard — verified carriers, real-time tracking, and proof of delivery.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {servicePages.map((service) => {
            const ServiceIcon = service.Icon;
            return (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-[18px] border border-infamous-border/60 bg-infamous-card p-6 transition hover:border-infamous-red/30 hover:shadow-[0_0_18px_rgba(255,26,26,0.1)]"
              >
                <div className="mb-4 inline-flex w-fit rounded-xl bg-infamous-red/10 p-3 text-infamous-red-light">
                  <ServiceIcon size={24} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-red-light">{service.eyebrow}</p>
                <h2 className="mt-2 text-xl font-bold">{service.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#B88989]">{service.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-infamous-red-light">
                  Learn more <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="mt-16 rounded-[18px] border border-infamous-border/60 bg-infamous-darker p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">What stays consistent</p>
              <h2 className="mt-3 font-display text-3xl font-bold">Every service runs on the same operating standard.</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Complete quote intake before dispatch',
                'Verified driver and carrier handoff',
                'Tracking updates through delivery',
                'Proof of delivery and support follow-up',
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-infamous-border/60 bg-infamous-card p-4">
                  <CheckCircle2 className="mt-0.5 flex-shrink-0 text-infamous-green" size={18} />
                  <p className="text-sm leading-6 text-[#F5E8E8]/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ServicesPage;
