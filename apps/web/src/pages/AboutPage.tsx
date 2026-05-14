import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, Headset, LayoutDashboard, Phone, Shield, ShieldCheck, Truck, Users, Zap } from 'lucide-react';
import { BRAND } from '@/lib/brand';

const standards = [
  'Verify drivers, carriers, insurance, authority, and payment details before loads move',
  'Give shippers simple quote intake, live tracking, and proof-of-delivery visibility',
  'Keep dispatch, carriers, customers, and accounting working from one operational record',
  'Reduce phone tag, missed updates, and preventable exception confusion',
];

const values = [
  {
    title: 'Trust before speed',
    description: 'Fast freight still has to be verified. We prioritize clean carrier records, clear paperwork, and proof at every step.',
    icon: <ShieldCheck size={22} />,
  },
  {
    title: 'Visibility beats guessing',
    description: 'Customers should not have to chase basic shipment status. Tracking, ETA, notes, and POD should be easy to find.',
    icon: <Eye size={22} />,
  },
  {
    title: 'Built for operators',
    description: 'The platform is built around the daily freight workflow: quote, assign, dispatch, track, deliver, invoice, follow up.',
    icon: <Truck size={22} />,
  },
];

const metrics = [
  { value: '15+', label: 'Equipment and service types', icon: <Truck size={18} /> },
  { value: '24/7', label: 'Dispatch availability', icon: <Headset size={18} /> },
  { value: 'Real-time', label: 'Shipment tracking and ETA', icon: <Zap size={18} /> },
  { value: 'End-to-end', label: 'Quote to POD platform', icon: <LayoutDashboard size={18} /> },
];

const commitments = [
  { title: 'Documented rate confirmations', description: 'Written rate agreements before any load moves — no verbal-only arrangements.' },
  { title: 'Carrier document review', description: 'Insurance, authority, and operating credentials verified and kept on file.' },
  { title: 'Proof-of-delivery workflows', description: 'BOL signatures, delivery photos, and timestamps captured and accessible to all parties.' },
  { title: 'Transparent communication', description: 'Status updates, ETA changes, and exception alerts pushed proactively — not on request.' },
];

const AboutPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-[#F5E8E8]">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">About Infamous Freight</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              Freight should be easier to book, easier to track, and harder to fake.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#F5E8E8]/80">
              Infamous Freight is building a verified freight operations platform for shippers, drivers, carriers, and dispatch teams. The goal is simple: move freight with less confusion, more proof, and cleaner handoffs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/request-quote" className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90">
                Request a quote <ArrowRight size={17} />
              </Link>
              <Link to="/drive" className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-5 py-3 font-semibold text-[#F5E8E8] transition hover:border-infamous-orange/50">
                Apply to drive
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-infamous-border bg-infamous-card p-6 shadow-2xl">
            <Users className="mb-4 text-infamous-orange" size={32} />
            <h2 className="text-2xl font-bold">Who we serve</h2>
            <div className="mt-5 space-y-4">
              {[
                ['Shippers', 'Companies that need local and regional freight moved with clear pricing and reliable updates.'],
                ['Drivers and carriers', 'Verified operators looking for cleaner load opportunities and organized documentation.'],
                ['Dispatch teams', 'Operations teams that need quote, load, tracking, POD, and invoice workflows in one place.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-infamous-border bg-infamous-panel p-4">
                  <h3 className="font-bold text-[#F5E8E8]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#B88989]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-infamous-border bg-infamous-card p-5 text-center">
              <div className="mx-auto mb-3 inline-flex rounded-xl bg-infamous-orange/10 p-2.5 text-infamous-orange">{metric.icon}</div>
              <p className="text-2xl font-black text-[#F5E8E8]">{metric.value}</p>
              <p className="mt-1 text-xs leading-5 text-[#B88989]">{metric.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="rounded-3xl border border-infamous-border bg-infamous-card p-6">
              <div className="mb-4 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">{value.icon}</div>
              <h2 className="text-xl font-bold">{value.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#B88989]">{value.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 rounded-3xl border border-infamous-border bg-[#0f0f0f] p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Operating standards</p>
              <h2 className="mt-2 text-3xl font-bold">Built around verification and proof.</h2>
              <p className="mt-3 text-[#B88989]">The platform is designed to reduce double-brokering risk, missed updates, and loose paperwork.</p>
            </div>
            <div className="grid gap-3">
              {standards.map((standard) => (
                <div key={standard} className="flex gap-3 rounded-2xl border border-infamous-border bg-infamous-card p-4">
                  <CheckCircle2 className="mt-0.5 flex-shrink-0 text-green-400" size={18} />
                  <p className="text-sm leading-6 text-[#F5E8E8]/80">{standard}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Our commitments</p>
          <h2 className="mt-2 text-3xl font-bold">How we operate, documented.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {commitments.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-infamous-border bg-infamous-card p-5">
                <Shield className="mt-0.5 flex-shrink-0 text-infamous-orange" size={20} />
                <div>
                  <h3 className="font-bold text-[#F5E8E8]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#B88989]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-infamous-border bg-infamous-card p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to move freight?</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#B88989]">
            Whether you need a quote, want to join as a carrier, or have questions about our services, the team is ready to help.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/request-quote" className="inline-flex items-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90">
              Request a quote <ArrowRight size={17} />
            </Link>
            <a href={BRAND.dispatchPhoneHref} className="inline-flex items-center gap-2 rounded-xl border border-infamous-border bg-infamous-panel px-5 py-3 font-semibold text-[#F5E8E8] transition hover:border-infamous-orange/50">
              <Phone size={17} /> Call {BRAND.dispatchPhone}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
