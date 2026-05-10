/**
 * RECOMMENDATION: Annual Billing Toggle
 * Annual billing with 2 months free - increases LTV
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    description: 'For small fleets getting started',
    monthlyPrice: 49,
    annualPrice: 490,
    monthlyEquiv: 41,
    save: 98,
    features: [
      'Up to 10 trucks',
      'Unlimited loads',
      'Basic GPS tracking',
      'Email support',
      'Mobile app access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing fleets',
    monthlyPrice: 149,
    annualPrice: 1490,
    monthlyEquiv: 124,
    save: 298,
    features: [
      'Up to 50 trucks',
      'Everything in Starter',
      'Exception Engine AI',
      'Fuel card integration',
      'Priority support',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large fleets',
    monthlyPrice: 399,
    annualPrice: 3990,
    monthlyEquiv: 333,
    save: 798,
    features: [
      'Unlimited trucks',
      'Everything in Pro',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'White-label option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function AnnualBillingToggle() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="w-full">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm ${!isAnnual ? 'text-[#F5E8E8]' : 'text-[#B88989]/70'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative w-14 h-7 rounded-full bg-infamous-panel transition-colors"
        >
          <motion.div
            animate={{ x: isAnnual ? 28 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 left-0 w-5 h-5 rounded-full bg-red-600"
          />
        </button>
        <span className={`text-sm ${isAnnual ? 'text-[#F5E8E8]' : 'text-[#B88989]/70'}`}>
          Annual
        </span>
        {isAnnual && (
          <span className="flex items-center gap-1 text-xs text-[#36D399] bg-[#36D399]/10 px-2 py-0.5 rounded-full">
            <Sparkles className="h-3 w-3" />
            2 months free
          </span>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -4 }}
            className={`relative rounded-2xl border p-6 ${
              plan.popular
                ? 'border-red-600/50 bg-red-600/5'
                : 'border-infamous-border bg-infamous-card/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-red-600 text-[#F5E8E8] text-xs px-3 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <h3 className="text-xl font-semibold text-[#F5E8E8]">{plan.name}</h3>
            <p className="text-sm text-[#B88989] mt-1">{plan.description}</p>

            {/* Price */}
            <div className="mt-6 mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#F5E8E8]">
                  ${isAnnual ? plan.monthlyEquiv : plan.monthlyPrice}
                </span>
                <span className="text-[#B88989]">/month</span>
              </div>
              {isAnnual && (
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-[#B88989]/70 line-through">
                    ${plan.monthlyPrice}/month billed monthly
                  </p>
                  <p className="text-sm text-[#36D399]">
                    ${plan.annualPrice}/year (save ${plan.save})
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[#F5E8E8]/80">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              className={`w-full ${
                plan.popular
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-infamous-panel hover:bg-infamous-border text-[#F5E8E8]'
              }`}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Usage-based add-ons */}
      <div className="mt-12 rounded-xl border border-infamous-border bg-infamous-card/50 p-6">
        <h3 className="text-lg font-semibold text-[#F5E8E8] mb-4">Usage-Based Add-ons</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-infamous-border">
            <div>
              <p className="text-sm font-medium text-[#F5E8E8]">Extra Truck</p>
              <p className="text-xs text-[#B88989]">Above plan limit</p>
            </div>
            <span className="text-red-400 font-medium">$5/mo</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-infamous-border">
            <div>
              <p className="text-sm font-medium text-[#F5E8E8]">Extra Load</p>
              <p className="text-xs text-[#B88989]">Above plan limit</p>
            </div>
            <span className="text-red-400 font-medium">$0.10</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-infamous-border">
            <div>
              <p className="text-sm font-medium text-[#F5E8E8]">SMS Alert</p>
              <p className="text-xs text-[#B88989]">Per notification</p>
            </div>
            <span className="text-red-400 font-medium">$0.02</span>
          </div>
        </div>
      </div>
    </div>
  );
}
