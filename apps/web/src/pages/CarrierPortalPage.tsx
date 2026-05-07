import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  DollarSign,
  FileCheck2,
  FileText,
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

// In production this is hydrated from the carrier's onboarding record; the
// demo carrier sits at the compliance step so the state machine shows both
// completed and pending rails on screen.
const currentStageId = 'compliance' as OnboardingStageId;

const CarrierPortalPage: React.FC = () => {
  const currentIdx = onboardingStages.findIndex((s) => s.id === currentStageId);
  const completedCount = currentStageId === 'approved' ? onboardingStages.length : currentIdx;
  const progressPct = Math.round((completedCount / onboardingStages.length) * 100);
  const isApproved = currentStageId === 'approved';

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <Link to="/home" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Carrier workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Available loads, assigned work, documents, and pay status</h1>
          <p className="mt-2 max-w-2xl text-gray-400">See available loads, your assigned work, document needs, and pay status — without chasing dispatch by phone.</p>
        </header>

        <section
          aria-label="Carrier onboarding status"
          className="mb-6 rounded-3xl border border-infamous-border bg-infamous-card p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-orange">Onboarding status</p>
              <h2 className="mt-1 text-lg font-bold">
                {isApproved
                  ? 'Approved — cleared to book Infamous loads'
                  : `Step ${currentIdx + 1} of ${onboardingStages.length}: ${onboardingStages[currentIdx]?.label}`}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {isApproved
                  ? 'Your file is current. New loads matching your lanes will appear below.'
                  : 'Finish the highlighted step to unlock load booking and QuickPay.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">Progress</p>
                <p className="text-lg font-bold text-infamous-orange">{progressPct}%</p>
              </div>
              <Link
                to="/onboarding"
                className="rounded-xl border border-infamous-orange/40 bg-infamous-orange/10 px-4 py-2 text-sm font-semibold text-infamous-orange hover:bg-infamous-orange/20"
              >
                {isApproved ? 'Update file' : 'Continue setup'}
              </Link>
            </div>
          </div>

          <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-infamous-orange to-[#ff6d00] transition-all duration-500"
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
                  ? 'border-green-500/30 bg-green-500/5 text-green-300'
                  : state === 'current'
                    ? 'border-infamous-orange bg-infamous-orange/10 text-infamous-orange'
                    : 'border-infamous-border bg-[#111] text-gray-500';
              const statusLabel = state === 'complete' ? 'Complete' : state === 'current' ? 'In review' : 'Pending';
              return (
                <li
                  key={stage.id}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={`rounded-2xl border p-4 transition-all ${stateClasses}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {state === 'complete' ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{statusLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">{stage.icon}</span>
                    <p className="text-sm font-semibold text-white">{stage.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{stage.detail}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ['Available loads', demoCarrierLoads.length, <Truck size={20} />],
            ['Assigned loads', 4, <ClipboardCheck size={20} />],
            ['Documents needed', 2, <FileCheck2 size={20} />],
            ['Payments pending', '$8,450', <DollarSign size={20} />],
          ].map(([label, value, icon]) => (
            <div key={String(label)} className="rounded-2xl border border-infamous-border bg-infamous-card p-5">
              <div className="mb-3 text-infamous-orange">{icon}</div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-infamous-border bg-infamous-card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Available loads</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/load-board"
                className="rounded-full border border-infamous-orange/40 bg-infamous-orange/10 px-3 py-1 text-xs font-semibold text-infamous-orange hover:bg-infamous-orange/20"
              >
                Open full load board
              </Link>
              {isApproved ? (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">Capacity open</span>
              ) : (
                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                  Booking unlocks at approval
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {demoCarrierLoads.map((load) => (
              <article key={load.id} className="rounded-2xl border border-infamous-border bg-[#111] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-mono text-xs text-gray-500">{load.id}</p>
                  <span className="rounded-full bg-infamous-orange/10 px-3 py-1 text-xs text-infamous-orange">{load.equipment}</span>
                </div>
                <h3 className="text-lg font-bold">{load.lane}</h3>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>Pickup: {load.pickup}</p>
                  <p>Delivery: {load.delivery}</p>
                  <p>Miles: {load.miles}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-infamous-border pt-4">
                  <p className="text-xl font-bold text-white">{load.pay}</p>
                  <button
                    type="button"
                    disabled={!isApproved}
                    title={isApproved ? undefined : 'Finish onboarding to request loads'}
                    className="rounded-xl bg-infamous-orange px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Request load
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default CarrierPortalPage;
