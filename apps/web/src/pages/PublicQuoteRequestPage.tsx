import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardList, Send } from 'lucide-react';
import { submitNetlifyForm } from '@/lib/netlifyForms';

const initialForm = {
  company: '',
  contact: '',
  email: '',
  phone: '',
  origin: '',
  destination: '',
  freightType: '',
  equipment: 'Dry van',
  weight: '',
  dimensions: '',
  pickupDate: '',
  deliveryDate: '',
  instructions: '',
};

const PublicQuoteRequestPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const completion = useMemo(() => {
    const required = ['company', 'contact', 'email', 'origin', 'destination', 'freightType', 'weight', 'pickupDate'];
    const complete = required.filter((key) => form[key as keyof typeof form].trim()).length;
    return Math.round((complete / required.length) * 100);
  }, [form]);

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitNetlifyForm('quote-request', form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit this quote request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border border-infamous-border bg-infamous-card p-6 shadow-2xl lg:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
                  <ClipboardList size={24} />
                </div>
                <h1 className="text-3xl font-bold">Request a freight quote</h1>
                <p className="mt-2 max-w-2xl text-gray-400">
                  Send complete lane, freight, and contact details so dispatch can price the load and respond quickly.
                </p>
              </div>
              <span className="rounded-full border border-infamous-border px-3 py-1 text-xs text-gray-400">{completion}% complete</span>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
                <CheckCircle2 className="mb-3 text-green-400" size={32} />
                <h2 className="text-xl font-bold">Quote request received</h2>
                <p className="mt-2 text-gray-300">
                  Dispatch will review your lane, confirm equipment, check carrier capacity, and reply with pricing.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm(initialForm);
                  }}
                  className="mt-5 rounded-xl bg-infamous-orange px-4 py-2 font-semibold text-white"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form name="quote-request" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="form-name" value="quote-request" />
                <input type="hidden" name="csrf-token" value="netlify-form-quote-request-v1" />
                <p className="hidden">
                  <label>Do not fill this out: <input name="bot-field" /></label>
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['company', 'Company name'],
                    ['contact', 'Contact name'],
                    ['email', 'Email'],
                    ['phone', 'Phone'],
                    ['origin', 'Origin city/state'],
                    ['destination', 'Destination city/state'],
                    ['freightType', 'Freight type'],
                    ['weight', 'Weight'],
                    ['dimensions', 'Dimensions / pallet count'],
                    ['pickupDate', 'Pickup date'],
                    ['deliveryDate', 'Delivery date'],
                  ].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-300">{label}</span>
                      <input
                        name={key}
                        type={key === 'email' ? 'email' : key.toLowerCase().includes('date') ? 'date' : 'text'}
                        autoComplete={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'off'}
                        value={form[key as keyof typeof form]}
                        onChange={(event) => updateField(key as keyof typeof initialForm, event.target.value)}
                        className="w-full rounded-xl border border-infamous-border bg-[#111] px-4 py-3 text-white outline-none transition focus:border-infamous-orange"
                        placeholder={label}
                        required={['company', 'contact', 'email', 'origin', 'destination', 'freightType', 'weight', 'pickupDate'].includes(key)}
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Equipment</span>
                    <select
                      name="equipment"
                      value={form.equipment}
                      onChange={(event) => updateField('equipment', event.target.value)}
                      className="w-full rounded-xl border border-infamous-border bg-[#111] px-4 py-3 text-white outline-none transition focus:border-infamous-orange"
                    >
                      <option>Dry van</option>
                      <option>Reefer</option>
                      <option>Flatbed</option>
                      <option>Power only</option>
                      <option>Box truck</option>
                      <option>Cargo van</option>
                      <option>Sprinter van</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Special instructions</span>
                  <textarea
                    name="instructions"
                    value={form.instructions}
                    onChange={(event) => updateField('instructions', event.target.value)}
                    className="min-h-32 w-full rounded-xl border border-infamous-border bg-[#111] px-4 py-3 text-white outline-none transition focus:border-infamous-orange"
                    placeholder="Pickup windows, delivery requirements, accessorials, dock notes, etc."
                  />
                </label>

                {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit quote request'} <Send size={17} />
                </button>
              </form>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-infamous-border bg-infamous-card p-6">
              <h2 className="text-lg font-bold">What happens next?</h2>
              <div className="mt-4 space-y-4">
                {['Lane reviewed by dispatch', 'Carrier capacity checked', 'Rate and pickup details confirmed', 'Customer receives next steps'].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-infamous-orange text-xs font-bold">{index + 1}</span>
                    <p className="pt-1 text-sm text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-infamous-border bg-[#111] p-6">
              <h2 className="text-lg font-bold">Tips for a faster quote</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                Fill in origin, destination, freight type, weight, equipment, and pickup date so dispatch can respond faster.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default PublicQuoteRequestPage;
