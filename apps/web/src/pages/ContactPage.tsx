import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, Phone, Send, Truck } from 'lucide-react';
import { submitNetlifyForm } from '@/lib/netlifyForms';
import { BRAND } from '@/lib/brand';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  topic: 'Freight quote',
  message: '',
  contactConsent: false,
};

type ContactFormKey = keyof typeof initialForm;
type ContactTextKey = Exclude<ContactFormKey, 'contactConsent'>;

const contactCards = [
  {
    label: 'Call dispatch',
    value: BRAND.dispatchPhone,
    href: BRAND.dispatchPhoneHref,
    icon: <Phone size={20} />,
  },
  {
    label: 'Dispatch and quotes',
    value: BRAND.dispatchEmail,
    href: `mailto:${BRAND.dispatchEmail}`,
    icon: <Mail size={20} />,
  },
  {
    label: 'Driver onboarding',
    value: 'drivers@infamousfreight.com',
    href: 'mailto:drivers@infamousfreight.com',
    icon: <Truck size={20} />,
  },
  {
    label: 'General support',
    value: BRAND.supportEmail,
    href: `mailto:${BRAND.supportEmail}`,
    icon: <Mail size={20} />,
  },
];

const ContactPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: ContactTextKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitNetlifyForm('contact', { ...form, contactConsent: form.contactConsent ? 'yes' : 'no' });
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the contact request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-[#F5E8E8]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Contact</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Talk to dispatch, onboarding, or support.</h1>
          <p className="mt-4 text-lg leading-8 text-[#F5E8E8]/80">
            Send a quote question, driver onboarding request, partnership note, or support issue. The right team will follow up with next steps.
          </p>
          <Link to="/request-quote" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90">
            Request a Quote <ArrowRight size={17} />
          </Link>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-infamous-border bg-infamous-card p-5">
              <div className="mb-3 text-infamous-orange">{card.icon}</div>
              <p className="text-sm text-[#B88989]/70">{card.label}</p>
              <a href={card.href} className="mt-1 inline-flex font-semibold text-[#F5E8E8] hover:text-infamous-orange">
                {card.value}
              </a>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-infamous-border bg-infamous-card p-6 lg:p-8">
            <h2 className="text-2xl font-bold">Send a message</h2>
            <p className="mt-2 text-sm text-[#B88989]">For urgent active-load issues, call dispatch at <a href={BRAND.dispatchPhoneHref} className="font-semibold text-infamous-orange hover:underline">{BRAND.dispatchPhone}</a> or include the tracking or load number in your message.</p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
                <CheckCircle2 className="mb-3 text-green-400" size={32} />
                <h3 className="text-xl font-bold">Message sent</h3>
                <p className="mt-2 text-[#F5E8E8]/80">Thanks — your message was received. We will route it to the right team.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 rounded-xl bg-infamous-orange px-4 py-2 font-semibold text-[#F5E8E8]"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form name="contact" method="POST" action="/thank-you/" data-netlify="true" data-netlify-form="contact" data-success-url="/thank-you/" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="mt-6 space-y-5">
                <input type="hidden" name="form-name" value="contact" />
                <input type="hidden" name="csrf-token" value="netlify-form-contact-v1" />
                <input type="hidden" name="clientSubmittedAt" />
                <input type="hidden" name="pageUrl" />
                <p className="hidden">
                  <label>Do not fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['name', 'Your name'],
                    ['company', 'Company'],
                    ['email', 'Email'],
                    ['phone', 'Phone'],
                  ].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">{label}</span>
                      <input
                        name={key}
                        type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                        autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'organization'}
                        maxLength={key === 'email' ? 160 : key === 'phone' ? 40 : 120}
                        value={form[key as ContactTextKey]}
                        onChange={(event) => update(key as ContactTextKey, event.target.value)}
                        className="w-full rounded-xl border border-infamous-border bg-infamous-panel px-4 py-3 text-[#F5E8E8] outline-none transition focus:border-infamous-orange"
                        placeholder={label}
                        required={key === 'name' || key === 'email'}
                      />
                    </label>
                  ))}
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">Topic</span>
                  <select
                    name="topic"
                    value={form.topic}
                    onChange={(event) => update('topic', event.target.value)}
                    className="w-full rounded-xl border border-infamous-border bg-infamous-panel px-4 py-3 text-[#F5E8E8] outline-none transition focus:border-infamous-orange"
                  >
                    <option>Freight quote</option>
                    <option>Shipment tracking</option>
                    <option>Driver onboarding</option>
                    <option>Carrier support</option>
                    <option>Partnership</option>
                    <option>General support</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">Message</span>
                  <textarea
                    name="message"
                    maxLength={2000}
                    value={form.message}
                    onChange={(event) => update('message', event.target.value)}
                    className="min-h-36 w-full rounded-xl border border-infamous-border bg-infamous-panel px-4 py-3 text-[#F5E8E8] outline-none transition focus:border-infamous-orange"
                    placeholder="Tell us what you need help with."
                    required
                  />
                </label>
                <label className="flex gap-3 rounded-xl border border-infamous-border bg-infamous-panel p-4 text-sm leading-6 text-[#F5E8E8]/80">
                  <input
                    name="contactConsent"
                    type="checkbox"
                    checked={form.contactConsent}
                    onChange={(event) => setForm((current) => ({ ...current, contactConsent: event.target.checked }))}
                    required
                    className="mt-1 h-4 w-4 rounded border-infamous-border bg-infamous-dark text-infamous-orange focus:ring-infamous-orange"
                  />
                  <span>
                    I agree that Infamous Freight may contact me about this request. I have reviewed the{' '}
                    <Link to="/privacy" className="font-semibold text-infamous-orange hover:underline">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link to="/terms" className="font-semibold text-infamous-orange hover:underline">Terms</Link>.
                  </span>
                </label>
                {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send message'} <Send size={17} />
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-infamous-border bg-infamous-panel p-6">
              <Clock3 className="mb-3 text-infamous-orange" size={24} />
              <h2 className="text-lg font-bold">Response expectations</h2>
              <p className="mt-3 text-sm leading-6 text-[#B88989]">Quote and dispatch requests are prioritized first. General support and partner inquiries are routed by topic.</p>
            </div>
            <div className="rounded-3xl border border-infamous-border bg-infamous-panel p-6">
              <MapPin className="mb-3 text-infamous-orange" size={24} />
              <h2 className="text-lg font-bold">Service region</h2>
              <p className="mt-3 text-sm leading-6 text-[#B88989]">Local and regional freight across core U.S. lanes, with emphasis on verified capacity and shipment visibility.</p>
            </div>
            <Link to="/request-quote" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8]">
              Need a quote instead? <ArrowRight size={17} />
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ContactPage;
