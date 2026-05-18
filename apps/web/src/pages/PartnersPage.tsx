import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Handshake,
  Send,
  Sparkles,
} from 'lucide-react';
import { submitNetlifyForm } from '@/lib/netlifyForms';

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};

const tiers: Tier[] = [
  {
    name: 'Basic listing',
    price: '$99',
    cadence: '/month',
    tagline: 'Be discoverable in the partner directory.',
    features: [
      'Listed in the partner directory',
      'Logo, blurb, and one CTA link',
      'Single category placement',
      'Monthly performance summary',
    ],
  },
  {
    name: 'Featured partner',
    price: '$299',
    cadence: '/month',
    tagline: 'Stand out where shippers and drivers actually look.',
    features: [
      'Everything in Basic listing',
      'Featured slot in the directory',
      'Placement inside relevant dashboards',
      'Inclusion in monthly partner email',
      'Click and lead reporting',
    ],
    highlighted: true,
  },
  {
    name: 'Sponsored category',
    price: '$750',
    cadence: '/month',
    tagline: 'Own a single category across the network.',
    features: [
      'Everything in Featured partner',
      'Top-of-category sponsorship (e.g. fuel cards, factoring)',
      'Co-branded resource in the help center',
      'Priority response on partnership questions',
    ],
  },
  {
    name: 'Regional exclusive',
    price: '$1,500+',
    cadence: '/month',
    tagline: 'Be the only partner in your category for a region.',
    features: [
      'Everything in Sponsored category',
      'Exclusive placement in a defined region',
      'Featured in regional driver and shipper comms',
      'Quarterly partnership review',
    ],
  },
];

const targetPartners = [
  'Fuel card providers',
  'Truck insurance brokers',
  'Factoring companies',
  'Tire shops',
  'Repair and maintenance shops',
  'Fleet maintenance providers',
  'Equipment leasing companies',
  'Warehousing providers',
  'ELD and GPS providers',
  'Business lending providers',
];

const initialForm = {
  company: '',
  contact: '',
  email: '',
  phone: '',
  category: '',
  region: '',
  notes: '',
};

const PartnersPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitNetlifyForm('partner-application', form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-[#F5E8E8]">
      <div className="mx-auto max-w-6xl">
        <Link to="/home" className="mb-8 inline-flex items-center gap-2 text-sm text-[#B88989] hover:text-[#F5E8E8]">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <header className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-infamous-orange/30 bg-infamous-orange/10 px-4 py-2 text-sm text-infamous-orange">
            <Handshake size={16} /> Infamous Freight Partner Network
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Reach shippers, drivers, and carriers who actually move freight.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#F5E8E8]/80">
            The Partner Network connects vetted logistics-adjacent businesses with the people on Infamous Freight
            every day — no banner ads, no random retargeting, just curated placements where decisions are made.
          </p>
        </header>

        <section className="mb-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex h-full flex-col rounded-3xl border bg-infamous-card p-6 ${
                tier.highlighted
                  ? 'border-infamous-orange/60 shadow-[0_0_0_1px_rgba(255,123,0,0.25)]'
                  : 'border-infamous-border'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">{tier.name}</h3>
                {tier.highlighted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-infamous-orange/10 px-3 py-1 text-xs font-semibold text-infamous-orange">
                    <Sparkles size={12} /> Most popular
                  </span>
                ) : null}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">{tier.price}</span>
                <span className="text-sm text-[#B88989]/70">{tier.cadence}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#B88989]">{tier.tagline}</p>
              <ul className="mt-5 space-y-3 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-[#F5E8E8]/80">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-infamous-orange" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mb-12 rounded-3xl border border-infamous-border bg-[#0f0f0f] p-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">
                Who fits the network
              </p>
              <h2 className="mt-2 text-2xl font-bold">We approve partners by category fit, not by who pays first.</h2>
              <p className="mt-3 text-[#B88989]">
                Placements are filtered to logistics-adjacent businesses our shippers and drivers actually use. That
                keeps the network valuable to the user — and the leads useful to you.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {targetPartners.map((partner) => (
                <li
                  key={partner}
                  className="flex items-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-3 py-2 text-sm text-[#F5E8E8]/80"
                >
                  <Building2 size={14} className="text-infamous-orange" />
                  {partner}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-infamous-border bg-infamous-card p-6 lg:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Apply to partner</p>
            <h2 className="mt-2 text-2xl font-bold">Tell us about your business and where you want to show up.</h2>
            <p className="mt-2 max-w-2xl text-[#B88989]">
              We approve partners by category fit. Submit your details and a partnerships contact will respond with
              available placements and pricing.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
              <CheckCircle2 className="mb-3 text-green-400" size={32} />
              <h3 className="text-xl font-bold">Application received</h3>
              <p className="mt-2 text-[#F5E8E8]/80">
                Thanks — partnerships will review your category and region fit and respond within a few business
                days.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                }}
                className="mt-5 rounded-xl bg-infamous-orange px-4 py-2 font-semibold text-[#F5E8E8]"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form
              name="partner-application"
              method="POST"
              action="/thank-you/?form=partner-application"
              data-netlify="true"
              data-netlify-form="partner-application"
              data-success-url="/thank-you/?form=partner-application"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <input type="hidden" name="form-name" value="partner-application" />
              <input type="hidden" name="csrf-token" value="netlify-form-partner-application-v1" />
              <input type="hidden" name="clientSubmittedAt" />
              <input type="hidden" name="pageUrl" />
              <p className="hidden">
                <label>Do not fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['company', 'Company name'],
                  ['contact', 'Contact name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['category', 'Partner category (e.g. fuel cards, insurance)'],
                  ['region', 'Region or coverage area'],
                ].map(([key, label]) => (
                  <label key={key} htmlFor={`partner-${key}`} className="block">
                    <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">{label}</span>
                    <input
                      id={`partner-${key}`}
                      name={key}
                      type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                      autoComplete={key === 'company' ? 'organization' : key === 'contact' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : undefined}
                      maxLength={key === 'email' ? 160 : key === 'phone' ? 40 : 120}
                      value={form[key as keyof typeof initialForm]}
                      onChange={(event) => update(key as keyof typeof initialForm, event.target.value)}
                      className="w-full rounded-xl border border-infamous-border bg-infamous-panel px-4 py-3 text-[#F5E8E8] outline-none transition focus:border-infamous-orange"
                      placeholder={label}
                      required={key === 'company' || key === 'contact' || key === 'email'}
                      aria-required={key === 'company' || key === 'contact' || key === 'email' || undefined}
                    />
                  </label>
                ))}
              </div>
              <label htmlFor="partner-notes" className="block">
                <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">Notes</span>
                <textarea
                  id="partner-notes"
                  name="notes"
                  maxLength={2000}
                  value={form.notes}
                  onChange={(event) => update('notes', event.target.value)}
                  className="min-h-32 w-full rounded-xl border border-infamous-border bg-infamous-panel px-4 py-3 text-[#F5E8E8] outline-none transition focus:border-infamous-orange"
                  placeholder="Tell us what your business offers and which placement tier you are interested in."
                />
              </label>
              {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit application'} <Send size={17} />
              </button>
              <p className="text-xs text-[#B88989]/70">
                Prefer to talk first?{' '}
                <Link to="/request-quote?partner=true" className="text-infamous-orange hover:underline">
                  Send a partnerships note <ArrowRight size={12} className="inline" />
                </Link>
              </p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default PartnersPage;
