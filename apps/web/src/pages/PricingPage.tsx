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
      ? 'bg-infamous-orange text-white hover:opacity-90'
      : 'border border-infamous-border bg-[#111] text-white hover:border-infamous-orange/50'
  }`;

const secondaryCtaClassName =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-infamous-border px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-infamous-orange/50 hover:text-white';

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
      {plan.cadence ? <span className="text-sm text-gray-500">{plan.cadence}</span> : null}
    </div>
    <p className="mt-3 text-sm leading-6 text-gray-400">{plan.tagline}</p>
    <ul className="mt-5 space-y-3 text-sm">
      {plan.features.map((feature) => (
        <li key={feature} className="flex gap-2 text-gray-300">
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
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link to="/home" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <header className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Pricing</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Stripe-backed pricing for freight operators ready to move faster.
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">
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
            <p className="max-w-md text-sm text-gray-400">
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
            <p className="max-w-md text-sm text-gray-400">
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
              <p className="mt-3 max-w-2xl text-gray-400">
                For contract lanes, implementation work, enterprise onboarding, or custom account terms, request a quote
                and Infamous Freight can issue a Stripe invoice instead of sending a public payment link.
              </p>
            </div>
            <Link
              to="/request-quote"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
            >
              Request invoice quote <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PricingPage;
