import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Loader2,
  PlayCircle,
  Radio,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { canAccessLaunchValidation, isLaunchValidationEnabled } from '@/lib/launchValidationAccess';
import {
  confirmDispatch,
  convertQuoteToLoad,
  createFreightOperation,
  getApiErrorMessage,
  LaunchValidationResult,
  recordTrackingUpdate,
  respondToLoadAssignment,
  rollupOperationalMetrics,
  updateCarrierPaymentStatus,
  updateLoadBoardPostStatus,
  verifyDelivery,
} from '@/lib/freightWorkflowApi';

type WorkflowRecord = Record<string, unknown> & { id: string };

type QuoteToLoadResult = {
  quoteRequest: WorkflowRecord;
  load: WorkflowRecord;
};

type DeliveryVerificationResult = {
  deliveryConfirmation: WorkflowRecord;
  tracking: WorkflowRecord;
};

const initialChecks: LaunchValidationResult[] = [
  { name: 'Quote to load conversion', status: 'pending' },
  { name: 'Assignment acceptance', status: 'pending' },
  { name: 'Dispatch confirmation', status: 'pending' },
  { name: 'Tracking update', status: 'pending' },
  { name: 'POD verification', status: 'pending' },
  { name: 'Carrier payment status', status: 'pending' },
  { name: 'Operational KPI rollup', status: 'pending' },
  { name: 'Load board lifecycle', status: 'pending' },
];

function updateCheck(
  checks: LaunchValidationResult[],
  name: string,
  patch: Partial<LaunchValidationResult>,
): LaunchValidationResult[] {
  return checks.map((check) => (check.name === name ? { ...check, ...patch } : check));
}

const LaunchValidationPage: React.FC = () => {
  const { user } = useAppStore();
  const [checks, setChecks] = useState<LaunchValidationResult[]>(initialChecks);
  const [isRunning, setIsRunning] = useState(false);
  const [lastLoadId, setLastLoadId] = useState<string | null>(null);

  const context = useMemo(() => ({
    tenantId: user?.carrierId ?? 'carrier_default',
    role: user?.role ?? 'dispatcher',
  }), [user?.carrierId, user?.role]);
  const launchValidationEnabled = isLaunchValidationEnabled();
  const canAccess = canAccessLaunchValidation(user?.role);

  const setRunning = (name: string) => {
    setChecks((current) => updateCheck(current, name, { status: 'running', detail: undefined }));
  };

  const setPassed = (name: string, detail: string) => {
    setChecks((current) => updateCheck(current, name, { status: 'passed', detail }));
  };

  const setFailed = (name: string, detail: string) => {
    setChecks((current) => updateCheck(current, name, { status: 'failed', detail }));
  };

  const runValidation = async () => {
    if (!canAccess) {
      toast.error('Launch validation is restricted to owner/admin users when enabled.');
      return;
    }

    setIsRunning(true);
    setChecks(initialChecks);

    try {
      setRunning('Quote to load conversion');
      const quote = await createFreightOperation<WorkflowRecord>('quoteRequests', context, {
        brokerName: 'Launch Validation Broker',
        originCity: 'Dallas',
        destCity: 'Chicago',
        freightType: 'dry_van',
        weight: 42000,
        pickupDate: new Date().toISOString(),
        shipperRate: 2600,
        carrierCost: 2100,
        profitMargin: 500,
        status: 'pending',
      });
      const quoteConversion = await convertQuoteToLoad<QuoteToLoadResult>(context, quote.id, {
        load: {
          brokerName: 'Launch Validation Broker',
          originCity: 'Dallas',
          originState: 'TX',
          originLat: 32.7767,
          originLng: -96.797,
          destCity: 'Chicago',
          destState: 'IL',
          destLat: 41.8781,
          destLng: -87.6298,
          distance: 925,
          rate: 2600,
          ratePerMile: 2.81,
          equipmentType: 'dry_van',
          weight: 42000,
          pickupDate: new Date().toISOString(),
        },
      });
      const loadId = quoteConversion.load.id;
      setLastLoadId(loadId);
      setPassed('Quote to load conversion', `Created load ${loadId}`);

      setRunning('Assignment acceptance');
      const assignment = await createFreightOperation<WorkflowRecord>('loadAssignments', context, {
        loadId,
        rateConfirmed: 2500,
        status: 'pending',
      });
      await respondToLoadAssignment<WorkflowRecord>(context, assignment.id, 'accepted');
      setPassed('Assignment acceptance', `Accepted assignment ${assignment.id}`);

      setRunning('Dispatch confirmation');
      const dispatch = await createFreightOperation<WorkflowRecord>('loadDispatches', context, {
        loadId,
        status: 'pending',
        pickupContactName: 'Launch Dock',
      });
      await confirmDispatch<WorkflowRecord>(context, dispatch.id);
      setPassed('Dispatch confirmation', `Confirmed dispatch ${dispatch.id}`);

      setRunning('Tracking update');
      await recordTrackingUpdate<WorkflowRecord>(context, loadId, {
        latitude: 33.1,
        longitude: -96.9,
        status: 'in_transit',
      });
      setPassed('Tracking update', 'Recorded in-transit location update');

      setRunning('POD verification');
      const delivery = await verifyDelivery<DeliveryVerificationResult>(context, loadId, {
        podSignature: 'Launch Receiver',
        deliveryTime: new Date().toISOString(),
      });
      setPassed('POD verification', `Verified POD ${delivery.deliveryConfirmation.id}`);

      setRunning('Carrier payment status');
      const payment = await createFreightOperation<WorkflowRecord>('carrierPayments', context, {
        loadId,
        amount: 2200,
        status: 'pending',
      });
      await updateCarrierPaymentStatus<WorkflowRecord>(context, payment.id, { status: 'paid' });
      setPassed('Carrier payment status', `Marked payment ${payment.id} paid`);

      setRunning('Operational KPI rollup');
      const metrics = await rollupOperationalMetrics<WorkflowRecord>(context, {
        period: 'daily',
        loadsBooked: 1,
        grossMargin: 400,
        onTimePickup: 1,
        onTimeDelivery: 1,
        daysOutstanding: 0,
      });
      setPassed('Operational KPI rollup', `Created metric ${metrics.id}`);

      setRunning('Load board lifecycle');
      const post = await createFreightOperation<WorkflowRecord>('loadBoardPosts', context, {
        loadId,
        board: 'DAT',
        boardPostId: `launch_${Date.now()}`,
        status: 'posted',
      });
      await updateLoadBoardPostStatus<WorkflowRecord>(context, post.id, { status: 'expired' });
      setPassed('Load board lifecycle', `Expired load-board post ${post.id}`);

      toast.success('Launch validation passed');
    } catch (error) {
      const message = getApiErrorMessage(error);
      const runningCheck = checks.find((check) => check.status === 'running');
      if (runningCheck) {
        setFailed(runningCheck.name, message);
      }
      toast.error(message);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = checks.filter((check) => check.status === 'passed').length;
  const failedCount = checks.filter((check) => check.status === 'failed').length;

  if (!canAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-xl rounded-2xl border border-infamous-border bg-infamous-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#F5E8E8]">Launch validation restricted</h1>
          <p className="mt-3 text-sm text-[#B88989]">
            This tool creates real workflow records. Access is limited to owner/admin users and requires
            <span className="font-mono text-gray-200"> VITE_LAUNCH_VALIDATION_ENABLED=true</span> in production.
          </p>
          <div className="mt-5 rounded-xl border border-infamous-border bg-black/20 p-4 text-left text-sm text-[#B88989]">
            <p>Feature flag: <span className="font-mono text-[#F5E8E8]">{String(launchValidationEnabled)}</span></p>
            <p>Current role: <span className="font-mono text-[#F5E8E8]">{context.role}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-infamous-orange">Phase 5</p>
          <h1 className="mt-2 text-3xl font-bold text-[#F5E8E8]">Launch Validation</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#B88989]">
            Validate the core freight workflows against the live API using the current carrier context.
            Run this before production migration, launch demos, or customer onboarding.
          </p>
        </div>
        <button
          onClick={runValidation}
          disabled={isRunning}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 text-sm font-semibold text-[#F5E8E8] transition hover:bg-infamous-orange-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
          {isRunning ? 'Running validation' : 'Run validation'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-infamous-border bg-infamous-card p-4">
          <p className="text-xs uppercase tracking-wide text-[#B88989]/70">Carrier context</p>
          <p className="mt-2 truncate text-lg font-semibold text-[#F5E8E8]">{context.tenantId}</p>
        </div>
        <div className="rounded-2xl border border-infamous-border bg-infamous-card p-4">
          <p className="text-xs uppercase tracking-wide text-[#B88989]/70">Role</p>
          <p className="mt-2 text-lg font-semibold text-[#F5E8E8]">{context.role}</p>
        </div>
        <div className="rounded-2xl border border-infamous-border bg-infamous-card p-4">
          <p className="text-xs uppercase tracking-wide text-[#B88989]/70">Passed</p>
          <p className="mt-2 text-lg font-semibold text-green-400">{passedCount}/{checks.length}</p>
        </div>
        <div className="rounded-2xl border border-infamous-border bg-infamous-card p-4">
          <p className="text-xs uppercase tracking-wide text-[#B88989]/70">Failed</p>
          <p className="mt-2 text-lg font-semibold text-red-400">{failedCount}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {checks.map((check) => (
          <div key={check.name} className="rounded-2xl border border-infamous-border bg-infamous-card p-5">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {check.status === 'passed' && <CheckCircle2 className="text-green-400" size={22} />}
                {check.status === 'failed' && <XCircle className="text-red-400" size={22} />}
                {check.status === 'running' && <Loader2 className="animate-spin text-infamous-orange" size={22} />}
                {check.status === 'pending' && <ClipboardCheck className="text-[#B88989]/70" size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-[#F5E8E8]">{check.name}</h2>
                <p className="mt-1 text-sm text-[#B88989]">{check.detail ?? 'Not run yet'}</p>
              </div>
              <span className="rounded-full border border-infamous-border px-2.5 py-1 text-xs uppercase text-[#B88989]">
                {check.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-infamous-border bg-infamous-card p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-infamous-orange" size={24} />
          <h2 className="text-xl font-semibold text-[#F5E8E8]">Launch gates</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-infamous-border bg-black/20 p-4">
            <Truck className="mb-3 text-infamous-orange" size={20} />
            <h3 className="font-semibold text-[#F5E8E8]">Dispatcher workflow</h3>
            <p className="mt-2 text-sm text-[#B88989]">Quote, load, assignment, dispatch, and tracking lifecycle.</p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-black/20 p-4">
            <FileCheck2 className="mb-3 text-infamous-orange" size={20} />
            <h3 className="font-semibold text-[#F5E8E8]">POD workflow</h3>
            <p className="mt-2 text-sm text-[#B88989]">Delivery confirmation, POD verification, and delivered tracking state.</p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-black/20 p-4">
            <ClipboardCheck className="mb-3 text-infamous-orange" size={20} />
            <h3 className="font-semibold text-[#F5E8E8]">Payment workflow</h3>
            <p className="mt-2 text-sm text-[#B88989]">Carrier payment creation and status lifecycle.</p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-black/20 p-4">
            <Radio className="mb-3 text-infamous-orange" size={20} />
            <h3 className="font-semibold text-[#F5E8E8]">Reporting workflow</h3>
            <p className="mt-2 text-sm text-[#B88989]">Operational metric rollup and load-board lifecycle checks.</p>
          </div>
        </div>
        {lastLoadId && (
          <p className="mt-5 rounded-xl border border-infamous-border bg-black/20 px-4 py-3 text-sm text-[#B88989]">
            Last validation load: <span className="font-mono text-[#F5E8E8]">{lastLoadId}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LaunchValidationPage;
