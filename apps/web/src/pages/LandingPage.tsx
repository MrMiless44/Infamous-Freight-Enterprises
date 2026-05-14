import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Search,
  Shield,
  Truck,
  Users,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  Eye,
  Infinity,
  Monitor,
  Cpu,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { trackPublicEvent, trackFunnelEvent } from '@/lib/analytics';
import { BRAND } from '@/lib/brand';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Request Quote', href: '/request-quote' },
  { label: 'Track Shipment', href: '/track-shipment' },
  { label: 'Carriers', href: '/carrier-portal' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
] as const;

const executionSteps = [
  { number: '01', title: 'Get a Quote', description: 'Submit freight details, pickup and delivery info. Get a rate back fast.', icon: FileText },
  { number: '02', title: 'Book the Shipment', description: 'Confirm equipment, rate, and timing. Your load is locked in.', icon: Package },
  { number: '03', title: 'Track in Real Time', description: 'Follow every status update from pickup through delivery.', icon: Eye },
  { number: '04', title: 'Get Proof & Invoice', description: 'POD captured, invoice generated, payment processed. Done.', icon: CheckCircle2 },
];

const trustCards = [
  {
    icon: Shield,
    title: 'Documented Handoffs',
    description: 'Carrier documents are reviewed before dispatch and the shipment details are checked before booking.',
  },
  {
    icon: MapPin,
    title: 'Shipment Updates',
    description: 'Status updates, ETA changes, and exception notes are kept connected to the shipment record where available.',
  },
  {
    icon: Clock,
    title: 'Fast Execution',
    description: 'Quote requests are routed around lane, equipment, timing, and contact details so dispatch can respond with the right next step.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'Rate details and payment terms are confirmed in writing before the shipment is booked.',
  },
  {
    icon: FileText,
    title: 'Proof of Delivery',
    description: 'Bills of lading, delivery notes, photos, and proof documents can stay attached to the shipment workflow.',
  },
  {
    icon: BarChart3,
    title: 'Operations Visibility',
    description: 'Quote, load, tracking, and document context stays organized so teams can see what needs follow-up.',
  },
];

const shipperBenefits = [
  'Book shipments in minutes',
  'Track loads in real time',
  'Manage quotes and invoices',
  'Download proof of delivery',
  'Message support directly',
  'Rebook frequent lanes',
];

const carrierBenefits = [
  'Browse available loads',
  'One-tap status updates',
  'Upload POD from your phone',
  'Payment terms confirmed in writing',
  'Simple dispatch communication',
  'GPS tracking built in',
];

const techFeatures = [
  {
    icon: Monitor,
    title: 'Command Center Dashboard',
    description: 'Real-time operations overview with KPIs, live shipment map, active loads, alerts, and dispatch controls.',
  },
  {
    icon: Cpu,
    title: 'Automated Workflows',
    description: 'Quote intake, carrier assignment, status updates, POD collection, and invoicing — connected in one system.',
  },
  {
    icon: Globe,
    title: 'Multi-Role Access',
    description: 'Separate interfaces for shippers, carriers, drivers, dispatchers, and admins — each sees only what they need.',
  },
  {
    icon: Zap,
    title: 'Mobile-First Driver App',
    description: 'Accept loads, navigate, update status, upload POD, and message dispatch — all from a phone.',
  },
];

const servicesList = [
  { title: 'Full Truckload', slug: 'full-truckload', description: 'Dedicated truck capacity for larger shipments.' },
  { title: 'Less Than Truckload', slug: 'ltl-freight', description: 'Share truck space for cost-effective smaller loads.' },
  { title: 'Flatbed', slug: 'flatbed', description: 'Open-deck trailers for oversized and heavy freight.' },
  { title: 'Reefer', slug: 'reefer', description: 'Temperature-controlled freight for perishable and sensitive goods.' },
  { title: 'Expedited Freight', slug: 'expedited', description: 'Time-critical shipments with priority handling.' },
  { title: 'Dedicated Lanes', slug: 'dedicated-lanes', description: 'Recurring routes with locked-in pricing and carriers.' },
  { title: 'Freight Brokerage', slug: 'freight-brokerage', description: 'Brokerage support for matching shipment details with carrier capacity.' },
  { title: 'Final Mile', slug: 'final-mile', description: 'Last-leg delivery from distribution center to end customer.' },
  { title: 'Amazon Delivery', slug: 'amazon-delivery', description: 'MCF and shipping workflow planning for eligible e-commerce orders.' },
];

const faqItems = [
  {
    question: 'How do I get a freight quote?',
    answer: 'Submit your shipment details on the Request a Quote page — pickup location, destination, freight type, timing, and contact information. Dispatch reviews the request and follows up with the next step.',
  },
  {
    question: 'What types of freight do you handle?',
    answer: 'Full truckload, LTL, flatbed, reefer, expedited, local, and regional freight. We handle everything from cargo vans to full tractor-trailers.',
  },
  {
    question: 'How does shipment tracking work?',
    answer: 'Every load gets a live tracking timeline from pickup to delivery. Enter your tracking number on the Track Shipment page for instant visibility — no login required.',
  },
  {
    question: 'How do carriers get paid?',
    answer: 'Carrier payment terms are confirmed in writing before dispatch. Carriers should review the written rate confirmation and payment terms for each load.',
  },
  {
    question: 'What is the carrier vetting process?',
    answer: 'Carrier documents and shipment requirements are reviewed before dispatch, and the agreed equipment, timing, and communication expectations are documented for the load.',
  },
  {
    question: 'Do you offer same-day freight?',
    answer: 'Expedited options can be requested for time-sensitive freight. Availability depends on lane, timing, equipment, and carrier capacity.',
  },
];

const FaqItem: React.FC<{ id: string; question: string; answer: string }> = ({ id, question, answer }) => {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-panel`;
  return (
    <div className="border-b border-infamous-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-base font-semibold text-[#F5E8E8]">{question}</span>
        <ChevronDown
          aria-hidden="true"
          size={18}
          className={`shrink-0 text-infamous-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div id={panelId} aria-hidden={!open} className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-60 pb-5' : 'max-h-0'}`}>
        <p className="text-sm leading-7 text-[#B88989]">{answer}</p>
      </div>
    </div>
  );
};

const workflowHighlights = [
  { label: 'Quote Intake', value: 'Lane + contact first', color: 'text-infamous-red-light' },
  { label: 'Booking', value: 'Details verified', color: 'text-[#36D399]' },
  { label: 'Dispatch', value: 'Documents reviewed', color: 'text-infamous-ember' },
  { label: 'Delivery', value: 'Updates documented', color: 'text-infamous-orange' },
];

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    trackFunnelEvent('funnel_landing_visit', { referrer: document.referrer || 'direct' });
  }, []);

  return (
    <main id="main-content" className="min-h-screen overflow-hidden bg-infamous-dark text-[#F5E8E8]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-infamous-border bg-infamous-darker/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Infamous Freight home">
            <Infinity aria-hidden="true" size={28} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.8))' }} />
            <span className="hidden sm:block">
              <span className="block font-display text-lg font-black leading-none text-[#F5E8E8]">{BRAND.displayName}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-infamous-muted">{BRAND.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#B88989] transition hover:bg-white/5 hover:text-[#F5E8E8]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              onClick={() => trackPublicEvent('login_cta_click', { source: 'header' })}
              className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-[#B88989] transition hover:text-[#F5E8E8]"
            >
              Login
            </Link>
            <Link
              to="/request-quote"
              onClick={() => trackPublicEvent('quote_cta_click', { source: 'header' })}
              className="btn-primary text-sm glow-high"
            >
              Get a Quote
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#B88989] hover:text-[#F5E8E8] hover:bg-white/5 transition"
              aria-controls="landing-mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav id="landing-mobile-navigation" className="lg:hidden border-t border-infamous-border bg-infamous-darker px-5 py-4 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#B88989] transition hover:bg-white/5 hover:text-[#F5E8E8]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#B88989] transition hover:text-[#F5E8E8]"
            >
              Login
            </Link>
          </nav>
        )}
      </header>

      {/* === HERO === */}
      <section className="relative border-b border-infamous-border">
        <div className="absolute inset-0 redline-bg" />
        <div className="absolute inset-0 freight-grid" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-infamous-red/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-6 lg:py-36">
          <div className="max-w-3xl">
            <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-infamous-red-light mb-6">
              {BRAND.tagline}
            </p>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Freight Quotes, Dispatch Coordination, and{' '}
              <span className="text-infamous-red-light text-glow">Shipment Visibility.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#B88989]">
              Infamous Freight helps shippers, carriers, and dispatch teams move freight with clear intake, written confirmations, tracking context, and communication from quote to delivery.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/request-quote"
                onClick={() => trackPublicEvent('quote_cta_click', { source: 'hero' })}
                className="btn-primary btn-lg inline-flex items-center justify-center gap-2 glow-high"
              >
                Get a Freight Quote <ArrowRight size={20} />
              </Link>
              <Link
                to="/track-shipment"
                onClick={() => trackPublicEvent('tracking_cta_click', { source: 'hero' })}
                className="btn-secondary btn-lg inline-flex items-center justify-center gap-2"
              >
                <Search size={20} /> Track a Shipment
              </Link>
            </div>
          </div>

          {/* Metrics bar */}
          <div className="mt-20">
            <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-3 text-center lg:text-left">Operating process</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {workflowHighlights.map((metric) => (
              <div key={metric.label} className="glass-card-subtle rounded-[18px] p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-infamous-muted">{metric.label}</p>
                <p className={`mt-2 text-lg font-black font-display ${metric.color}`}>{metric.value}</p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* === SERVICES OVERVIEW === */}
      <section className="border-b border-infamous-border bg-infamous-darker">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-6">
          <div className="mb-14 max-w-2xl">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">Our Services</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase lg:text-4xl">
              Freight services for every load size and timeline
            </h2>
            <p className="mt-4 text-[#B88989] leading-7">
              From expedited cargo vans to full truckload, every service starts with clear shipment details, written expectations, and dispatch follow-up.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {servicesList.map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="group glass-card-subtle rounded-[18px] p-6 transition hover:border-infamous-red/30 hover:shadow-[0_0_18px_rgba(255,26,26,0.12)]"
              >
                <h3 className="text-lg font-bold text-[#F5E8E8] group-hover:text-infamous-red-light transition">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#B88989]">{service.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-infamous-red-light opacity-0 group-hover:opacity-100 transition">
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-infamous-red-light hover:underline"
            >
              View all services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="border-b border-infamous-border">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-6">
          <div className="mb-14 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">How It Works</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase lg:text-4xl">Quote. Book. Track. Deliver.</h2>
            <p className="mt-4 mx-auto max-w-2xl text-[#B88989]">
              A practical freight workflow from first request to delivery documents.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {executionSteps.map((step) => (
              <div key={step.number} className="relative glass-card-subtle rounded-[18px] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-infamous-red/10 text-sm font-black text-infamous-red-light border border-infamous-red/20">
                    {step.number}
                  </span>
                  <step.icon size={20} className="text-infamous-muted" />
                </div>
                <h3 className="text-lg font-bold text-[#F5E8E8]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#B88989]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === LIVE TRACKING PREVIEW === */}
      <section className="border-b border-infamous-border bg-infamous-darker">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-6">
          <div className="mb-14 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">Shipment Visibility</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase lg:text-4xl">Keep freight details connected.</h2>
            <p className="mt-4 mx-auto max-w-2xl text-[#B88989]">
              Lane details, status updates, exceptions, and delivery documents stay organized around the shipment.
            </p>
          </div>

          <div className="glass-card rounded-[18px] overflow-hidden">
            <div className="border-b border-infamous-border bg-infamous-panel/50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-infamous-red/60" />
                <div className="w-3 h-3 rounded-full bg-infamous-orange/60" />
                <div className="w-3 h-3 rounded-full bg-[#36D399]/60" />
                <span className="ml-4 text-xs text-infamous-muted font-mono">Operations Dashboard</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-infamous-red-light">
                <span className="w-1.5 h-1.5 rounded-full bg-infamous-red-light animate-pulse" /> Live
              </span>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Lane details', value: 'Ready', color: 'text-infamous-red-light' },
                  { label: 'Pickup timing', value: 'Confirmed', color: 'text-infamous-orange' },
                  { label: 'Documents', value: 'Attached', color: 'text-[#36D399]' },
                  { label: 'Exceptions', value: 'Flagged', color: 'text-[#FF0033]' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[14px] border border-infamous-border/60 bg-infamous-panel p-4">
                    <p className="text-xs text-infamous-muted">{stat.label}</p>
                    <p className={`mt-2 text-2xl font-black font-display ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2.5">
                {[
                  { ref: 'IF-20491', lane: 'Chicago, IL → Dallas, TX', status: 'In Transit', statusClass: 'badge-blue', eta: 'ETA 6:30 PM' },
                  { ref: 'IF-20492', lane: 'Atlanta, GA → Charlotte, NC', status: 'At Pickup', statusClass: 'badge-green', eta: 'ETA 4:00 PM' },
                  { ref: 'IF-20493', lane: 'Houston, TX → Phoenix, AZ', status: 'Delayed', statusClass: 'badge-orange', eta: 'ETA TBD' },
                  { ref: 'IF-20494', lane: 'Los Angeles, CA → Seattle, WA', status: 'Delivered', statusClass: 'badge-green', eta: 'Complete' },
                ].map((load) => (
                  <div key={load.ref} className="flex items-center justify-between rounded-[14px] border border-infamous-border/50 bg-infamous-dark/50 px-4 py-3.5">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-infamous-muted">{load.ref}</span>
                      <span className="text-[15px] font-medium text-[#F5E8E8]">{load.lane}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-infamous-muted hidden sm:inline">{load.eta}</span>
                      <span className={`${load.statusClass} text-xs`}>{load.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === WHY INFAMOUS FREIGHT === */}
      <section className="border-b border-infamous-border">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-6">
          <div className="mb-14 max-w-2xl">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">Why Infamous Freight</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase lg:text-4xl">
              Know where your freight is, what it costs, and who is moving it.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trustCards.map((card) => (
              <article key={card.title} className="group glass-card-subtle rounded-[18px] p-6 transition hover:border-infamous-red/30">
                <div className="mb-4 inline-flex rounded-lg bg-infamous-red/10 p-3 text-infamous-red-light">
                  <card.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#F5E8E8]">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#B88989]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* === SHIPPER & CARRIER BENEFITS === */}
      <section className="border-b border-infamous-border bg-infamous-darker">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Shipper side */}
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-infamous-red/20 bg-infamous-red/5 px-4 py-1.5 text-xs font-semibold text-infamous-red-light uppercase tracking-wider">
                <Truck size={14} /> For Shippers
              </div>
              <h3 className="mt-5 font-display text-2xl font-black uppercase">Request freight with clear details</h3>
              <p className="mt-4 text-[#B88989] leading-7">
                Start with the lane, equipment, timing, and contact details dispatch needs to respond. Add freight details when they are available.
              </p>
              <ul className="mt-8 space-y-3">
                {shipperBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-[15px] text-[#F5E8E8]/80">
                    <CheckCircle2 size={16} className="shrink-0 text-[#36D399]" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/request-quote"
                onClick={() => trackPublicEvent('portal_cta_click', { portal: 'customer', source: 'shipper_section' })}
                className="mt-10 btn-primary inline-flex items-center gap-2 glow-medium"
              >
                Request Quote <ArrowRight size={16} />
              </Link>
            </div>

            {/* Carrier side */}
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#36D399]/20 bg-[#36D399]/5 px-4 py-1.5 text-xs font-semibold text-[#36D399] uppercase tracking-wider">
                <Users size={14} /> For Carriers & Drivers
              </div>
              <h3 className="mt-5 font-display text-2xl font-black uppercase">Move freight with written expectations</h3>
              <p className="mt-4 text-[#B88989] leading-7">
                Carrier and driver workflows focus on load details, communication, status updates, proof documents, and payment terms confirmed in writing.
              </p>
              <ul className="mt-8 space-y-3">
                {carrierBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-[15px] text-[#F5E8E8]/80">
                    <CheckCircle2 size={16} className="shrink-0 text-[#36D399]" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/carrier-portal"
                onClick={() => trackPublicEvent('portal_cta_click', { portal: 'carrier', source: 'carrier_section' })}
                className="mt-10 inline-flex items-center gap-2 rounded-xl border border-[#36D399]/20 bg-[#36D399]/10 px-6 py-3 text-sm font-bold text-[#36D399] transition hover:bg-[#36D399]/15"
              >
                Carrier Portal <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === TECHNOLOGY FEATURES === */}
      <section className="border-b border-infamous-border">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-6">
          <div className="mb-14 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">Technology</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase lg:text-4xl">Built for practical freight follow-through.</h2>
            <p className="mt-4 mx-auto max-w-2xl text-[#B88989]">
              Public quote intake, tracking, portals, and dispatch tools support the same operating workflow.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {techFeatures.map((feat) => (
              <div key={feat.title} className="glass-card-subtle rounded-[18px] p-7 transition hover:border-infamous-red/25">
                <div className="mb-4 inline-flex rounded-lg bg-infamous-red/10 p-3 text-infamous-red-light border border-infamous-red/15">
                  <feat.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-[#F5E8E8]">{feat.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#B88989]">{feat.description}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* === TRUST PROCESS === */}
      <section className="border-b border-infamous-border bg-infamous-darker">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-6">
          <div className="mb-14 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">How Trust Is Built</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase lg:text-4xl">Clear steps before freight moves.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['Quote details checked', 'Origin, destination, equipment, pickup timing, freight details, and contact information are reviewed before dispatch follow-up.'],
              ['Terms confirmed in writing', 'Rates, payment terms, pickup details, delivery expectations, and required documents are kept explicit before booking.'],
              ['Updates stay connected', 'Shipment notes, tracking references, exceptions, and delivery documents stay tied to the load record where available.'],
            ].map(([title, description]) => (
              <div key={title} className="glass-card-subtle rounded-[18px] p-6">
                <CheckCircle2 className="mb-4 text-infamous-red-light" size={22} />
                <h3 className="text-lg font-bold text-[#F5E8E8]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#B88989]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section className="border-b border-infamous-border">
        <div className="mx-auto max-w-3xl px-5 py-24 lg:px-6">
          <div className="mb-12 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase">Frequently Asked Questions</h2>
          </div>

          <div className="glass-card-subtle rounded-[18px] px-6">
            {faqItems.map((faq, index) => (
              <FaqItem key={faq.question} id={`faq-${index}`} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-infamous-muted">
            Have another question?{' '}
            <Link to="/faq" className="font-semibold text-infamous-red-light hover:underline">View all FAQs</Link>
            {' · '}
            <Link to="/contact" className="font-semibold text-infamous-red-light hover:underline">Contact dispatch</Link>
          </p>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="border-b border-infamous-border bg-infamous-darker">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-6">
          <div
            className="rounded-2xl border border-infamous-red/20 p-12 lg:p-16 text-center"
            style={{ background: 'radial-gradient(circle at top, rgba(255, 26, 26, 0.12), transparent 60%), rgba(36, 16, 19, 0.85)' }}
          >
            <h2 className="font-display text-3xl font-black uppercase lg:text-4xl">Ready to move freight?</h2>
            <p className="mt-5 mx-auto max-w-xl text-lg text-[#B88989]">
              Send the lane, timing, equipment, and contact details. Dispatch can follow up with the next step.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/request-quote"
                onClick={() => trackPublicEvent('quote_cta_click', { source: 'final_cta' })}
                className="btn-primary btn-lg inline-flex items-center justify-center gap-2 glow-high"
              >
                Get a Freight Quote <ArrowRight size={20} />
              </Link>
              <Link
                to="/track-shipment"
                onClick={() => trackPublicEvent('tracking_cta_click', { source: 'final_cta' })}
                className="btn-secondary btn-lg inline-flex items-center justify-center gap-2"
              >
                <Search size={20} /> Track a Shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-infamous-darker px-5 py-14 text-sm text-[#B88989] lg:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3 text-[#F5E8E8]" aria-label="Infamous Freight home">
              <Infinity aria-hidden="true" size={32} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 10px rgba(255, 59, 48, 0.8))' }} />
              <span className="font-display text-lg font-black">Infamous Freight</span>
            </Link>
            <p className="mt-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-infamous-muted">{BRAND.tagline}</p>
            <p className="mt-3 max-w-md leading-6">
              Freight services with clear quote intake, documented handoffs, tracking context, and delivery follow-up.
            </p>
            <div className="mt-4 space-y-1.5">
              <a href={BRAND.dispatchPhoneHref} className="flex items-center gap-2 text-[#B88989] hover:text-infamous-red-light transition">
                <Phone size={14} className="text-infamous-red-light" /> {BRAND.dispatchPhone}
              </a>
              <a href={`mailto:${BRAND.supportEmail}`} className="flex items-center gap-2 text-[#B88989] hover:text-infamous-red-light transition">
                <Mail size={14} className="text-infamous-red-light" /> {BRAND.supportEmail}
              </a>
            </div>
            <p className="mt-6 text-xs text-infamous-muted">© {new Date().getFullYear()} {BRAND.legalName || 'Infamous Freight'}. All rights reserved.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#F5E8E8]/80">Freight</h2>
              <div className="space-y-2.5">
                <Link to="/request-quote" className="block hover:text-infamous-red-light transition">Get a Quote</Link>
                <Link to="/track-shipment" className="block hover:text-infamous-red-light transition">Track Shipment</Link>
                <Link to="/load-board" className="block hover:text-infamous-red-light transition">Load Board</Link>
                <Link to="/pricing" className="block hover:text-infamous-red-light transition">Pricing</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#F5E8E8]/80">Services</h2>
              <div className="space-y-2.5">
                <Link to="/services" className="block hover:text-infamous-red-light transition">All Services</Link>
                <Link to="/services/full-truckload" className="block hover:text-infamous-red-light transition">Full Truckload</Link>
                <Link to="/services/flatbed" className="block hover:text-infamous-red-light transition">Flatbed</Link>
                <Link to="/services/expedited" className="block hover:text-infamous-red-light transition">Expedited</Link>
                <Link to="/services/amazon-delivery" className="block hover:text-infamous-red-light transition">Amazon Delivery</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#F5E8E8]/80">Network</h2>
              <div className="space-y-2.5">
                <Link to="/customer-portal" className="block hover:text-infamous-red-light transition">Shipper Portal</Link>
                <Link to="/carrier-portal" className="block hover:text-infamous-red-light transition">Carrier Portal</Link>
                <Link to="/drive" className="block hover:text-infamous-red-light transition">Drive With Us</Link>
                <Link to="/partners" className="block hover:text-infamous-red-light transition">Partners</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#F5E8E8]/80">Company</h2>
              <div className="space-y-2.5">
                <Link to="/about" className="block hover:text-infamous-red-light transition">About</Link>
                <Link to="/faq" className="block hover:text-infamous-red-light transition">FAQ</Link>
                <Link to="/contact" className="block hover:text-infamous-red-light transition">Contact</Link>
                <Link to="/terms" className="block hover:text-infamous-red-light transition">Terms</Link>
                <Link to="/privacy" className="block hover:text-infamous-red-light transition">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
