import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardList, Gauge, Paperclip, Send } from 'lucide-react';
import { trackPublicEvent } from '@/lib/analytics';
import { submitNetlifyForm } from '@/lib/netlifyForms';
import { createPublicQuoteRequest } from '@/lib/publicFreightApi';

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
  miles: '',
  dimensions: '',
  pickupDate: '',
  deliveryDate: '',
  instructions: '',
};

// Per-mile market context rates (DAT-reported national snapshots).
// Used only as a starting band — dispatch confirms the final rate per lane.
const equipmentBaseRpm: Record<string, number> = {
  'Dry van': 2.37,
  Reefer: 2.72,
  Flatbed: 3.05,
  'Power only': 2.2,
  'Box truck': 2.5,
  'Cargo van': 1.95,
  'Sprinter van': 1.85,
};

const minimumByEquipment: Record<string, number> = {
  'Dry van': 350,
  Reefer: 400,
  Flatbed: 450,
  'Power only': 300,
  'Box truck': 250,
  'Cargo van': 175,
  'Sprinter van': 150,
};

type Estimate = {
  low: number;
  mid: number;
  high: number;
  rpm: number;
  confidence: number;
  reason: string;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const computeEstimate = (form: typeof initialForm): Estimate | null => {
  const miles = Number(form.miles);
  if (!miles || miles <= 0) return null;

  const baseRpm = equipmentBaseRpm[form.equipment] ?? 2.5;
  const minimum = minimumByEquipment[form.equipment] ?? 250;

  let rpmAdjust = 0;
  const weight = Number(form.weight);
  if (weight && weight > 35000) rpmAdjust += 0.18;
  else if (weight && weight > 20000) rpmAdjust += 0.08;

  let urgencyAdjust = 0;
  if (form.pickupDate) {
    const pickup = new Date(form.pickupDate);
    const now = new Date();
    const hours = (pickup.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hours > 0 && hours < 24) urgencyAdjust += 0.15;
    else if (hours > 0 && hours < 48) urgencyAdjust += 0.08;
  }

  const rpm = Math.round((baseRpm + rpmAdjust) * 100) / 100;
  const linehaul = Math.max(rpm * miles * (1 + urgencyAdjust), minimum);
  const mid = Math.round(linehaul);
  const low = Math.round(linehaul * 0.88);
  const high = Math.round(linehaul * 1.12);

  let confidence = 60;
  if (form.origin.trim()) confidence += 8;
  if (form.destination.trim()) confidence += 8;
  if (weight) confidence += 6;
  if (form.dimensions.trim()) confidence += 4;
  if (form.freightType.trim()) confidence += 4;
  if (form.pickupDate) confidence += 4;
  if (miles > 0) confidence += 6;
  confidence = Math.min(confidence, 95);

  const reason =
    miles < 100
      ? 'Short-haul minimums apply for this lane.'
      : weight && weight > 35000
        ? 'Heavy freight adjusts the per-mile band upward.'
        : urgencyAdjust > 0
          ? 'Same-day or next-day pickup includes an urgency premium.'
          : 'Estimate uses national equipment averages; lane-specific quotes may vary.';

  return { low, mid, high, rpm, confidence, reason };
};

const PublicQuoteRequestPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const completion = useMemo(() => {
    const required = ['company', 'contact', 'email', 'origin', 'destination', 'freightType', 'weight', 'pickupDate'];
    const complete = required.filter((key) => form[key as keyof typeof form].trim()).length;
    return Math.round((complete / required.length) * 100);
  }, [form]);

  const estimate = useMemo(() => computeEstimate(form), [form]);

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const quotePayload = {
        ...form,
        estimate: estimate
          ? {
              low: estimate.low,
              mid: estimate.mid,
              high: estimate.high,
              rpm: estimate.rpm,
              confidence: estimate.confidence,
            }
          : undefined,
      };

      const { quote } = await createPublicQuoteRequest(quotePayload);

      await submitNetlifyForm('quote-request', {
        ...form,
        trackingNumber: quote.trackingNumber,
        estimateLow: estimate?.low,
        estimateMid: estimate?.mid,
        estimateHigh: estimate?.high,
        ...(attachment ? { attachment } : {}),
      });

      setTrackingNumber(quote.trackingNumber);
      trackPublicEvent('form_submit_success', {
        form: 'quote-request',
        hasAttachment: Boolean(attachment),
        equipment: form.equipment,
        estimateMid: estimate?.mid,
        estimateConfidence: estimate?.confidence,
        trackingNumber: quote.trackingNumber,
      });
      setSubmitted(true);
    } catch (err) {
      trackPublicEvent('form_submit_error', { form: 'quote-request' });
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
                {trackingNumber ? (
                  <div className="mt-4 rounded-xl border border-green-400/20 bg-[#111] p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Tracking reference</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-white">{trackingNumber}</p>
                    <Link to={`/track-shipment?tracking=${encodeURIComponent(trackingNumber)}`} className="mt-3 inline-flex text-sm font-semibold text-green-300 hover:text-green-200">
                      View tracking status
                    </Link>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm(initialForm);
                    setTrackingNumber('');
                    setAttachment(null);
                  }}
                  className="mt-5 rounded-xl bg-infamous-orange px-4 py-2 font-semibold text-white"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form name="quote-request" method="POST" action="/thank-you/" data-netlify="true" data-netlify-form="quote-request" data-success-url="/thank-you/" netlify-honeypot="bot-field" encType="multipart/form-data" onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="form-name" value="quote-request" />
                <input type="hidden" name="csrf-token" value="netlify-form-quote-request-v1" />
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
                    ['origin', 'Origin city/state'],
                    ['destination', 'Destination city/state'],
                    ['freightType', 'Freight type'],
                    ['weight', 'Weight'],
                    ['miles', 'Lane miles (optional)'],
                    ['dimensions', 'Dimensions / pallet count'],
                    ['pickupDate', 'Pickup date'],
                    ['deliveryDate', 'Delivery date'],
                  ].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-300">{label}</span>
                      <input
                        name={key}
                        type={key === 'email' ? 'email' : key.toLowerCase().includes('date') ? 'date' : key === 'weight' || key === 'miles' ? 'number' : 'text'}
                        autoComplete={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'off'}
                        inputMode={key === 'phone' ? 'tel' : key === 'weight' || key === 'miles' ? 'numeric' : key === 'email' ? 'email' : 'text'}
                        min={key === 'weight' || key === 'miles' ? 0 : undefined}
                        step={key === 'weight' ? 1 : key === 'miles' ? 0.1 : undefined}
                        maxLength={key === 'email' ? 160 : key === 'phone' ? 40 : key === 'origin' || key === 'destination' ? 180 : 120}
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

                <label className="block rounded-2xl border border-dashed border-infamous-border bg-[#111] p-4 transition focus-within:border-infamous-orange">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Paperclip size={16} className="text-infamous-orange" /> Attach freight document
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Optional BOL, rate confirmation, packing list, or freight photo. One file, 8 MB maximum.
                  </span>
                  <input
                    name="attachment"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                    className="mt-3 block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-infamous-orange file:px-4 file:py-2 file:font-semibold file:text-white"
                  />
                  {attachment ? <span className="mt-2 block text-xs text-gray-500">{attachment.name}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Special instructions</span>
                  <textarea
                    name="instructions"
                    maxLength={2000}
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
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex rounded-lg bg-infamous-orange/10 p-2 text-infamous-orange">
                  <Gauge size={18} />
                </span>
                <h2 className="text-lg font-bold">Instant rate estimate</h2>
              </div>
              {estimate ? (
                <>
                  <div className="rounded-2xl border border-infamous-border bg-[#111] p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Estimated linehaul</p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-white">
                      {formatCurrency(estimate.low)} <span className="text-lg text-gray-500">–</span>{' '}
                      {formatCurrency(estimate.high)}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Mid: {formatCurrency(estimate.mid)} · {estimate.rpm.toFixed(2)}/mi base RPM
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-infamous-border bg-[#111] px-4 py-3">
                    <span className="text-xs uppercase tracking-wider text-gray-500">Confidence</span>
                    <span className="font-semibold text-infamous-orange">{estimate.confidence}%</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">{estimate.reason}</p>
                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    Market context only. Dispatch confirms the final rate based on lane, carrier capacity, and
                    accessorials.
                  </p>
                </>
              ) : (
                <p className="text-sm leading-6 text-gray-400">
                  Add equipment, weight, and lane miles to see an instant rate band. Without miles, dispatch will price
                  the load manually after review.
                </p>
              )}
            </div>

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
                Fill in origin, destination, freight type, weight, equipment, lane miles, and pickup date so dispatch
                can respond faster and the instant estimate reflects the real load.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default PublicQuoteRequestPage;
