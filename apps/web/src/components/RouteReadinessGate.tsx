import type { ReactNode } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { RouteReadinessPath } from '@/lib/route-readiness';
import { routeReadinessByPath } from '@/lib/route-readiness';

interface RouteReadinessGateProps {
  route: RouteReadinessPath;
  children: ReactNode;
}

const statusLabel = {
  live: 'Live',
  'demo-backed': 'Demo-backed',
  'not-ready': 'Not ready',
} as const;

const statusClassName = {
  live: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  'demo-backed': 'border-yellow-500/40 bg-yellow-500/10 text-yellow-100',
  'not-ready': 'border-red-500/40 bg-red-500/10 text-red-100',
} as const;

export default function RouteReadinessGate({ route, children }: RouteReadinessGateProps) {
  const readiness = routeReadinessByPath[route];

  if (readiness.status === 'not-ready') {
    return (
      <main className="min-h-[70vh] px-4 py-10 text-[#F5E8E8]">
        <section className="mx-auto max-w-3xl rounded-2xl border border-red-500/30 bg-[#160608]/90 p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-300" aria-hidden="true" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-red-200">
                Route not production-ready
              </p>
              <h1 className="font-display text-3xl font-bold">{readiness.label}</h1>
            </div>
          </div>
          <p className="text-base leading-relaxed text-[#E8CACA]">{readiness.summary}</p>
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-950/30 p-4">
            <p className="text-sm font-semibold text-red-100">Operator guidance</p>
            <p className="mt-1 text-sm leading-relaxed text-red-100/85">{readiness.operatorGuidance}</p>
          </div>
        </section>
      </main>
    );
  }

  if (readiness.status === 'demo-backed') {
    return (
      <>
        <div className={`mx-4 mt-4 rounded-2xl border p-4 ${statusClassName[readiness.status]}`} role="status">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">
                {readiness.label}: {statusLabel[readiness.status]}
              </p>
              <p className="mt-1 text-sm leading-relaxed opacity-90">{readiness.summary}</p>
              <p className="mt-2 text-xs leading-relaxed opacity-80">{readiness.operatorGuidance}</p>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <>
      <div className={`mx-4 mt-4 rounded-2xl border p-4 ${statusClassName[readiness.status]}`} role="status">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">
              {readiness.label}: {statusLabel[readiness.status]}
            </p>
            <p className="mt-1 text-sm leading-relaxed opacity-90">{readiness.summary}</p>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
