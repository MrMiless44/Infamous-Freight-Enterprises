import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#090909] px-6 py-16 text-[#F5E8E8]">
      <section className="mx-auto max-w-3xl rounded-3xl border border-infamous-border bg-infamous-card p-8 shadow-2xl">
        <CheckCircle2 className="mb-5 text-green-400" size={42} />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Submission received</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Thanks for reaching out.</h1>
        <p className="mt-4 text-lg leading-8 text-[#F5E8E8]/80">
          The Infamous Freight team received the form details and will route them to dispatch, onboarding, or support.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90">
            Back to home <ArrowRight size={17} />
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center rounded-xl border border-infamous-border bg-infamous-panel px-5 py-3 font-semibold text-[#F5E8E8] transition hover:border-infamous-orange/60">
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}
