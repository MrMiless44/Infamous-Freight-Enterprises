import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign, MapPin, Truck } from 'lucide-react';

interface RateComparison {
  brokerOffer: number;
  marketRate: number;
  suggestedCounter: number;
  potentialSavings: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string[];
}

const RateComparisonTool: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [equipment, setEquipment] = useState('Dry Van');
  const [brokerRate, setBrokerRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RateComparison | null>(null);

  const handleCompare = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));

    const offer = parseFloat(brokerRate);
    const market = offer * (0.85 + Math.random() * 0.2);
    const suggested = market * 1.08;
    const savings = suggested - offer;

    setResult({
      brokerOffer: offer,
      marketRate: Math.round(market * 100) / 100,
      suggestedCounter: Math.round(suggested * 100) / 100,
      potentialSavings: Math.round(savings * 100) / 100,
      confidence: savings > 200 ? 'high' : savings > 50 ? 'medium' : 'low',
      reasoning: [
        `Offer is ${Math.round((1 - offer / market) * 100)}% vs 30-day average`,
        `Rates trending up 4.2% this week`,
        `Fuel surcharge not included in offer`,
      ],
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-infamous-dark text-[#F5E8E8] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare a broker's rate to the market</h1>
          <p className="text-[#B88989]">Paste a broker's rate and see how it compares to market</p>
        </div>

        <div className="bg-infamous-panel border border-infamous-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rate-origin" className="block text-sm text-[#B88989] mb-1">Origin State</label>
              <div className="relative">
                <MapPin size={16} aria-hidden="true" className="absolute left-3 top-3.5 text-[#B88989]/70" />
                <input
                  id="rate-origin"
                  type="text"
                  placeholder="IL"
                  value={origin}
                  onChange={e => setOrigin(e.target.value.toUpperCase())}
                  className="w-full bg-infamous-panel border border-infamous-border rounded-lg pl-10 pr-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red"
                />
              </div>
            </div>
            <div>
              <label htmlFor="rate-dest" className="block text-sm text-[#B88989] mb-1">Dest State</label>
              <div className="relative">
                <MapPin size={16} aria-hidden="true" className="absolute left-3 top-3.5 text-[#B88989]/70" />
                <input
                  id="rate-dest"
                  type="text"
                  placeholder="TX"
                  value={dest}
                  onChange={e => setDest(e.target.value.toUpperCase())}
                  className="w-full bg-infamous-panel border border-infamous-border rounded-lg pl-10 pr-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rate-equipment" className="block text-sm text-[#B88989] mb-1">Equipment Type</label>
              <div className="relative">
                <Truck size={16} aria-hidden="true" className="absolute left-3 top-3.5 text-[#B88989]/70" />
                <select
                  id="rate-equipment"
                  value={equipment}
                  onChange={e => setEquipment(e.target.value)}
                  className="w-full bg-infamous-panel border border-infamous-border rounded-lg pl-10 pr-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red appearance-none"
                >
                  <option>Dry Van</option>
                  <option>Reefer</option>
                  <option>Flatbed</option>
                  <option>Step Deck</option>
                  <option>Power Only</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="rate-broker-offer" className="block text-sm text-[#B88989] mb-1">Broker's Offer ($/mile)</label>
              <div className="relative">
                <DollarSign size={16} aria-hidden="true" className="absolute left-3 top-3.5 text-[#B88989]/70" />
                <input
                  id="rate-broker-offer"
                  type="number"
                  step="0.01"
                  placeholder="2.50"
                  value={brokerRate}
                  onChange={e => setBrokerRate(e.target.value)}
                  className="w-full bg-infamous-panel border border-infamous-border rounded-lg pl-10 pr-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!origin || !dest || !brokerRate || loading}
            className="w-full bg-gradient-to-r from-infamous-red to-infamous-ember hover:from-infamous-ember hover:to-infamous-orange text-[#F5E8E8] font-bold py-4 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing market data...' : 'Compare to Market Rate'}
          </button>
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            {/* Result Card */}
            <div className={`bg-infamous-panel border rounded-2xl p-6 ${
              result.potentialSavings > 0 ? 'border-green-500/30' : 'border-red-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.potentialSavings > 0 ? (
                  <TrendingUp size={24} className="text-green-400" />
                ) : (
                  <AlertTriangle size={24} className="text-red-400" />
                )}
                <h2 className="text-xl font-semibold">
                  {result.potentialSavings > 0
                    ? `Negotiate up to $${result.potentialSavings.toFixed(2)}/mi more`
                    : 'Rate is at or above market'}
                  </h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-infamous-panel rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#B88989]">${result.brokerOffer.toFixed(2)}</p>
                  <p className="text-xs text-[#B88989]/70 mt-1">Broker Offer</p>
                </div>
                <div className="bg-infamous-panel rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">${result.marketRate.toFixed(2)}</p>
                  <p className="text-xs text-[#B88989]/70 mt-1">Market Average</p>
                </div>
                <div className="bg-infamous-panel rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">${result.suggestedCounter.toFixed(2)}</p>
                  <p className="text-xs text-[#B88989]/70 mt-1">Suggested Counter</p>
                </div>
              </div>

              <div className="space-y-2">
                {result.reasoning.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[#F5E8E8]/80">
                    <CheckCircle size={14} className="text-infamous-red-light flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-[#B88989]">Confidence:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                  result.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-[#B88989]'
                }`}>
                  {result.confidence.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Weekly Trend Preview */}
            <div className="bg-infamous-panel border border-infamous-border rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">{origin} → {dest} {equipment} — 7 Day Trend</h3>
              <div className="flex items-end gap-2 h-32">
                {[2.65, 2.71, 2.68, 2.74, 2.80, 2.77, 2.84].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-infamous-red to-infamous-ember rounded-t-lg transition-all"
                      style={{ height: `${(v / 3.2) * 100}%` }}
                    />
                    <span className="text-xs text-[#B88989]/70">{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RateComparisonTool;
