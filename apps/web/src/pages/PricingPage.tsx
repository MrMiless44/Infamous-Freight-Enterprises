import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import {
  STRIPE_ADD_ON_PLANS,
  STRIPE_SUBSCRIPTION_PLANS,
  StripeCatalogCta,
  StripeCatalogPlan,
} from '@/lib/stripeCatalog';

const isExternalHref = (href: string) => href.startsWith('http://') || href.startsWith('https://');

const ctaClassName = (highlighted?: boolean) =>
  `inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
    highlighted
      ? 'bg-infamous-orange text-[#F5E8E8] hover:opacity-90'
      : 'border border-infamous-border bg-infamous-panel text-[#F5E8E8] hover:border-infamous-orange/50'
  }`;

const secondaryCtaClassName =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-infamous-border px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-infamous-orange/50 hover:text-[#F5E8E8]';

const PlanAction: React.FC<{ cta: StripeCatalogCta; highlighted?: boolean; secondary?: boolean }> = ({
  cta,
  highlighted,
  secondary,
}) => {
  const className = secondary ? secondaryCtaClassName : ctaClassName(highlighted);

  if (isExternalHref(cta.href)) {
    return (
      <a href={cta.href} target="_blank" rel="noreferrer" className={className}>
        {cta.label} <ArrowRight size={16} />
      </a>
    );
  }

  return (
    <Link to={cta.href} className={className}>
      {cta.label} <ArrowRight size={16} />
    </Link>
  );
};

const PlanCard: React.FC<{ plan: StripeCatalogPlan }> = ({ plan }) => (
  <div
    className={`flex h-full flex-col rounded-3xl border bg-infamous-card p-6 ${
      plan.highlighted
        ? 'border-infamous-orange/60 shadow-[0_0_0_1px_rgba(255,123,0,0.25)]'
        : 'border-infamous-border'
    }`}
  >
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-lg font-bold">{plan.name}</h3>
      {plan.highlighted ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-infamous-orange/10 px-3 py-1 text-xs font-semibold text-infamous-orange">
          <Sparkles size={12} /> Recommended
        </span>
      ) : null}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-4xl font-black tracking-tight">{plan.price}</span>
      {plan.cadence ? <span className="text-sm text-[#B88989]/70">{plan.cadence}</span> : null}
    </div>
    <p className="mt-3 text-sm leading-6 text-[#B88989]">{plan.tagline}</p>
    <ul className="mt-5 space-y-3 text-sm">
      {plan.features.map((feature) => (
        <li key={feature} className="flex gap-2 text-[#F5E8E8]/80">
          <Check size={16} className="mt-0.5 flex-shrink-0 text-infamous-orange" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <div className="mt-auto space-y-3 pt-6">
      <PlanAction cta={plan.cta} highlighted={plan.highlighted} />
      {plan.secondaryCta ? <PlanAction cta={plan.secondaryCta} secondary /> : null}
    </div>
  </div>
);

const PricingPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-[#F5E8E8]">
      <div className="mx-auto max-w-7xl">
        <Link to="/home" className="mb-8 inline-flex items-center gap-2 text-sm text-[#B88989] hover:text-[#F5E8E8]">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <header className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Pricing</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Stripe-backed pricing for freight operators ready to move faster.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#F5E8E8]/80">
            Choose the Infamous Freight plan that matches your operation, then add AI action, document, or voice packs
            when your team needs more automation capacity. Payments are processed securely through Stripe.
          </p>
        </header>

        <section className="mb-16">
          <div className="mb-6 flex flex-col justify-between gap-2 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Platform plans</p>
              <h2 className="mt-2 text-2xl font-bold">Monthly or annual subscriptions.</h2>
            </div>
            <p className="max-w-md text-sm text-[#B88989]">
              Starter, Professional, and Enterprise use the live Stripe products and prices configured for Infamous Freight.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {STRIPE_SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 flex flex-col justify-between gap-2 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">AI add-ons</p>
              <h2 className="mt-2 text-2xl font-bold">One-time capacity packs for heavier workflows.</h2>
            </div>
            <p className="max-w-md text-sm text-[#B88989]">
              Add more AI actions, document scans, or voice minutes without changing the customer’s base subscription.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {STRIPE_ADD_ON_PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-infamous-border bg-[#0f0f0f] p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Need a custom invoice?</p>
              <h2 className="mt-2 text-2xl font-bold">Use Stripe Invoicing for B2B freight customers.</h2>
              <p className="mt-3 max-w-2xl text-[#B88989]">
                For contract lanes, implementation work, enterprise onboarding, or custom account terms, request a quote
                and Infamous Freight can issue a Stripe invoice instead of sending a public payment link.
              </p>
            </div>
            <Link
              to="/request-quote"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-5 py-3 font-semibold text-[#F5E8E8] transition hover:border-infamous-orange/50"
            >
              Request invoice quote <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Carrier plans</p>
            <h2 className="mt-2 text-2xl font-bold">Free to run loads. Premium tools when you want them.</h2>
            <p className="mt-3 text-sm text-[#B88989]">
              Carriers can find, accept, and run Infamous loads without paying a platform fee. Premium tiers add load
              alerts, RPM tools, dispatch automation, and settlement dashboards for owner-operators and small fleets.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                name: 'Carrier Free',
                price: '$0',
                cadence: '/month',
                tagline: 'Run Infamous loads with the basics included.',
                features: [
                  'Find and accept Infamous loads',
                  'Document vault for COI, W-9, MC#',
                  'Live tracking and POD upload',
                  'Standard carrier pay terms',
                ],
              },
              {
                name: 'Carrier Pro',
                price: '$29',
                cadence: '/month',
                tagline: 'For owner-operators who want an edge.',
                features: [
                  'Load alerts on saved lanes',
                  'RPM and deadhead calculator',
                  'Preferred lane suggestions',
                  'Document vault and reminders',
                ],
              },
              {
                name: 'Carrier Elite',
                price: '$79',
                cadence: '/month',
                tagline: 'For small fleets running multiple trucks.',
                features: [
                  'Everything in Pro',
                  'AI route + backhaul planning',
                  'Settlement dashboard',
                  'Driver-app dispatch tools',
                ],
              },
              {
                name: 'Dispatch Partner',
                price: '5–8%',
                cadence: 'of gross',
                tagline: 'Full dispatch service with paperwork support.',
                features: [
                  'Load sourcing and negotiation',
                  'Rate confirmations and BOLs',
                  'Detention and accessorial handling',
                  'Compliance and document management',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="flex h-full flex-col rounded-3xl border border-infamous-border bg-infamous-card p-6"
              >
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                  <span className="text-sm text-[#B88989]/70">{plan.cadence}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#B88989]">{plan.tagline}</p>
                <ul className="mt-5 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-[#F5E8E8]/80">
                      <Check size={16} className="mt-0.5 flex-shrink-0 text-infamous-orange" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-infamous-border bg-[#0f0f0f] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Payment options</p>
            <h2 className="mt-2 text-2xl font-bold">Carrier pay terms, in plain language.</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['Standard carrier pay', 'Free'],
                ['48-hour QuickPay', '2.5%'],
                ['Same-day QuickPay', '3.5%'],
                ['Instant payout', '4% (or pass-through + markup)'],
                ['Shipper card payment fee', 'Pass-through'],
                ['Shipper ACH', 'Free or $5 admin cap'],
              ].map(([label, value]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-infamous-border bg-infamous-panel px-4 py-3 text-gray-200"
                >
                  <span className="font-semibold">{label}</span>
                  <span className="text-sm text-[#F5E8E8]/80">{value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[#B88989]/70">
              Final terms are confirmed at onboarding. Card processing fees follow Stripe&apos;s posted rates.
            </p>
          </div>

          <div className="rounded-3xl border border-infamous-border bg-[#0f0f0f] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Dispatch services</p>
            <h2 className="mt-2 text-2xl font-bold">Productized dispatch packages.</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['Owner-operator dispatch', '5–8% of gross'],
                ['Small fleet dispatch', '4–6% of gross'],
                ['Dedicated dispatcher', '$599–$1,499/mo + lower %'],
                ['Paperwork-only package', '$99–$299/mo'],
                ['Compliance and docs', '$49–$149/mo'],
              ].map(([label, value]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-infamous-border bg-infamous-panel px-4 py-3 text-gray-200"
                >
                  <span className="font-semibold">{label}</span>
                  <span className="text-sm text-[#F5E8E8]/80">{value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[#B88989]/70">
              Need a custom package or fleet pricing? Use the contact form to scope it directly with operations.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PricingPage;
