import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, Calendar, DollarSign, Users, Zap } from 'lucide-react';

interface Subscription {
  plan: string;
  price: number;
  interval: 'month' | 'year';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  features: string[];
}

interface PaymentMethod {
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const StripeCustomerPortal: React.FC = () => {
  const [subscription] = useState<Subscription>({
    plan: 'Growth',
    price: 99,
    interval: 'month',
    status: 'active',
    currentPeriodEnd: 'May 1, 2025',
    features: [
      'Unlimited loads & drivers',
      'Auto-dispatch AI',
      'Rate negotiation bot',
      'Voice booking',
      'ELD sync (4 providers)',
      'Priority support',
    ],
  });

  const [paymentMethod] = useState<PaymentMethod>({
    brand: 'visa',
    last4: '4242',
    expiry: '12/26',
    isDefault: true,
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard size={24} className="text-infamous-orange" />
            Billing & Subscription
          </h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Manage your Infamous Freight plan</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <span className={`badge ${subscription.status === 'active' ? 'badge-green' : subscription.status === 'past_due' ? 'badge-yellow' : 'badge-red'}`}>
            {subscription.status}
          </span>
        </div>

        <div className="bg-gradient-to-r from-infamous-orange/20 to-infamous-orange/5 border border-infamous-orange/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{subscription.plan}</p>
              <p className="text-sm text-[#B88989] flex items-center gap-2 mt-1">
                <Calendar size={14} /> Renews {subscription.currentPeriodEnd}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-infamous-orange">
                ${subscription.price}<span className="text-sm text-[#B88989]/70">/{subscription.interval}</span>
              </p>
              {subscription.interval === 'month' && (
                <p className="text-xs text-[#B88989]/70">$1,188/year — Upgrade to annual for 20% off</p>
              )}
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {subscription.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#F5E8E8]/80">
                <CheckCircle size={14} className="text-green-400" /> {f}
              </li>
            ))}
          </ul>

          <div className="flex gap-3 mt-5">
            <button className="btn-primary text-sm">Upgrade Plan</button>
            <button className="btn-secondary text-sm">Switch to Annual (-20%)</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="flex items-center justify-between p-4 bg-infamous-dark rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
                <span className="text-[#F5E8E8] text-xs font-bold italic">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium">•••• {paymentMethod.last4}</p>
                <p className="text-xs text-[#B88989]/70">Expires {paymentMethod.expiry}</p>
              </div>
            </div>
            <button className="text-sm text-infamous-orange hover:underline">Update</button>
          </div>
        </div>

        {/* Usage */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">This Month</h2>
          <div className="space-y-3">
            {[
              { label: 'Loads Dispatched', value: 47, limit: 'Unlimited', percent: 0, icon: <Zap size={14} /> },
              { label: 'Active Drivers', value: 12, limit: 'Unlimited', percent: 0, icon: <Users size={14} /> },
              { label: 'AI Matches', value: 38, limit: 'Unlimited', percent: 0, icon: <Zap size={14} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#B88989]">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.value}</span>
                  <span className="text-xs text-[#B88989]/60">/ {item.limit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Section */}
      <div className="card border-red-500/20">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          Cancel Subscription
        </h2>
        <p className="text-sm text-[#B88989]/70 mb-4">
          Your data will be preserved for 30 days. You can reactivate anytime.
        </p>
        {showCancelConfirm ? (
          <div className="flex gap-3">
            <button className="bg-red-500 hover:bg-red-600 text-[#F5E8E8] font-medium py-2 px-4 rounded-xl transition-all text-sm">
              Confirm Cancellation
            </button>
            <button onClick={() => setShowCancelConfirm(false)} className="btn-secondary text-sm">
              Keep My Plan
            </button>
          </div>
        ) : (
          <button onClick={() => setShowCancelConfirm(true)} className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
};

export default StripeCustomerPortal;
