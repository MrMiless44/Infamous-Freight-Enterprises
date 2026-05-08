import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Camera,
  ChevronDown,
  ClipboardCheck,
  FileText,
  HelpCircle,
  LogIn,
  Map as MapIcon,
  Phone,
  RadioTower,
  Route as RouteIcon,
  ShieldCheck,
  Tag,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import { trackPublicEvent } from '@/lib/analytics';

const navLinks = [
  { label: 'Quote', href: '/request-quote', event: 'quote_cta_click' },
  { label: 'Track', href: '/track-shipment', event: 'tracking_cta_click' },
  { label: 'Load Board', href: '/load-board', event: 'load_board_view' },
  { label: 'Drivers', href: '/drive', event: 'driver_cta_click' },
  { label: 'Pricing', href: '/pricing', event: 'pricing_cta_click' },
  { label: 'Partners', href: '/partners', event: 'partner_cta_click' },
] as const;

const proofPoints = [
  { label: 'Driver verified', detail: 'FMCSA, insurance, ID', icon: <ShieldCheck size={18} /> },
  { label: 'Load tracked', detail: 'Pickup to POD timeline', icon: <RouteIcon size={18} /> },
  { label: 'Proof captured', detail: 'Photos, signatures, audit log', icon: <Camera size={18} /> },
];

const loadMetrics = [
  ['Open quotes', '18'],
  ['Active loads', '42'],
  ['On-time', '96.4%'],
  ['PODs due', '5'],
];

const liveLoads = [
  {
    ref: 'IF-20491',
    lane: 'Chicago, IL -> Dallas, TX',
    equipment: '26 ft box truck',
    status: 'In transit',
    tone: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  },
  {
    ref: 'IF-20492',
    lane: 'Atlanta, GA -> Charlotte, NC',
    equipment: 'Sprinter van',
    status: 'At pickup',
    tone: 'text-sky-300 bg-sky-400/10 border-sky-400/20',
  },
  {
    ref: 'IF-20493',
    lane: 'Houston, TX -> Phoenix, AZ',
    equipment: 'Pallet freight',
    status: 'Review',
    tone: 'text-amber-200 bg-amber-300/10 border-amber-300/20',
  },
];

const workflowCards = [
  {
    title: 'Quote intake that dispatch can use',
    description:
      'Pickup windows, freight details, accessorials, and contact data land in the same operations flow instead of scattered emails.',
    icon: <ClipboardCheck size={21} />,
  },
  {
    title: 'Verified carrier execution',
    description:
      'Driver, carrier, insurance, and authority checks sit in front of assignment so the load starts with the right operator.',
    icon: <Users size={21} />,
  },
  {
    title: 'Shipment visibility through payment',
    description:
      'Status updates, POD capture, customer tracking, invoice context, and exception history stay connected after delivery.',
    icon: <MapIcon size={21} />,
  },
];

const processSteps = [
  'A shipper submits freight details, pickup timing, and delivery requirements.',
  'Dispatch confirms equipment, rate, coverage, and verified carrier fit.',
  'The load moves with live status, proof events, and exception notes in one timeline.',
  'POD, invoice, and follow-up stay organized for customer and back-office teams.',
];

const audienceCards = [
  {
    label: 'Get a Freight Quote',
    description: 'Local and regional pallet, box truck, cargo van, and sprinter work.',
    href: '/request-quote',
    icon: <Truck size={20} />,
  },
  {
    label: 'Apply to Drive',
    description: 'Verified drivers get priority access to jobs and transparent dispatch support.',
    href: '/drive',
    icon: <Users size={20} />,
  },
  {
    label: 'Review Pricing',
    description: 'Shipper plans, driver tiers, and partner sponsorship options.',
    href: '/pricing',
    icon: <Tag size={20} />,
  },
];

const portalLinks = [
  { label: 'Customer Portal', href: '/customer-portal', icon: <FileText size={20} /> },
  { label: 'Carrier Portal', href: '/carrier-portal', icon: <ShieldCheck size={20} /> },
  { label: 'Operations Dashboard', href: '/ops', icon: <BarChart3 size={20} /> },
];

const faqItems = [
  {
    question: 'How do I get a freight quote from Infamous Freight?',
    answer:
      'Submit your shipment details including pickup location, destination, freight type, and timing on the Request a Quote page. Our dispatch team reviews your request and provides a rate with carrier and equipment confirmation, typically within hours.',
  },
  {
    question: 'What types of freight services do you offer?',
    answer:
      'Infamous Freight handles box truck (16–26 ft), cargo van, sprinter van, local metro, and regional multi-city freight. We also provide full freight dispatch support for owner-operators, small fleets, and brokerage operations.',
  },
  {
    question: 'How does real-time shipment tracking work?',
    answer:
      'Every load gets a live tracking timeline from pickup to delivery. You receive status updates, ETA changes, and proof-of-delivery events as they happen. Enter your reference number on the Track Shipment page for instant visibility.',
  },
  {
    question: 'What is your carrier vetting process?',
    answer:
      'Every carrier is verified for FMCSA authority, active insurance, safety scores, and driver identity before touching a load. We re-check credentials on policy events and maintain documented records for every assignment.',
  },
  {
    question: 'How do carriers and drivers get paid?',
    answer:
      'Standard carrier pay terms are included with every load. QuickPay options are available at 2.5% for 48-hour and 3.5% for same-day settlement. Instant payout is also available at 4% with transparent fee structure.',
  },
  {
    question: 'What areas does Infamous Freight service?',
    answer:
      'We cover local and regional freight lanes across core U.S. markets with verified carrier capacity. Service areas include major metro regions and multi-city distribution corridors with coordinated pickup and delivery windows.',
  },
  {
    question: 'Do you offer same-day or expedited freight?',
    answer:
      'Yes. Cargo van and sprinter van services support same-day pickup and delivery for time-sensitive freight. Expedited options are available for parts runs, medical supplies, trade show materials, and urgent commercial shipments.',
  },
  {
    question: 'How do I apply to drive with Infamous Freight?',
    answer:
      'Visit the Apply to Drive page and submit your name, contact info, city, equipment type, and any notes. Our onboarding team reviews applications and connects verified drivers with freight opportunities on matching lanes.',
  },
];

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-white">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-60 pb-5' : 'max-h-0'}`}
      >
        <p className="text-sm leading-7 text-zinc-400">{answer}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <main id="main-content" className="min-h-screen overflow-hidden bg-[#090909] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090909]/[0.92] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Infamous Freight home">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-infamous-orange font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset]">
              IF
            </span>
            <span>
              <span className="block text-lg font-black leading-none">Infamous Freight</span>
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Freight Command Center</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-300" aria-label="Primary navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => trackPublicEvent(item.event, { source: 'nav' })}
                className="rounded-lg px-3 py-2 font-semibold transition hover:bg-white/[0.07] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/customer-portal"
              onClick={() => trackPublicEvent('portal_cta_click', { portal: 'customer', source: 'header' })}
              className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:border-infamous-orange/50"
            >
              Customer Portal
            </Link>
            <Link
              to="/login"
              onClick={() => trackPublicEvent('login_cta_click', { source: 'header' })}
              className="rounded-lg bg-infamous-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-infamous-orange-light"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,61,0,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.13),transparent_30%),linear-gradient(180deg,#11100f_0%,#090909_72%)]" />
        <div className="absolute inset-0 freight-grid opacity-55" />

        <div className="relative mx-auto grid min-h-[78vh] max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-6 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-infamous-orange/35 bg-infamous-orange/10 px-4 py-2 text-sm font-semibold text-infamous-orange">
              <RadioTower size={16} /> Verified freight operations for shippers, drivers, and dispatch.
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Move Freight Like You Own the Road.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
              Instant quotes, verified carriers, live tracking, fast payments, and end-to-end freight execution from
              pickup to final POD.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/request-quote"
                onClick={() => trackPublicEvent('quote_cta_click', { source: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:bg-infamous-orange-light"
              >
                Get a Quote <ArrowRight size={18} />
              </Link>
              <Link
                to="/track-shipment"
                onClick={() => trackPublicEvent('tracking_cta_click', { source: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
              >
                Track Shipment <MapIcon size={18} />
              </Link>
              <Link
                to="/drive"
                onClick={() => trackPublicEvent('driver_cta_click', { source: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
              >
                Carrier Sign Up <Truck size={18} />
              </Link>
              <Link
                to="/load-board"
                onClick={() => trackPublicEvent('load_board_view', { source: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
              >
                Browse Load Board <RouteIcon size={18} />
              </Link>
              <Link
                to="/customer-portal"
                onClick={() => trackPublicEvent('portal_cta_click', { portal: 'customer', source: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
              >
                Shipper Sign Up <Users size={18} />
              </Link>
              <Link
                to="/login"
                onClick={() => trackPublicEvent('login_cta_click', { source: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-transparent px-5 py-3 font-semibold text-zinc-300 transition hover:border-white/[0.28] hover:text-white"
              >
                Login <LogIn size={18} />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-lg border border-white/10 bg-black/[0.24] p-4 backdrop-blur">
                  <span className="mb-3 inline-flex text-infamous-orange">{point.icon}</span>
                  <p className="font-bold text-white">{point.label}</p>
                  <p className="mt-1 text-sm text-zinc-400">{point.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-8 hidden h-28 w-28 border-l border-t border-infamous-orange/40 lg:block" />
            <div className="absolute -bottom-5 right-10 hidden h-24 w-24 border-b border-r border-sky-300/30 lg:block" />
            <section className="rounded-lg border border-white/[0.12] bg-[#111111]/90 p-4 shadow-2xl shadow-black/40 backdrop-blur" aria-label="Live freight board preview">
              <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Operations snapshot</p>
                  <h2 className="text-xl font-bold">Today&apos;s freight board</h2>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-400">
                  Sample workflow
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {loadMetrics.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-zinc-500">{label}</p>
                    <p className="mt-2 text-2xl font-black">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {liveLoads.map((load) => (
                  <div key={load.ref} className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-mono text-xs text-zinc-500">{load.ref}</p>
                        <p className="mt-1 text-sm font-bold text-white">{load.lane}</p>
                        <p className="mt-1 text-xs text-zinc-500">{load.equipment}</p>
                      </div>
                      <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${load.tone}`}>
                        {load.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-white">AI freight assistant</p>
                  <p className="mt-1 text-sm text-zinc-500">Beta workspace for turning quote details into dispatch-ready load notes.</p>
                </div>
                <Link
                  to="/freight-assistant"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-infamous-orange/40 bg-infamous-orange/10 px-4 py-2 text-sm font-bold text-infamous-orange transition hover:bg-infamous-orange/15"
                >
                  Open <Bot size={16} />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">
              Why shippers choose Infamous
            </p>
            <h2 className="mt-2 text-3xl font-black">Trust is the operating system.</h2>
            <p className="mt-4 max-w-xl leading-7 text-zinc-400">
              Every freight workflow is built around verification, visible status, and recorded proof so customers,
              dispatchers, drivers, and back-office teams work from the same facts.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {workflowCards.map((card) => (
              <article key={card.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-4 inline-flex rounded-lg bg-infamous-orange/10 p-3 text-infamous-orange">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-[#101010]">
        <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-[linear-gradient(90deg,rgba(255,61,0,0.12),transparent)] lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Execution path</p>
            <h2 className="mt-2 text-3xl font-black">From request to paid invoice.</h2>
            <p className="mt-4 max-w-xl leading-7 text-zinc-400">
              Quote intake and tracking feed the same freight record used by dispatch, carrier operations, customer
              support, and accounting.
            </p>
          </div>
          <div className="space-y-3">
            {processSteps.map((step, index) => (
              <div key={step} className="grid grid-cols-[auto_1fr] gap-4 rounded-lg border border-white/10 bg-black/[0.24] p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-infamous-orange text-sm font-black">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Get started</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black">Ship a load. Drive a load. Or partner with the network.</h2>
          </div>
          <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-infamous-orange hover:underline">
            Explore services <ArrowRight size={17} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {audienceCards.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => {
                if (item.href === '/request-quote') trackPublicEvent('quote_cta_click', { source: 'audience_card' });
                if (item.href === '/drive') trackPublicEvent('driver_cta_click', { source: 'audience_card' });
                if (item.href === '/pricing') trackPublicEvent('pricing_cta_click', { source: 'audience_card' });
              }}
              className="group rounded-lg border border-white/10 bg-[#111] p-6 transition hover:border-infamous-orange/50 hover:bg-[#141414]"
            >
              <div className="mb-4 inline-flex rounded-lg bg-infamous-orange/10 p-3 text-infamous-orange">
                {item.icon}
              </div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold">{item.label}</h3>
                <ArrowRight size={18} className="shrink-0 text-zinc-500 transition group-hover:text-infamous-orange" />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 md:grid-cols-3 lg:px-6">
        {portalLinks.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => trackPublicEvent('portal_cta_click', { portal: item.label, source: 'portal_links' })}
            className="group flex min-h-20 items-center justify-between rounded-lg border border-white/10 bg-[#101010] p-5 transition hover:border-infamous-orange/50"
          >
            <span className="flex items-center gap-3 font-semibold text-white">
              <span className="text-infamous-orange">{item.icon}</span>
              {item.label}
            </span>
            <ArrowRight size={18} className="text-zinc-500 transition group-hover:text-infamous-orange" />
          </Link>
        ))}
      </section>

      <section className="border-t border-white/10 bg-[#0d0d0d] px-5 py-14 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Trust and compliance</p>
            <h2 className="mt-2 text-3xl font-black">Freight is trust. Here is how Infamous earns it.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Authority, insurance, vetting, claims handling, and support are documented up front so shippers and
              carriers know exactly who they are working with.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheck size={20} />,
                label: 'FMCSA broker authority',
                detail:
                  'Authority status, MC#, and BMC-84 surety bond filed and active. Verification details available on request during onboarding.',
              },
              {
                icon: <FileText size={20} />,
                label: 'Insurance on file',
                detail:
                  'General liability and contingent cargo coverage maintained. Certificate of insurance issued to shippers prior to first load.',
              },
              {
                icon: <Users size={20} />,
                label: 'Carrier vetting',
                detail:
                  'Authority, insurance, safety scores, and ID verification are checked before a carrier touches a load and re-checked on policy events.',
              },
              {
                icon: <ClipboardCheck size={20} />,
                label: 'Payment policy',
                detail:
                  'Standard carrier pay terms documented. QuickPay and same-day options available with transparent fees, no surprises.',
              },
              {
                icon: <RouteIcon size={20} />,
                label: 'Claims and escalation',
                detail:
                  'Every exception (detention, lumper, damage, late delivery) opens a tracked ticket. No load disappears into phone calls.',
              },
              {
                icon: <Phone size={20} />,
                label: 'Support and office',
                detail:
                  'Live dispatch support during posted hours. Business address and direct phone listed on the contact page.',
              },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-lg border border-white/10 bg-[#111] p-5"
              >
                <div className="mb-3 inline-flex rounded-lg bg-infamous-orange/10 p-2.5 text-infamous-orange">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-white/10 bg-black/[0.32] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-400">
              Need verification documents, COI, or claims process details? Reach out and the operations team will send
              them over.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-infamous-orange/40 bg-infamous-orange/10 px-4 py-2 text-sm font-bold text-infamous-orange transition hover:bg-infamous-orange/15"
            >
              Contact operations <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0a0a0a] px-5 py-14 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-lg bg-infamous-orange/10 p-2.5 text-infamous-orange">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">FAQ</p>
              <h2 className="text-2xl font-black">Frequently asked questions</h2>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#111] px-6">
            {faqItems.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
          <p className="mt-5 text-sm text-zinc-500">
            Have another question?{' '}
            <Link to="/contact" className="font-semibold text-infamous-orange hover:underline">
              Contact the dispatch team
            </Link>{' '}
            or try the{' '}
            <Link to="/freight-assistant" className="font-semibold text-infamous-orange hover:underline">
              AI freight assistant
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d0d0d] px-5 py-10 lg:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-infamous-orange">
              <Zap size={16} /> Freight operations ready for the road.
            </p>
            <h2 className="mt-2 text-2xl font-black">Start with a quote or open the freight assistant.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/request-quote"
              onClick={() => trackPublicEvent('quote_cta_click', { source: 'footer_cta' })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:bg-infamous-orange-light"
            >
              Request Quote <ArrowRight size={18} />
            </Link>
            <Link
              to="/freight-assistant"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.12] px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
            >
              Freight Assistant <Bot size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#090909] px-5 py-10 text-sm text-zinc-400 lg:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3 text-white" aria-label="Infamous Freight home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-infamous-orange text-white">
                <Truck size={20} />
              </span>
              <span className="text-lg font-black">Infamous Freight</span>
            </Link>
            <p className="mt-4 max-w-md leading-6">
              AI-powered freight command center with auto-dispatch, rate negotiation, real-time tracking, and end-to-end shipment visibility.
            </p>
            <p className="mt-4">© {new Date().getFullYear()} Infamous Freight.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-4">
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">Freight</h2>
              <div className="space-y-2">
                <Link to="/request-quote" className="block hover:text-infamous-orange">Request quote</Link>
                <Link to="/track-shipment" className="block hover:text-infamous-orange">Track shipment</Link>
                <Link to="/load-board" className="block hover:text-infamous-orange">Load board</Link>
                <Link to="/freight-assistant" className="block hover:text-infamous-orange">Freight assistant</Link>
                <Link to="/pricing" className="block hover:text-infamous-orange">Pricing</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">Services</h2>
              <div className="space-y-2">
                <Link to="/services" className="block hover:text-infamous-orange">All services</Link>
                <Link to="/services/box-truck" className="block hover:text-infamous-orange">Box truck</Link>
                <Link to="/services/cargo-van" className="block hover:text-infamous-orange">Cargo van</Link>
                <Link to="/services/sprinter-van" className="block hover:text-infamous-orange">Sprinter van</Link>
                <Link to="/services/local-freight" className="block hover:text-infamous-orange">Local freight</Link>
                <Link to="/services/regional-freight" className="block hover:text-infamous-orange">Regional freight</Link>
                <Link to="/services/freight-dispatch" className="block hover:text-infamous-orange">Freight dispatch</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">Network</h2>
              <div className="space-y-2">
                <Link to="/drive" className="block hover:text-infamous-orange">Apply to drive</Link>
                <Link to="/partners" className="block hover:text-infamous-orange">Partners</Link>
                <Link to="/carrier-portal" className="block hover:text-infamous-orange">Carrier portal</Link>
                <Link to="/customer-portal" className="block hover:text-infamous-orange">Customer portal</Link>
                <Link to="/resources" className="block hover:text-infamous-orange">Resources</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">Company</h2>
              <div className="space-y-2">
                <Link to="/about" className="block hover:text-infamous-orange">About</Link>
                <Link to="/contact" className="block hover:text-infamous-orange">Contact</Link>
                <Link to="/terms" className="block hover:text-infamous-orange">Terms</Link>
                <Link to="/privacy" className="block hover:text-infamous-orange">Privacy</Link>
                <Link to="/carrier-agreement" className="block hover:text-infamous-orange">Carrier agreement</Link>
                <Link to="/shipper-agreement" className="block hover:text-infamous-orange">Shipper agreement</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
