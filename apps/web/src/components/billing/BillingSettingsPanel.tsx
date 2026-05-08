import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, ExternalLink, Loader2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { trackFunnelEvent } from '@/lib/analytics';
import {
  BillingInterval,
  BillingPlan,
  createCheckoutSession,
  createCustomerPortalSession,
  createOneTimeCheckoutSession,
  getAiUsageSummary,
  getBillingErrorMessage,
  getBillingStatus,
  AiUsageSummary,
  BillingStatus,
} from '@/lib/billingApi';

const plans: Array<{
  plan: BillingPlan;
  name: string;
  description: string;
  monthly: string;
  annual: string;
  recommended?: boolean;
}> = [
  {
    plan: 'starter',
    name: 'Starter',
    description: 'Small freight operations getting dispatch visibility online.',
    monthly: '$99/mo',
    annual: '$1,089/yr',
  },
  {
    plan: 'professional',
    name: 'Professional',
    description: 'Recommended for growing carriers that need automation and reporting.',
    monthly: '$499/mo',
    annual: '$5,389/yr',
    recommended: true,
  },
  {
    plan: 'enterprise',
    name: 'Enterprise',
    description: 'Large operations needing dedicated support, scale, and integrations.',
    monthly: '$2,000/mo',
    annual: '$21,600/yr',
  },
];

const BillingSettingsPanel: React.FC = () => {
  const { user } = useAppStore();
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [usageSummary, setUsageSummary] = useState<AiUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const context = useMemo(() => ({
    tenantId: user?.carrierId ?? 'carrier_default',
    role: user?.role ?? 'dispatcher',
  }), [user?.carrierId, user?.role]);

  const canManageBilling = ['owner', 'admin'].includes(context.role);

  useEffect(() => {
    let mounted = true;

    async function loadBilling() {
      try {
        const [status, usage] = await Promise.all([
          getBillingStatus(context),
          getAiUsageSummary(context),
        ]);

        if (mounted) {
          setBillingStatus(status);
          setUsageSummary(usage);
        }
      } catch (error) {
        toast.error(getBillingErrorMessage(error));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadBilling();

    return () => {
      mounted = false;
    };
  }, [context]);

  const startCheckout = async (plan: BillingPlan, billingInterval: BillingInterval) => {
    if (!canManageBilling) {
      toast.error('Only an owner or admin can update billing. Ask your account owner to make changes.');
      return;
    }

    const actionKey = `${plan}-${billingInterval}`;
    setBusyAction(actionKey);

    try {
      const url = await createCheckoutSession(context, plan, billingInterval);
      trackFunnelEvent('funnel_billing_start', { plan, billingInterval });
      window.location.assign(url);
    } catch (error) {
      toast.error(getBillingErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const startAiAddonCheckout = async () => {
    if (!canManageBilling) {
      toast.error('Only an owner or admin can manage add-ons.');
      return;
    }

    if (!billingStatus?.hasStripeCustomer) {
      toast.error('Start a subscription first so this add-on can be linked to your billing account.');
      return;
    }

    setBusyAction('ai-addon-pack');

    try {
      const url = await createOneTimeCheckoutSession(context, 'ai_addon_pack');
      window.location.assign(url);
    } catch (error) {
      toast.error(getBillingErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const openPortal = async () => {
    if (!canManageBilling) {
      toast.error('Billing portal access requires owner or admin access.');
      return;
    }

    setBusyAction('portal');

    try {
      const url = await createCustomerPortalSession(context);
      window.location.assign(url);
    } catch (error) {
      toast.error(getBillingErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <div className="card flex min-h-[220px] items-center justify-center">
        <Loader2 className="animate-spin text-infamous-orange" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Billing & usage</h2>
            <p className="mt-1 text-sm text-gray-400">
              Pick a plan, manage your card and invoices, and review AI usage.
            </p>
          </div>
          <button
            onClick={openPortal}
            disabled={!canManageBilling || !billingStatus?.hasStripeCustomer || busyAction === 'portal'}
            className="btn-secondary inline-flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === 'portal' ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            Open Customer Portal
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-infamous-border bg-infamous-dark p-4">
            <CreditCard className="mb-3 text-infamous-orange" size={20} />
            <p className="text-xs uppercase tracking-wide text-gray-500">Stripe customer</p>
            <p className="mt-2 truncate font-mono text-sm text-white">
              {billingStatus?.stripeCustomerId ?? 'Not linked yet'}
            </p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-infamous-dark p-4">
            <ShieldCheck className="mb-3 text-infamous-orange" size={20} />
            <p className="text-xs uppercase tracking-wide text-gray-500">Billing role</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {canManageBilling ? 'Owner/admin access' : 'Read only'}
            </p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-infamous-dark p-4">
            <Sparkles className="mb-3 text-infamous-orange" size={20} />
            <p className="text-xs uppercase tracking-wide text-gray-500">AI actions</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {usageSummary?.actionCount ?? 0} logged
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.plan}
            className={`card border ${plan.recommended ? 'border-infamous-orange/50' : 'border-infamous-border'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 min-h-[48px] text-sm text-gray-400">{plan.description}</p>
              </div>
              {plan.recommended && (
                <span className="rounded-full bg-infamous-orange/10 px-2.5 py-1 text-xs font-semibold text-infamous-orange">
                  Recommended
                </span>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => startCheckout(plan.plan, 'month')}
                disabled={!canManageBilling || busyAction === `${plan.plan}-month`}
                className="btn-primary flex w-full items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyAction === `${plan.plan}-month` && <Loader2 size={16} className="animate-spin" />}
                Start {plan.monthly}
              </button>
              <button
                onClick={() => startCheckout(plan.plan, 'year')}
                disabled={!canManageBilling || busyAction === `${plan.plan}-year`}
                className="btn-secondary flex w-full items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyAction === `${plan.plan}-year` && <Loader2 size={16} className="animate-spin" />}
                Start {plan.annual}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card border border-infamous-orange/30 bg-infamous-orange/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-infamous-orange/10 text-infamous-orange">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">One-time AI add-on pack</h2>
              <p className="mt-1 text-sm text-gray-400">
                Add extra AI capacity without changing your subscription. The webhook records the completed checkout.
              </p>
            </div>
          </div>
          <button
            onClick={startAiAddonCheckout}
            disabled={!canManageBilling || !billingStatus?.hasStripeCustomer || busyAction === 'ai-addon-pack'}
            className="btn-primary inline-flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === 'ai-addon-pack' && <Loader2 size={16} className="animate-spin" />}
            Open add-on checkout
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">AI Usage Ledger</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Actions" value={usageSummary?.actionCount ?? 0} />
          <Metric label="Doc scans" value={usageSummary?.documentScans ?? 0} />
          <Metric label="Voice minutes" value={usageSummary?.voiceMinutes ?? 0} />
          <Metric label="Input tokens" value={usageSummary?.inputTokens ?? 0} />
          <Metric label="Output tokens" value={usageSummary?.outputTokens ?? 0} />
          <Metric label="Est. cost" value={`$${(usageSummary?.estimatedCost ?? 0).toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
};

function Metric({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="rounded-xl border border-infamous-border bg-infamous-dark p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

export default BillingSettingsPanel;
