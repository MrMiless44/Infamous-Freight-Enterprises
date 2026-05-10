import { Link } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

const BillingRequiredPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-3xl w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-infamous-orange/20 text-infamous-orange flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-infamous-orange">Billing required</p>
            <h1 className="text-3xl font-bold text-[#F5E8E8]">Activate your plan to continue</h1>
          </div>
        </div>

        <p className="text-[#F5E8E8]/80 text-lg leading-relaxed mb-6">
          Start a trial or pick a plan to unlock dispatch, loads, drivers, invoices, and analytics. You can still log in, request quotes, and track shipments anytime.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <CreditCard className="w-6 h-6 text-infamous-orange mb-3" />
            <h2 className="text-[#F5E8E8] font-semibold mb-2">Start or update billing</h2>
            <p className="text-[#B88989] text-sm">Choose a pay-per-load or subscription plan and return to the app after checkout.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <ShieldCheck className="w-6 h-6 text-infamous-orange mb-3" />
            <h2 className="text-[#F5E8E8] font-semibold mb-2">What's behind the paywall</h2>
            <p className="text-[#B88989] text-sm">Dispatch, loads, drivers, invoices, analytics, and compliance unlock as soon as billing is active.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/pay-per-load"
            className="inline-flex items-center justify-center rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-black hover:brightness-110 transition"
          >
            View pricing
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-semibold text-[#F5E8E8] hover:bg-white/10 transition"
          >
            Billing settings
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-[#F5E8E8]/80 hover:text-[#F5E8E8] transition"
          >
            Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BillingRequiredPage;
