import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send, Truck } from 'lucide-react';
import { submitNetlifyForm } from '@/lib/netlifyForms';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  equipment: 'Cargo van',
  notes: '',
};

const equipmentOptions = ['Cargo van', 'Sprinter van', 'Box truck', 'Power-only', 'Dry van', 'Reefer', 'Flatbed'];

const DriversApplyPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitNetlifyForm('driver-application', form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit this application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-infamous-orange/30 bg-infamous-orange/10 px-4 py-2 text-sm text-infamous-orange">
              <Truck size={16} /> Apply to drive
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Get verified and join the network.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
              Submit your contact, location, and equipment details. Onboarding will follow up with verification next steps.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {['Free to start', 'Verified operators first', 'Organized onboarding'].map((item) => (
                <div key={item} className="rounded-2xl border border-infamous-border bg-infamous-card p-5">
                  <h2 className="font-bold">{item}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Built for cleaner freight handoffs and better communication.</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-infamous-border bg-infamous-card p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Application</h2>
            <p className="mt-2 text-sm text-gray-400">Required fields help onboarding respond faster.</p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
                <CheckCircle2 className="mb-3 text-green-400" size={32} />
                <h3 className="text-xl font-bold">Application received</h3>
                <p className="mt-2 text-gray-300">Onboarding will review your details and follow up.</p>
                <button type="button" onClick={() => { setSubmitted(false); setForm(initialForm); }} className="mt-5 rounded-xl bg-infamous-orange px-4 py-2 font-semibold text-white">
                  Submit another application
                </button>
              </div>
            ) : (
              <form name="driver-application" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="mt-6 space-y-5">
                <input type="hidden" name="form-name" value="driver-application" />
                <input type="hidden" name="csrf-token" value="netlify-form-driver-application-v1" />
                <p className="hidden"><label>Do not fill this out: <input name="bot-field" /></label></p>
                {(['fullName', 'email', 'phone', 'city', 'state'] as const).map((key) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">{key}</span>
                    <input name={key} value={form[key]} onChange={(event) => update(key, event.target.value)} className="w-full rounded-xl border border-infamous-border bg-[#111] px-4 py-3 text-white outline-none transition focus:border-infamous-orange" required />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Equipment</span>
                  <select name="equipment" value={form.equipment} onChange={(event) => update('equipment', event.target.value)} className="w-full rounded-xl border border-infamous-border bg-[#111] px-4 py-3 text-white outline-none transition focus:border-infamous-orange">
                    {equipmentOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Notes</span>
                  <textarea name="notes" value={form.notes} onChange={(event) => update('notes', event.target.value)} className="min-h-28 w-full rounded-xl border border-infamous-border bg-[#111] px-4 py-3 text-white outline-none transition focus:border-infamous-orange" />
                </label>
                {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
                <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit application'} <Send size={17} />
                </button>
              </form>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
};

export default DriversApplyPage;
