import React, { useState, useEffect } from 'react';
import { Gavel, Clock, TrendingUp, DollarSign, Users, ArrowUp, Shield } from 'lucide-react';

interface Bid {
  id: string;
  driver: string;
  amount: number;
  time: string;
  isMine?: boolean;
}

interface Auction {
  id: string;
  origin: string;
  dest: string;
  distance: number;
  equipment: string;
  weight: number;
  brokerRate: number;
  bestBid: number;
  bidCount: number;
  timeLeft: number; // seconds
  bids: Bid[];
}

const LoadAuction: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([
    {
      id: 'AUC-001', origin: 'Chicago, IL', dest: 'Dallas, TX', distance: 925,
      equipment: 'Dry Van', weight: 32000, brokerRate: 2800, bestBid: 2650,
      bidCount: 4, timeLeft: 1800,
      bids: [
        { id: '1', driver: 'Marcus T.', amount: 2650, time: '2 min ago' },
        { id: '2', driver: 'James R.', amount: 2700, time: '5 min ago' },
        { id: '3', driver: 'Carlos M.', amount: 2750, time: '8 min ago' },
        { id: '4', driver: 'David K.', amount: 2800, time: '12 min ago' },
      ],
    },
    {
      id: 'AUC-002', origin: 'Houston, TX', dest: 'Phoenix, AZ', distance: 1080,
      equipment: 'Reefer', weight: 35000, brokerRate: 4200, bestBid: 3950,
      bidCount: 2, timeLeft: 3600,
      bids: [
        { id: '1', driver: 'Amir H.', amount: 3950, time: '1 min ago' },
        { id: '2', driver: 'Robert L.', amount: 4100, time: '10 min ago' },
      ],
    },
  ]);

  const [bidAmount, setBidAmount] = useState('');
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions((prev) => prev.map((a) => ({ ...a, timeLeft: Math.max(0, a.timeLeft - 1) })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const placeBid = (auctionId: string) => {
    const amount = parseFloat(bidAmount);
    if (!amount) return;
    setAuctions((prev) => prev.map((a) => {
      if (a.id !== auctionId) return a;
      const newBid: Bid = { id: `new_${Date.now()}`, driver: 'You', amount, time: 'now', isMine: true };
      return {
        ...a,
        bestBid: Math.min(a.bestBid, amount),
        bidCount: a.bidCount + 1,
        bids: [newBid, ...a.bids],
      };
    }));
    setBidAmount('');
    setSelectedAuction(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gavel aria-hidden="true" size={24} className="text-infamous-orange" />
            Load Auctions
          </h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Carriers underbid the broker rate — lowest bid takes the load and pockets the difference.</p>
        </div>
        <div className="badge-orange flex items-center gap-1">
          <Shield aria-hidden="true" size={12} /> {auctions.length} Active Auctions
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {auctions.map((auction) => {
          const savings = auction.brokerRate - auction.bestBid;
          return (
            <div key={auction.id} className="card space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#B88989]/60">{auction.id}</span>
                  <span className="badge-blue text-[10px]">{auction.equipment}</span>
                </div>
                <div className={`flex items-center gap-1 ${auction.timeLeft < 300 ? 'text-red-400' : 'text-[#B88989]'}`}>
                  <Clock aria-hidden="true" size={12} />
                  <span className="text-xs font-mono">{formatTime(auction.timeLeft)}</span>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-lg font-semibold">{auction.origin}</p>
                  <p className="text-xs text-[#B88989]/70">{auction.distance} mi · {auction.weight.toLocaleString()} lbs</p>
                </div>
                <ArrowUp aria-hidden="true" size={16} className="text-[#B88989]/60 rotate-90" />
                <div className="flex-1 text-right">
                  <p className="text-lg font-semibold">{auction.dest}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-infamous-dark rounded-xl p-3 text-center">
                  <p className="text-xs text-[#B88989]/70">Broker Rate</p>
                  <p className="text-lg font-bold text-[#B88989]">${auction.brokerRate.toLocaleString()}</p>
                </div>
                <div className="bg-infamous-dark rounded-xl p-3 text-center border border-infamous-orange/30">
                  <p className="text-xs text-infamous-orange">Best Bid</p>
                  <p className="text-lg font-bold text-infamous-orange">${auction.bestBid.toLocaleString()}</p>
                </div>
                <div className="bg-infamous-dark rounded-xl p-3 text-center">
                  <p className="text-xs text-green-400">You Save</p>
                  <p className="text-lg font-bold text-green-400">${savings.toLocaleString()}</p>
                </div>
              </div>

              {/* Bid History */}
              <div>
                <p className="text-xs text-[#B88989]/70 mb-2 flex items-center gap-1">
                  <Users aria-hidden="true" size={10} /> {auction.bidCount} bids
                </p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {auction.bids.map((bid) => (
                    <div key={bid.id} className={`flex items-center justify-between p-2 rounded-lg text-sm ${bid.isMine ? 'bg-infamous-orange/10 border border-infamous-orange/20' : 'bg-infamous-dark'}`}>
                      <span className={bid.isMine ? 'font-medium text-infamous-orange' : 'text-[#B88989]'}>{bid.driver}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">${bid.amount.toLocaleString()}</span>
                        <span className="text-xs text-[#B88989]/60">{bid.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Place Bid */}
              {selectedAuction === auction.id ? (
                <div className="flex gap-2">
                  <input
                    id={`bid-amount-${auction.id}`}
                    type="number"
                    className="input-field flex-1"
                    placeholder={`Enter bid (max $${auction.brokerRate})`}
                    aria-label={`Bid amount for auction ${auction.id}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    autoFocus
                  />
                  <button type="button" onClick={() => placeBid(auction.id)} className="btn-primary">
                    <DollarSign aria-hidden="true" size={14} /> Bid
                  </button>
                  <button type="button" onClick={() => setSelectedAuction(null)} className="btn-secondary">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setSelectedAuction(auction.id)} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Gavel aria-hidden="true" size={14} /> Place Bid
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadAuction;
