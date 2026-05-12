import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Gauge,
  MapPin,
  Package,
  Paperclip,
  Send,
  Settings,
  Truck,
} from 'lucide-react';
import { trackPublicEvent, trackFunnelEvent } from '@/lib/analytics';
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

const STEPS = [
  { label: 'Basics', icon: MapPin },
  { label: 'Freight', icon: Package },
  { label: 'Options', icon: Settings },
  { label: 'Review', icon: ClipboardList },
];

const InputField: React.FC<{
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}> = ({ label, name, type = 'text', value, onChange, placeholder, required, autoComplete, inputMode }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">
      {label} {required && <span className="text-infamous-orange">*</span>}
    </span>
    <input
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || label}
      required={required}
      autoComplete={autoComplete}
      inputMode={inputMode}
      className="input-field"
    />
  </label>
);

const PublicQuoteRequestPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const estimate = useMemo(() => computeEstimate(form), [form]);

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 0: return Boolean(form.origin.trim() && form.destination.trim() && form.equipment.trim() && form.pickupDate && form.contact.trim() && form.phone.trim() && form.email.trim());
      case 1: return true;
      case 2: return true;
      case 3: return Boolean(form.origin.trim() && form.destination.trim() && form.contact.trim() && form.phone.trim() && form.email.trim());
      default: return true;
    }
  };

  const nextStep = () => {
    if (step < STEPS.length - 1 && canProceed(step)) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const quotePayload = {
        ...form,
        estimate: estimate
          ? { low: estimate.low, mid: estimate.mid, high: estimate.high, rpm: estimate.rpm, confidence: estimate.confidence }
          : undefined,
      };

      let apiTrackingNumber = '';
      let apiError: Error | null = null;

      try {
        const { quote } = await createPublicQuoteRequest(quotePayload);
        apiTrackingNumber = quote.trackingNumber;
      } catch (err) {
        apiError = err instanceof Error ? err : new Error('Dispatch intake API is temporarily unavailable.');
      }

      await submitNetlifyForm('quote-request', {
        ...form,
        name: form.contact,
        pickupTiming: form.pickupDate,
        freightDetails: [form.freightType, form.weight ? `${form.weight} lbs` : '', form.dimensions].filter(Boolean).join(' | '),
        notes: form.instructions,
        trackingNumber: apiTrackingNumber,
        estimateLow: estimate?.low,
        estimateMid: estimate?.mid,
        estimateHigh: estimate?.high,
        ...(attachment ? { attachment } : {}),
      });

      setTrackingNumber(apiTrackingNumber);
      trackFunnelEvent('funnel_quote_request', { equipment: form.equipment });
      trackPublicEvent('form_submit_success', {
        form: 'quote-request',
        hasAttachment: Boolean(attachment),
        equipment: form.equipment,
        estimateMid: estimate?.mid,
        estimateConfidence: estimate?.confidence,
        trackingNumber: apiTrackingNumber,
        usedFallbackOnly: Boolean(apiError),
      });
      setSubmitted(true);
      if (apiError) {
        setError('');
      }
    } catch (err) {
      trackPublicEvent('form_submit_error', { form: 'quote-request' });
      setError(
        err instanceof Error
          ? `${err.message} For urgent freight, email dispatch@infamousfreight.com with your origin, destination, equipment, pickup timing, and contact info.`
          : 'Could not submit this quote request. For urgent freight, email dispatch@infamousfreight.com with your shipment details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Start Your Quote</h2>
            <p className="text-sm text-[#B88989]">Share the lane, equipment, pickup timing, and best contact first. Extra freight details can come next.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Origin City / State" name="origin" value={form.origin} onChange={(v) => updateField('origin', v)} required />
              <InputField label="Destination City / State" name="destination" value={form.destination} onChange={(v) => updateField('destination', v)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">Equipment / Service Type <span className="text-infamous-orange">*</span></span>
                <select
                  name="equipment"
                  value={form.equipment}
                  onChange={(e) => updateField('equipment', e.target.value)}
                  className="input-field"
                  required
                >
                  <option>Dry van</option>
                  <option>Reefer</option>
                  <option>Flatbed</option>
                  <option>Power only</option>
                  <option>Box truck</option>
                  <option>Cargo van</option>
                  <option>Sprinter van</option>
                  <option>Freight brokerage</option>
                  <option>Freight dispatch</option>
                </select>
              </label>
              <InputField label="Pickup Timing" name="pickupDate" type="date" value={form.pickupDate} onChange={(v) => updateField('pickupDate', v)} required />
            </div>
            <InputField label="Company Name (optional)" name="company" value={form.company} onChange={(v) => updateField('company', v)} />
            <div className="grid gap-4 sm:grid-cols-3">
              <InputField label="Contact Name" name="contact" value={form.contact} onChange={(v) => updateField('contact', v)} required />
              <InputField label="Phone" name="phone" type="tel" value={form.phone} onChange={(v) => updateField('phone', v)} required autoComplete="tel" inputMode="tel" />
              <InputField label="Email" name="email" type="email" value={form.email} onChange={(v) => updateField('email', v)} required autoComplete="email" />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Freight Details</h2>
            <p className="text-sm text-[#B88989]">Add what is known now. These details help dispatch quote accurately but are not required to start the lead.</p>
            <InputField label="Freight Type" name="freightType" value={form.freightType} onChange={(v) => updateField('freightType', v)} placeholder="e.g. Palletized goods, machinery, retail" />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Weight (lbs)" name="weight" type="number" value={form.weight} onChange={(v) => updateField('weight', v)} inputMode="numeric" />
              <InputField label="Dimensions / Pallet Count" name="dimensions" value={form.dimensions} onChange={(v) => updateField('dimensions', v)} placeholder="e.g. 4 pallets, 48x40x60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Delivery Date (optional)" name="deliveryDate" type="date" value={form.deliveryDate} onChange={(v) => updateField('deliveryDate', v)} />
              <InputField label="Lane Miles (optional)" name="miles" type="number" value={form.miles} onChange={(v) => updateField('miles', v)} inputMode="numeric" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Service Options</h2>
            <p className="text-sm text-[#B88989]">Add any special requirements or documents.</p>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">Special Instructions</span>
              <textarea
                name="instructions"
                maxLength={2000}
                value={form.instructions}
                onChange={(e) => updateField('instructions', e.target.value)}
                className="input-field min-h-32"
                placeholder="Pickup windows, delivery requirements, accessorials, dock notes, liftgate, etc."
              />
            </label>
            <label className="block rounded-xl border border-dashed border-infamous-border bg-infamous-panel p-5 transition hover:border-infamous-red/30 cursor-pointer">
              <span className="flex items-center gap-2 text-sm font-medium text-[#F5E8E8]/80">
                <Paperclip size={16} className="text-infamous-red-light" /> Attach freight document
              </span>
              <span className="mt-1 block text-sm text-[#B88989]/70">
                BOL, rate confirmation, packing list, or freight photo. One file, 8 MB max.
              </span>
              <input
                name="attachment"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-sm text-[#F5E8E8]/80 file:mr-4 file:rounded-lg file:border-0 file:bg-infamous-red file:px-4 file:py-2 file:font-semibold file:text-[#F5E8E8]"
              />
              {attachment && <span className="mt-2 block text-xs text-[#B88989]/70">{attachment.name}</span>}
            </label>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Review Your Quote Request</h2>
            <p className="text-sm text-[#B88989]">Confirm the details below, then submit.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Origin', form.origin],
                ['Destination', form.destination],
                ['Pickup Date', form.pickupDate],
                ['Delivery Date', form.deliveryDate || '—'],
                ['Freight Type', form.freightType],
                ['Equipment', form.equipment],
                ['Weight', form.weight ? `${form.weight} lbs` : '—'],
                ['Miles', form.miles || '—'],
                ['Company', form.company],
                ['Contact', form.contact],
                ['Email', form.email],
                ['Phone', form.phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-infamous-border bg-infamous-panel p-3">
                  <p className="text-xs uppercase tracking-wider text-infamous-muted">{label}</p>
                  <p className="mt-1 text-sm font-medium text-[#F5E8E8]">{value}</p>
                </div>
              ))}
            </div>

            {form.instructions && (
              <div className="rounded-lg border border-infamous-border bg-infamous-panel p-3">
                <p className="text-xs uppercase tracking-wider text-infamous-muted">Special Instructions</p>
                <p className="mt-1 text-sm text-[#F5E8E8]/80">{form.instructions}</p>
              </div>
            )}

            {estimate && (
              <div className="rounded-xl border border-infamous-red/20 bg-infamous-red/5 p-5">
                <p className="text-xs uppercase tracking-wider text-infamous-muted">Estimated Rate</p>
                <p className="mt-1 text-2xl font-black text-[#F5E8E8]">
                  {formatCurrency(estimate.low)} – {formatCurrency(estimate.high)}
                </p>
                <p className="mt-1 text-xs text-[#B88989]">Mid: {formatCurrency(estimate.mid)} · {estimate.confidence}% confidence</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-infamous-dark px-5 py-8 text-[#F5E8E8] lg:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-[#36D399]/30 bg-infamous-card p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-[#36D399]" size={48} />
            <h2 className="text-2xl font-black">Quote Request Submitted</h2>
            <p className="mt-3 text-[#B88989]">
              Dispatch will review your lane, confirm equipment, check carrier capacity, and reply with pricing.
            </p>
            {trackingNumber && (
              <div className="mt-6 rounded-xl border border-infamous-border bg-infamous-panel p-5 text-left">
                <p className="text-xs uppercase tracking-wider text-infamous-muted">Tracking Reference</p>
                <p className="mt-1 font-mono text-xl font-bold text-[#F5E8E8]">{trackingNumber}</p>
                <Link to={`/track-shipment?tracking=${encodeURIComponent(trackingNumber)}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-infamous-red-light hover:underline">
                  View tracking status <ArrowRight size={14} />
                </Link>
              </div>
            )}
            {!trackingNumber && (
              <div className="mt-6 rounded-xl border border-infamous-border bg-infamous-panel p-5 text-left">
                <p className="text-xs uppercase tracking-wider text-infamous-muted">Fallback Capture</p>
                <p className="mt-1 text-sm leading-6 text-[#F5E8E8]/80">
                  The quote details were captured for dispatch. A tracking reference may be assigned after review.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => { setSubmitted(false); setForm(initialForm); setTrackingNumber(''); setAttachment(null); setStep(0); }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-infamous-red px-6 py-3 font-semibold text-[#F5E8E8] transition hover:bg-infamous-red-light"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-infamous-dark px-5 py-8 text-[#F5E8E8] lg:px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[#B88989] hover:text-[#F5E8E8]">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Form */}
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-6 lg:p-8">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {STEPS.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => { if (i <= step) setStep(i); }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        i === step
                          ? 'bg-infamous-red/10 text-infamous-red-light border border-infamous-red/20'
                          : i < step
                            ? 'text-[#36D399] hover:bg-infamous-panel'
                            : 'text-infamous-muted'
                      }`}
                    >
                      {i < step ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <s.icon size={14} />
                      )}
                      {s.label}
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`w-4 h-px ${i < step ? 'bg-[#36D399]/40' : 'bg-infamous-border'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form
              name="quote-request"
              method="POST"
              action="/thank-you/"
              data-netlify="true"
              data-netlify-form="quote-request"
              data-success-url="/thank-you/"
              netlify-honeypot="bot-field"
              encType="multipart/form-data"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="quote-request" />
              <input type="hidden" name="csrf-token" value="netlify-form-quote-request-v1" />
              <input type="hidden" name="clientSubmittedAt" />
              <input type="hidden" name="pageUrl" />
              <p className="hidden">
                <label>Do not fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
              </p>

              {renderStepContent()}

              {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {step > 0 ? (
                  <button type="button" onClick={prevStep} className="btn-secondary inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <div />}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed(step)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !canProceed(step)}
                    className="btn-primary btn-lg inline-flex items-center gap-2"
                  >
                    {loading ? 'Submitting...' : 'Submit Quote Request'} <Send size={17} />
                  </button>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-[#B88989]">
                Urgent pickup or form trouble? Email <a href="mailto:dispatch@infamousfreight.com" className="font-semibold text-infamous-red-light hover:underline">dispatch@infamousfreight.com</a> with the lane, equipment, pickup timing, freight details, and contact info.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Rate Estimate */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card p-6">
              <div className="mb-3 flex items-center gap-2">
                <Gauge size={18} className="text-infamous-red-light" />
                <h2 className="font-bold">Rate Estimate</h2>
              </div>
              {estimate ? (
                <>
                  <div className="rounded-lg border border-infamous-border bg-infamous-panel p-4">
                    <p className="text-xs uppercase tracking-wider text-infamous-muted">Estimated Linehaul</p>
                    <p className="mt-1 text-2xl font-black text-[#F5E8E8]">
                      {formatCurrency(estimate.low)} – {formatCurrency(estimate.high)}
                    </p>
                    <p className="mt-2 text-xs text-[#B88989]">
                      Mid: {formatCurrency(estimate.mid)} · {estimate.rpm.toFixed(2)}/mi
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-infamous-muted">Confidence</span>
                    <span className="font-semibold text-infamous-red-light">{estimate.confidence}%</span>
                  </div>
                  <p className="mt-3 text-xs text-[#B88989]/70">{estimate.reason}</p>
                </>
              ) : (
                <p className="text-sm text-[#B88989]">
                  Add equipment, weight, and lane miles to see an instant rate estimate.
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card p-6">
              <h2 className="font-bold">What Happens Next</h2>
              <div className="mt-4 space-y-3">
                {['Lane reviewed by dispatch', 'Carrier capacity checked', 'Rate confirmed', 'Pickup details finalized'].map((s, i) => (
                  <div key={s} className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-infamous-red/10 text-xs font-bold text-infamous-red-light">{i + 1}</span>
                    <p className="pt-0.5 text-sm text-[#B88989]">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-xl border border-infamous-border bg-infamous-panel p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5E8E8]">
                <Truck size={16} className="text-infamous-red-light" /> Tip
              </div>
              <p className="mt-2 text-xs text-[#B88989]">
                Fill in as many details as possible — origin, destination, freight type, weight, and pickup date — so dispatch can respond faster.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PublicQuoteRequestPage;
