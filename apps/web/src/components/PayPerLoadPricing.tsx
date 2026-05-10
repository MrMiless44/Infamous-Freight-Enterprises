/**
 * RECOMMENDATION: Pay Per Load Pricing
 * Owner-operator friendly: no monthly fee, only pay per load
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, DollarSign, Calculator, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function PayPerLoadPricing() {
  const [loadsPerMonth, setLoadsPerMonth] = useState(15);
  
  const payPerLoadRate = 2.99;
  const monthlyCost = loadsPerMonth * payPerLoadRate;
  const starterPlanCost = 49;
  const savings = Math.max(0, starterPlanCost - monthlyCost);
  const isCheaper = monthlyCost < starterPlanCost;

  const features = [
    'No monthly commitment',
    'Unlimited trucks',
    'Full feature access',
    'Exception Engine AI',
    'GPS tracking',
    'BOL/POD uploads',
    'Email support',
    'Cancel anytime',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-red-600/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8"
    >
      {/* Badge */}
      <div className="flex items-center justify-between mb-6">
        <span className="bg-red-600/20 text-red-400 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
          <Zap className="h-3 w-3" />
          NEW - Owner Operator Favorite
        </span>
      </div>

      <h3 className="text-2xl font-bold text-[#F5E8E8] mb-2">Pay Per Load</h3>
      <p className="text-[#B88989] mb-6">
        No monthly fees. Only pay when you haul. Perfect for owner-operators.
      </p>

      {/* Price Display */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-bold text-[#F5E8E8]">${payPerLoadRate}</span>
        <span className="text-[#B88989]">/load</span>
      </div>

      {/* Calculator */}
      <div className="rounded-xl border border-infamous-border bg-black/30 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-[#F5E8E8]">Cost Calculator</span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#B88989]">Loads per month</span>
            <span className="text-[#F5E8E8] font-medium">{loadsPerMonth} loads</span>
          </div>
          <Slider
            value={[loadsPerMonth]}
            onValueChange={(v) => setLoadsPerMonth(v[0])}
            min={5}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-infamous-border">
          <div className="flex justify-between text-sm">
            <span className="text-[#B88989]">Your monthly cost</span>
            <span className="text-[#F5E8E8] font-medium">${monthlyCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#B88989]">Starter plan cost</span>
            <span className="text-[#B88989]/70 line-through">${starterPlanCost}/mo</span>
          </div>
          {isCheaper && (
            <div className="flex justify-between text-sm">
              <span className="text-[#B88989]">You save</span>
              <span className="text-[#36D399] font-medium">${savings.toFixed(2)}/mo</span>
            </div>
          )}
          {!isCheaper && loadsPerMonth > 16 && (
            <p className="text-xs text-yellow-400 mt-2">
              At {loadsPerMonth} loads/month, our Starter plan ($49/mo) is better value!
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-[#F5E8E8]/80">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg">
        <Truck className="mr-2 h-5 w-5" />
        Start Pay Per Load
      </Button>

      <p className="text-xs text-[#B88989]/70 text-center mt-3">
        Billed at the end of each month based on loads completed. No hidden fees.
      </p>
    </motion.div>
  );
}
