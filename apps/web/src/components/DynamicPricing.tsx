import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Zap, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RateData {
  date: string;
  rate: number;
  volume: number;
}

interface DynamicPricingProps {
  origin?: string;
  dest?: string;
  equipment?: string;
}

const mockData: RateData[] = [
  { date: 'Mon', rate: 2.65, volume: 42 },
  { date: 'Tue', rate: 2.71, volume: 38 },
  { date: 'Wed', rate: 2.68, volume: 45 },
  { date: 'Thu', rate: 2.74, volume: 51 },
  { date: 'Fri', rate: 2.80, volume: 48 },
  { date: 'Sat', rate: 2.77, volume: 35 },
  { date: 'Sun', rate: 2.84, volume: 40 },
];

const DynamicPricing: React.FC<DynamicPricingProps> = ({ origin = 'Chicago, IL', dest = 'Dallas, TX', equipment = 'Dry Van' }) => {
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('up');
  const [suggestedRate, setSuggestedRate] = useState(2.95);
  const [marketAvg, setMarketAvg] = useState(2.74);
  const [confidence, setConfidence] = useState(87);

  useEffect(() => {
    const first = mockData[0].rate;
    const last = mockData[mockData.length - 1].rate;
    if (last > first * 1.03) setTrend('up');
    else if (last < first * 0.97) setTrend('down');
    else setTrend('stable');

    setSuggestedRate(Math.round((last * 1.04) * 100) / 100);
    setMarketAvg(Math.round((mockData.reduce((s, d) => s + d.rate, 0) / mockData.length) * 100) / 100);
  }, []);

  const trendConfig = {
    up: { icon: <TrendingUp size={16} className="text-green-400" />, color: 'text-green-400', label: 'Trending Up' },
    down: { icon: <TrendingDown size={16} className="text-red-400" />, color: 'text-red-400', label: 'Trending Down' },
    stable: { icon: <Minus size={16} className="text-[#B88989]" />, color: 'text-[#B88989]', label: 'Stable' },
  };

  const cfg = trendConfig[trend];

  return (
    <div className="card max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-infamous-orange" />
            Dynamic Pricing
          </h2>
          <p className="text-sm text-[#B88989]/70 mt-0.5">{origin} → {dest} · {equipment}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-infamous-dark ${cfg.color}`}>
          {cfg.icon}
          <span className="text-xs font-medium">{cfg.label}</span>
        </div>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-infamous-dark rounded-xl p-4 text-center border border-infamous-border">
          <p className="text-xs text-[#B88989]/70 mb-1">Current Market Avg</p>
          <p className="text-2xl font-bold text-blue-400">${marketAvg.toFixed(2)}</p>
          <p className="text-xs text-[#B88989]/60">$/mile</p>
        </div>
        <div className="bg-gradient-to-br from-infamous-orange/20 to-infamous-orange/5 rounded-xl p-4 text-center border border-infamous-orange/30">
          <p className="text-xs text-infamous-orange mb-1">AI Suggested Rate</p>
          <p className="text-3xl font-bold text-infamous-orange">${suggestedRate.toFixed(2)}</p>
          <p className="text-xs text-[#B88989]/70">$/mile · {confidence}% confidence</p>
        </div>
        <div className="bg-infamous-dark rounded-xl p-4 text-center border border-infamous-border">
          <p className="text-xs text-[#B88989]/70 mb-1">Potential Uplift</p>
          <p className="text-2xl font-bold text-green-400">+${(suggestedRate - marketAvg).toFixed(2)}</p>
          <p className="text-xs text-[#B88989]/60">+{Math.round(((suggestedRate - marketAvg) / marketAvg) * 100)}% vs market</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-infamous-dark rounded-xl p-4 border border-infamous-border">
        <p className="text-sm font-medium mb-4">7-Day Rate Trend</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockData}>
            <XAxis dataKey="date" stroke="#555" fontSize={12} />
            <YAxis domain={['auto', 'auto']} stroke="#555" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#241013', border: '1px solid #3A0D12', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => {
                const parsedValue = Array.isArray(value) ? value[0] : value;
                const numericValue = typeof parsedValue === 'number' ? parsedValue : Number(parsedValue ?? 0);
                const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
                return [`$${safeValue.toFixed(2)}`, 'Rate/Mile'];
              }}
            />
            <ReferenceLine y={marketAvg} stroke="#555" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#888', fontSize: 10 }} />
            <Line type="monotone" dataKey="rate" stroke="#ff3d00" strokeWidth={2} dot={{ fill: '#ff3d00', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Factors */}
      <div className="space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <Info size={14} className="text-[#B88989]/70" />
          Pricing Factors
        </p>
        {[
          { factor: 'Demand intensity', impact: '+8%', desc: '45 loads posted in last 24h (vs 32 avg)' },
          { factor: 'Fuel cost adjustment', impact: '+2%', desc: 'Diesel at $3.82/gal (+$0.12 vs last week)' },
          { factor: 'Capacity tightness', impact: '+3%', desc: 'Only 8 available trucks in 50mi radius' },
          { factor: 'Seasonal demand', impact: '+1%', desc: 'Holiday shipping season approaching' },
        ].map((f) => (
          <div key={f.factor} className="flex items-center gap-3 p-3 bg-infamous-dark rounded-xl">
            <div className="flex-1">
              <p className="text-sm font-medium">{f.factor}</p>
              <p className="text-xs text-[#B88989]/70">{f.desc}</p>
            </div>
            <span className="text-sm font-semibold text-green-400">{f.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicPricing;
