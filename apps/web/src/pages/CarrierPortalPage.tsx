import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  DollarSign,
  FileCheck2,
  FileText,
  MapPin,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';
import { demoCarrierLoads } from '@/data/mvpFreightData';

type OnboardingStageId = 'application' | 'documents' | 'insurance' | 'compliance' | 'approved';

interface OnboardingStage {
  id: OnboardingStageId;
  label: string;
  detail: string;
  icon: React.ReactNode;
}

const onboardingStages: OnboardingStage[] = [
  { id: 'application', label: 'Application', detail: 'MC#, USDOT, contact', icon: <FileText size={16} /> },
  { id: 'documents',   label: 'Documents',   detail: 'W-9, voided check, agreement', icon: <FileCheck2 size={16} /> },
  { id: 'insurance',   label: 'Insurance',   detail: 'COI on file with $1M auto + cargo', icon: <ShieldCheck size={16} /> },
  { id: 'compliance',  label: 'Compliance',  detail: 'FMCSA authority + safety review', icon: <ClipboardCheck size={16} /> },
  { id: 'approved',    label: 'Approved',    detail: 'Cleared to book Infamous loads', icon: <UserCheck size={16} /> },
];

const currentStageId = 'compliance' as OnboardingStageId;

const CarrierPortalPage: React.FC = () => {
  const currentIdx = onboardingStages.findIndex((s) => s.id === currentStageId);
  const completedCount = currentStageId === 'approved' ? onboardingStages.length : currentIdx;
  const progressPct = Math.round((completedCount / onboardingStages.length) * 100);
  const isApproved = currentStageId === 'approved';

  return (
    <div className="min-h-screen bg-infamous-dark px-5 py-8 text-[#F5E8E8] lg:px-6">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[#B88989] hover:text-[#F5E8E8]">
          <ArrowLeft size={16} /> Back
        </Link>

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-green-light">Carrier Portal</p>
          <h1 className="mt-2 text-3xl font-black">Move Freight With Infamous</h1>
          <p className="mt-2 max-w-2xl text-[#B88989]">Browse available loads, manage assignments, upload documents, and track payments — all from one dashboard.</p>
        </header>

        {/* Onboarding */}
        <section
          aria-label="Carrier onboarding status"
          className="mb-6 rounded-xl border border-infamous-border bg-infamous-card p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-green-light">Onboarding Status</p>
              <h2 className="mt-1 text-lg font-bold">
                {isApproved
                  ? 'Approved — cleared to book loads'
                  : `Step ${currentIdx + 1} of ${onboardingStages.length}: ${onboardingStages[currentIdx]?.label}`}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-infamous-green-light">{progressPct}%</span>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-infamous-green/10 border border-infamous-green/20 px-4 py-2 text-sm font-semibold text-infamous-green-light hover:bg-infamous-green/20 transition"
              >
                {isApproved ? 'Update File' : 'Continue Setup'} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="mb-5 h-2 overflow-hidden rounded-full bg-infamous-panel">
            <div
              className="h-full rounded-full bg-gradient-to-r from-infamous-green to-infamous-green-light transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <ol className="grid gap-3 md:grid-cols-5">
            {onboardingStages.map((stage, idx) => {
              const state = isApproved
                ? 'complete'
                : idx < currentIdx
                  ? 'complete'
                  : idx === currentIdx
                    ? 'current'
                    : 'pending';
              const stateClasses =
                state === 'complete'
                  ? 'border-[#36D399]/20 bg-[#36D399]/5 text-[#36D399]'
                  : state === 'current'
                    ? 'border-infamous-red/30 bg-infamous-red/10 text-infamous-red-light'
                    : 'border-infamous-border bg-infamous-panel text-[#B88989]/70';
              const statusLabel = state === 'complete' ? 'Complete' : state === 'current' ? 'In Review' : 'Pending';
              return (
                <li
                  key={stage.id}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={`rounded-xl border p-4 transition-all ${stateClasses}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {state === 'complete' ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />}
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{statusLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{stage.icon}</span>
                    <p className="text-sm font-semibold text-[#F5E8E8]">{stage.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-[#B88989]">{stage.detail}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Metrics */}
        <section className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {([
            { label: 'Available Loads', value: demoCarrierLoads.length, icon: Truck, color: 'text-infamous-red-light' },
            { label: 'Assigned Loads', value: 4, icon: ClipboardCheck, color: 'text-infamous-green-light' },
            { label: 'Documents Needed', value: 2, icon: FileCheck2, color: 'text-infamous-orange' },
            { label: 'Payments Pending', value: '$8,450', icon: DollarSign, color: 'text-[#36D399]' },
          ] as const).map((item) => (
            <div key={item.label} className="metric-card">
              <item.icon size={20} className={item.color} />
              <p className="mt-3 text-2xl font-black">{item.value}</p>
              <p className="mt-1 text-sm text-infamous-muted">{item.label}</p>
            </div>
          ))}
        </section>

        {/* Available Loads */}
        <section className="rounded-xl border border-infamous-border bg-infamous-card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Available Loads</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/load-board"
                className="inline-flex items-center gap-2 rounded-lg bg-infamous-red/10 border border-infamous-red/20 px-4 py-2 text-xs font-semibold text-infamous-red-light hover:bg-infamous-red/20 transition"
              >
                Full Load Board <ArrowRight size={12} />
              </Link>
              {isApproved ? (
                <span className="badge-green">Capacity Open</span>
              ) : (
                <span className="badge-orange">Booking unlocks at approval</span>
              )}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {demoCarrierLoads.map((load) => (
              <article key={load.id} className="rounded-xl border border-infamous-border bg-infamous-panel p-5 transition hover:border-infamous-red/20">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-xs text-infamous-muted">{load.id}</p>
                  <span className="badge-blue">{load.equipment}</span>
                </div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <MapPin size={14} className="text-infamous-red-light shrink-0" />
                  {load.lane}
                </h3>
                <div className="mt-3 space-y-1.5 text-sm text-[#B88989]">
                  <p>Pickup: {load.pickup}</p>
                  <p>Delivery: {load.delivery}</p>
                  <p>{load.miles} miles</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-infamous-border pt-4">
                  <p className="text-xl font-black text-[#F5E8E8]">{load.pay}</p>
                  <button
                    type="button"
                    disabled={!isApproved}
                    title={isApproved ? undefined : 'Finish onboarding to request loads'}
                    className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Request Load
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CarrierPortalPage;
