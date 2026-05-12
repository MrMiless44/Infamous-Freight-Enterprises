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
  Phone,
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

type FormState = typeof initialForm;
type FormField = keyof FormState;
type ValidationErrors = Partial<Record<FormField | 'attachment', string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\-\s.\d]{7,40}$/;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt']);

const stepFields: Record<number, FormField[]> = {
  0: ['origin', 'destination', 'pickupDate', 'company', 'contact', 'phone', 'email'],
  1: ['freightType', 'weight', 'dimensions', 'deliveryDate', 'miles'],
  2: ['instructions'],
  3: ['origin', 'destination', 'pickupDate', 'company', 'contact', 'phone', 'email', 'freightType', 'weight', 'deliveryDate', 'miles'],
};

const labels: Record<FormField | 'attachment', string> = {
  company: 'Company name',
  contact: 'Contact name',
  email: 'Email',
  phone: 'Phone',
  origin: 'Origin city / state',
  destination: 'Destination city / state',
  freightType: 'Freight type',
  equipment: 'Equipment',
  weight: 'Weight',
  miles: 'Lane miles',
  dimensions: 'Dimensions / pallet count',
  pickupDate: 'Pickup date',
  deliveryDate: 'Delivery date',
  instructions: 'Special instructions',
  attachment: 'Attachment',
};

const isDateBefore = (left: string, right: string) => new Date(`${left}T00:00:00`).getTime() < new Date(`${right}T00:00:00`).getTime();

const validateForm = (form: FormState, attachment: File | null): ValidationErrors => {
  const errors: ValidationErrors = {};
  const required: FormField[] = ['contact', 'phone', 'email', 'origin', 'pickupDate', 'destination'];

  required.forEach((field) => {
    if (!form[field].trim()) {
      errors[field] = `${labels[field]} is required.`;
    }
  });

  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (form.phone.trim() && !PHONE_PATTERN.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  const weight = Number(form.weight);
  if (form.weight.trim() && (!Number.isFinite(weight) || weight <= 0)) {
    errors.weight = 'Enter a weight greater than 0 lbs.';
  }

  const miles = Number(form.miles);
  if (form.miles.trim() && (!Number.isFinite(miles) || miles < 0)) {
    errors.miles = 'Lane miles must be zero or greater.';
  }

  if (form.pickupDate && form.deliveryDate && isDateBefore(form.deliveryDate, form.pickupDate)) {
    errors.deliveryDate = 'Delivery date must be on or after pickup.';
  }

  if (attachment) {
    const extension = attachment.name.split('.').pop()?.toLowerCase() ?? '';
    if (attachment.size > MAX_ATTACHMENT_BYTES) {
      errors.attachment = 'Attachments must be 8 MB or smaller.';
    } else if (!ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)) {
      errors.attachment = 'Use a PDF, image, document, spreadsheet, CSV, or text file.';
    }
  }

  return errors;
};

const getStepErrors = (errors: ValidationErrors, currentStep: number) => {
  const allowedFields = new Set<FormField | 'attachment'>(stepFields[currentStep] ?? []);
  if (currentStep === 2) allowedFields.add('attachment');
  return Object.entries(errors).filter(([field]) => allowedFields.has(field as FormField | 'attachment'));
};

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
  error?: string;
}> = ({ label, name, type = 'text', value, onChange, placeholder, required, autoComplete, inputMode, error }) => (
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
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : undefined}
      className={`input-field ${error ? 'border-red-400 focus:border-red-300 focus:ring-red-300/30' : ''}`}
    />
    {error && <span id={`${name}-error`} className="mt-2 block text-xs font-semibold text-red-200">{error}</span>}
  </label>
);

const PublicQuoteRequestPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const estimate = useMemo(() => computeEstimate(form), [form]);
  const formErrors = useMemo(() => validateForm(form, attachment), [form, attachment]);
  const activeErrors = touched ? errors : {};
  const currentStepErrors = getStepErrors(activeErrors, step);
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const canProceed = (s: number): boolean => {
    return getStepErrors(formErrors, s).length === 0;
  };

  const nextStep = () => {
    const nextErrors = validateForm(form, attachment);
    const stepErrors = getStepErrors(nextErrors, step);
    if (stepErrors.length > 0) {
      setTouched(true);
      setErrors(nextErrors);
      setError('Please fix the highlighted fields before continuing.');
      return;
    }

    setError('');
    setErrors(nextErrors);
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateForm(form, attachment);
    const blockingStep = STEPS.findIndex((_, index) => getStepErrors(nextErrors, index).length > 0);

    if (blockingStep >= 0) {
      setTouched(true);
      setErrors(nextErrors);
      setStep(blockingStep);
      setError('Please fix the highlighted fields before submitting.');
      return;
    }

    setLoading(true);
    setError('');
    setErrors({});

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
              <InputField label="Origin City / State" name="origin" value={form.origin} onChange={(v) => updateField('origin', v)} required error={activeErrors.origin} />
              <InputField label="Destination City / State" name="destination" value={form.destination} onChange={(v) => updateField('destination', v)} required error={activeErrors.destination} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#F5E8E8]/80">Equipment / Service Type <span className="text-infamous-orange">*</span></span>
                <select
                  name="equipment"
                  value={form.equipment}
                  onChange={(e) => updateField('equipment', e.target.value)}
                  aria-invalid={Boolean(activeErrors.equipment)}
                  aria-describedby={activeErrors.equipment ? 'equipment-error' : undefined}
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
                {activeErrors.equipment && <span id="equipment-error" className="mt-2 block text-xs font-semibold text-red-200">{activeErrors.equipment}</span>}
              </label>
              <InputField label="Pickup Timing" name="pickupDate" type="date" value={form.pickupDate} onChange={(v) => updateField('pickupDate', v)} required error={activeErrors.pickupDate} />
            </div>
            <InputField label="Company Name (optional)" name="company" value={form.company} onChange={(v) => updateField('company', v)} autoComplete="organization" error={activeErrors.company} />
            <div className="grid gap-4 sm:grid-cols-3">
              <InputField label="Contact Name" name="contact" value={form.contact} onChange={(v) => updateField('contact', v)} required autoComplete="name" error={activeErrors.contact} />
              <InputField label="Phone" name="phone" type="tel" value={form.phone} onChange={(v) => updateField('phone', v)} required autoComplete="tel" inputMode="tel" error={activeErrors.phone} />
              <InputField label="Email" name="email" type="email" value={form.email} onChange={(v) => updateField('email', v)} required autoComplete="email" error={activeErrors.email} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Freight Details</h2>
            <p className="text-sm text-[#B88989]">Add what is known now. These details help dispatch quote accurately but are not required to start the lead.</p>
            <InputField label="Freight Type" name="freightType" value={form.freightType} onChange={(v) => updateField('freightType', v)} placeholder="e.g. Palletized goods, machinery, retail" error={activeErrors.freightType} />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Weight (lbs)" name="weight" type="number" value={form.weight} onChange={(v) => updateField('weight', v)} inputMode="numeric" error={activeErrors.weight} />
              <InputField label="Dimensions / Pallet Count" name="dimensions" value={form.dimensions} onChange={(v) => updateField('dimensions', v)} placeholder="e.g. 4 pallets, 48x40x60" error={activeErrors.dimensions} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Delivery Date (optional)" name="deliveryDate" type="date" value={form.deliveryDate} onChange={(v) => updateField('deliveryDate', v)} error={activeErrors.deliveryDate} />
              <InputField label="Lane Miles (optional)" name="miles" type="number" value={form.miles} onChange={(v) => updateField('miles', v)} inputMode="numeric" error={activeErrors.miles} />
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
                aria-invalid={Boolean(activeErrors.instructions)}
                aria-describedby={activeErrors.instructions ? 'instructions-error' : undefined}
                className="input-field min-h-32"
                placeholder="Pickup windows, delivery requirements, accessorials, dock notes, liftgate, etc."
              />
              {activeErrors.instructions && <span id="instructions-error" className="mt-2 block text-xs font-semibold text-red-200">{activeErrors.instructions}</span>}
            </label>
            <label className={`block rounded-xl border border-dashed bg-infamous-panel p-5 transition hover:border-infamous-red/30 cursor-pointer ${activeErrors.attachment ? 'border-red-400' : 'border-infamous-border'}`}>
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
                aria-invalid={Boolean(activeErrors.attachment)}
                aria-describedby={activeErrors.attachment ? 'attachment-error' : undefined}
                onChange={(e) => {
                  setAttachment(e.target.files?.[0] ?? null);
                  setErrors((current) => {
                    if (!current.attachment) return current;
                    const next = { ...current };
                    delete next.attachment;
                    return next;
                  });
                }}
                className="mt-3 block w-full text-sm text-[#F5E8E8]/80 file:mr-4 file:rounded-lg file:border-0 file:bg-infamous-red file:px-4 file:py-2 file:font-semibold file:text-[#F5E8E8]"
              />
              {attachment && <span className="mt-2 block text-xs text-[#B88989]/70">{attachment.name}</span>}
              {activeErrors.attachment && <span id="attachment-error" className="mt-2 block text-xs font-semibold text-red-200">{activeErrors.attachment}</span>}
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
      <div className="min-h-screen bg-infamous-dark px-4 py-6 text-[#F5E8E8] sm:px-5 lg:px-6 lg:py-8">
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
              onClick={() => { setSubmitted(false); setForm(initialForm); setTrackingNumber(''); setAttachment(null); setStep(0); setErrors({}); setTouched(false); setError(''); }}
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
    <div className="min-h-screen bg-infamous-dark px-4 py-5 text-[#F5E8E8] sm:px-5 lg:px-6 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[#B88989] hover:text-[#F5E8E8]">
          <ArrowLeft size={16} /> Back
        </Link>

        <header className="mb-6 grid gap-4 rounded-xl border border-infamous-border bg-infamous-card p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-infamous-red-light">Freight quote intake</p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">Request a quote without waiting on a call.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B88989]">
              Share the lane, freight, and contact details dispatch needs to price the move and confirm capacity.
            </p>
          </div>
          <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-panel px-4 text-sm font-semibold text-[#F5E8E8] transition hover:border-infamous-red/40">
            <Phone size={16} className="text-infamous-red-light" /> Contact dispatch
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Form */}
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-4 sm:p-6 lg:p-8">
            {/* Step Indicator */}
            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-infamous-muted">
                <span>Step {step + 1} of {STEPS.length}</span>
                <span>{progress}% complete</span>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-infamous-panel">
                <div className="h-full rounded-full bg-infamous-red transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex snap-x items-center gap-1 overflow-x-auto pb-2">
                {STEPS.map((s, i) => (
                  <div key={s.label} className="flex shrink-0 snap-start items-center gap-1">
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

              {(error || currentStepErrors.length > 0) && (
                <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100" role="alert" aria-live="polite">
                  {error && <p className="font-semibold">{error}</p>}
                  {currentStepErrors.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-red-100/85">
                      {currentStepErrors.map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-infamous-border bg-infamous-card/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0">
                {step > 0 ? (
                  <button type="button" onClick={prevStep} className="btn-secondary inline-flex min-h-12 items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <div />}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary inline-flex min-h-12 flex-1 items-center justify-center gap-2 sm:flex-none"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !canProceed(step)}
                    className="btn-primary btn-lg inline-flex min-h-12 flex-1 items-center justify-center gap-2 sm:flex-none"
                  >
                    {loading ? 'Submitting...' : 'Submit Quote Request'} <Send size={17} />
                  </button>
                )}
              </div>
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
