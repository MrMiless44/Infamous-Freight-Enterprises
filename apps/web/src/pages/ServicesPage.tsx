import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { servicePages } from '@/data/publicPages';

const ServicesPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Services</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Freight services built around verified execution.</h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">From small freight to regional lanes, Infamous Freight connects quote intake, dispatch, tracking, and proof of delivery in one workflow.</p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {servicePages.map((service) => {
            const ServiceIcon = service.Icon;
            return (
              <Link key={service.slug} to={`/services/${service.slug}`} className="group flex h-full flex-col rounded-3xl border border-infamous-border bg-infamous-card p-6 transition hover:border-infamous-orange/50">
                <div className="mb-4 inline-flex w-fit rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange"><ServiceIcon size={24} /></div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-orange">{service.eyebrow}</p>
                <h2 className="mt-2 text-xl font-bold">{service.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-gray-400">{service.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-infamous-orange">Learn more <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </section>

        <section className="mt-14 rounded-3xl border border-infamous-border bg-[#0f0f0f] p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">What stays consistent</p>
              <h2 className="mt-2 text-3xl font-bold">Every service runs on the same operating standard.</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {['Complete quote intake before dispatch', 'Verified driver and carrier handoff', 'Tracking updates through delivery', 'Proof of delivery and support follow-up'].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-infamous-border bg-infamous-card p-4"><CheckCircle2 className="mt-0.5 flex-shrink-0 text-green-400" size={18} /><p className="text-sm leading-6 text-gray-300">{item}</p></div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ServicesPage;
