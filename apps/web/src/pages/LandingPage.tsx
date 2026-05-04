import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  Map as MapIcon,
  Route as RouteIcon,
  ShieldCheck,
  Tag,
  Truck,
  Users,
} from 'lucide-react';

const services = [
  {
    title: 'Book freight in minutes',
    description:
      'Send pickup, drop-off, and freight details. Dispatch confirms equipment, capacity, and price — no phone tag.',
    icon: <Truck size={22} />,
  },
  {
    title: 'Real-time shipment visibility',
    description:
      'Shippers and dispatchers see pickup, in-transit, and delivery status in one clean view, with proof at every step.',
    icon: <RouteIcon size={22} />,
  },
  {
    title: 'Verified driver and carrier network',
    description:
      'Identity, insurance, and authority checks before a load is assigned. No anonymous brokers, no double-brokering.',
    icon: <Users size={22} />,
  },
];

const trustPoints = [
  {
    title: 'Verified drivers',
    description:
      'Identity, insurance, FMCSA/DOT/MC, and bank verification before a load is dispatched.',
    icon: <ShieldCheck size={20} />,
  },
  {
    title: 'Real-time tracking',
    description:
      'Pickup, in-transit, and delivery updates that shippers can actually rely on.',
    icon: <MapIcon size={20} />,
  },
  {
    title: 'Proof at every step',
    description:
      'Driver check-in, photo proof at pickup and delivery, signed POD, and a full audit trail.',
    icon: <Camera size={20} />,
  },
];

const processSteps = [
  'Request a quote with complete freight details',
  'Dispatch reviews rate, equipment, and verified carrier fit',
  'Shipment is tracked from pickup through delivery',
  'POD, invoice, and support follow-up stay organized',
];

const audienceCards = [
  {
    label: 'Get a Freight Quote',
    description: 'Pallet, box truck, cargo van, sprinter — local and regional, same-day or scheduled.',
    href: '/request-quote',
    icon: <Truck size={20} />,
  },
  {
    label: 'Apply to Drive',
    description: 'Free to start. Only pay after you complete jobs. Verified drivers get priority loads.',
    href: '/drive',
    icon: <Users size={20} />,
  },
  {
    label: 'Pricing',
    description: 'Shipper plans, driver tiers, and partner sponsorships in one place.',
    href: '/pricing',
    icon: <Tag size={20} />,
  },
];

const navLinks = [
  { label: 'Quote', href: '/request-quote' },
  { label: 'Track', href: '/track-shipment' },
  { label: 'Drivers', href: '/drive' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Partners', href: '/partners' },
];

const LandingPage: React.FC = () => {
  return (
    <main id="main-content" className="min-h-screen bg-[#090909] text-white">
      <header className="sticky top-0 z-40 border-b border-infamous-border bg-[#090909]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Infamous Freight home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-infamous-orange font-black text-white">
              IF
            </span>
            <span>
              <span className="block text-lg font-black leading-none">Infamous Freight</span>
              <span className="text-xs uppercase tracking-[0.18em] text-gray-500">AI Freight Command Center</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-300" aria-label="Primary navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-lg px-3 py-2 font-semibold transition hover:bg-infamous-card hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/customer-portal"
              className="rounded-xl border border-infamous-border bg-infamous-card px-4 py-2 text-sm font-semibold text-white transition hover:border-infamous-orange/50"
            >
              Customer Portal
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-infamous-orange px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-infamous-border bg-gradient-to-b from-[#17110d] to-[#090909]">
        <div className="mx-auto flex min-h-[76vh] max-w-7xl flex-col px-6 py-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="max-w-3xl flex-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-infamous-orange/30 bg-infamous-orange/10 px-4 py-2 text-sm text-infamous-orange">
              <Clock3 size={16} /> Verified drivers. Real-time tracking. Proof at every step.
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Book, track, and manage freight faster — with verified drivers and simple pricing.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
              Infamous Freight helps businesses move local and regional freight without the phone tag — pallet,
              box truck, cargo van, and sprinter loads booked, tracked, and delivered with proof on every shipment.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/request-quote"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Get a Freight Quote <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-orange/50 bg-infamous-orange/10 px-5 py-3 font-semibold text-white transition hover:bg-infamous-orange/20"
              >
                Login
              </Link>
              <Link
                to="/drive"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
              >
                Apply to Drive
              </Link>
              <Link
                to="/track-shipment"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-transparent px-5 py-3 font-semibold text-gray-300 transition hover:border-infamous-orange/50 hover:text-white"
              >
                Track Shipment
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {['Verified', 'Tracked', 'Insured', 'Proof of delivery'].map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-infamous-border bg-infamous-card/70 p-3 text-sm text-gray-300"
                >
                  <CheckCircle2 className="mb-2 text-green-400" size={16} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex-1 lg:mt-0">
            <div className="rounded-3xl border border-infamous-border bg-infamous-card p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Operations snapshot</p>
                  <h2 className="text-xl font-bold">Today&apos;s freight board</h2>
                </div>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Open quotes', '18'],
                  ['Active loads', '42'],
                  ['On-time rate', '96%'],
                  ['PODs due', '5'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-infamous-border bg-[#111] p-4">
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ['IF-20491', 'Chicago, IL to Dallas, TX', 'In transit'],
                  ['IF-20492', 'Atlanta, GA to Charlotte, NC', 'At pickup'],
                  ['IF-20493', 'Houston, TX to Phoenix, AZ', 'Exception review'],
                ].map(([ref, route, status]) => (
                  <div
                    key={ref}
                    className="flex items-center justify-between rounded-2xl border border-infamous-border bg-[#111] p-4"
                  >
                    <div>
                      <p className="font-mono text-xs text-gray-500">{ref}</p>
                      <p className="text-sm font-semibold">{route}</p>
                    </div>
                    <span className="rounded-full bg-infamous-orange/10 px-3 py-1 text-xs text-infamous-orange">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-infamous-border bg-[#0c0c0c]">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">
              Why shippers choose Infamous
            </p>
            <h2 className="mt-2 text-3xl font-bold">Trust is the product.</h2>
            <p className="mt-3 max-w-2xl text-gray-400">
              Cargo theft and double-brokering cost the freight industry hundreds of millions every year. Every load
              on Infamous Freight runs on verification, real-time visibility, and recorded proof.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-infamous-border bg-infamous-card p-6"
              >
                <div className="mb-4 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
                  {point.icon}
                </div>
                <h3 className="text-lg font-bold">{point.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">
              How freight moves on Infamous
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              The three workflows that decide whether a load delivers clean.
            </h2>
          </div>
          <Link to="/freight-assistant" className="inline-flex items-center gap-2 text-infamous-orange hover:underline">
            Try freight assistant <Bot size={17} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="rounded-2xl border border-infamous-border bg-infamous-card p-6">
              <div className="mb-4 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-infamous-border bg-[#0f0f0f]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Execution path</p>
            <h2 className="mt-2 text-3xl font-bold">From request to paid invoice.</h2>
            <p className="mt-4 text-gray-400">
              Customer quote intake and tracking flow into the same data dispatch, carriers, and accounting use to
              keep the load moving and the invoice paid.
            </p>
          </div>
          <div className="space-y-3">
            {processSteps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-infamous-border bg-infamous-card p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-infamous-orange text-sm font-bold">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Get started</p>
          <h2 className="mt-2 text-3xl font-bold">Ship a load. Drive a load. Or partner with the network.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {audienceCards.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group rounded-2xl border border-infamous-border bg-infamous-card p-6 transition hover:border-infamous-orange/50"
            >
              <div className="mb-4 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
                {item.icon}
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{item.label}</h3>
                <ArrowRight size={18} className="text-gray-500 transition group-hover:text-infamous-orange" />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-16 md:grid-cols-3">
        {[
          { label: 'Customer Portal', href: '/customer-portal', icon: <FileText size={20} /> },
          { label: 'Carrier Portal', href: '/carrier-portal', icon: <ShieldCheck size={20} /> },
          { label: 'Operations Dashboard', href: '/ops', icon: <BarChart3 size={20} /> },
        ].map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="group flex items-center justify-between rounded-2xl border border-infamous-border bg-infamous-card p-5 transition hover:border-infamous-orange/50"
          >
            <span className="flex items-center gap-3 font-semibold text-white">
              <span className="text-infamous-orange">{item.icon}</span>
              {item.label}
            </span>
            <ArrowRight size={18} className="text-gray-500 transition group-hover:text-infamous-orange" />
          </Link>
        ))}
      </section>
    </main>
  );
};

export default LandingPage;
