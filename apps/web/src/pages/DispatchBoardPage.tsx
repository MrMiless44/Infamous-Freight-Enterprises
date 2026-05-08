import { useMemo, useState } from 'react';
import { Sparkles, Zap, Truck, Users, ArrowRight, Mic, Clock, AlertTriangle, CheckCircle, Package, FileCheck, MapPin, Shield, ShieldCheck, Star, X, Activity } from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';

type DispatchStatus =
  | 'pending'
  | 'assigned'
  | 'dispatched'
  | 'at_pickup'
  | 'loaded'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'pod_received'
  | 'exception';

interface DispatchLoad {
  id: string;
  ref: string;
  origin: string;
  dest: string;
  status: DispatchStatus;
  carrier?: string;
  driver?: string;
  rate: number;
  eta?: string;
  equipment: string;
}

const mockLoads: DispatchLoad[] = [
  { id: '1', ref: 'LD-4821', origin: 'Chicago, IL', dest: 'Dallas, TX', status: 'pending', rate: 3200, equipment: 'Dry Van' },
  { id: '2', ref: 'LD-4822', origin: 'Atlanta, GA', dest: 'Charlotte, NC', status: 'assigned', carrier: 'Swift Logistics', driver: 'Marcus T.', rate: 1850, equipment: 'Dry Van' },
  { id: '3', ref: 'LD-4823', origin: 'Houston, TX', dest: 'Phoenix, AZ', status: 'dispatched', carrier: 'Desert Haul Co.', driver: 'James R.', rate: 4100, eta: '11:30 PM', equipment: 'Reefer' },
  { id: '4', ref: 'LD-4824', origin: 'Memphis, TN', dest: 'Indianapolis, IN', status: 'at_pickup', carrier: 'Midland Freight', driver: 'David K.', rate: 2400, eta: '4:00 PM', equipment: 'Flatbed' },
  { id: '5', ref: 'LD-4825', origin: 'Denver, CO', dest: 'Kansas City, MO', status: 'loaded', carrier: 'Rocky Road Transport', driver: 'Mike S.', rate: 1950, eta: '8:00 PM', equipment: 'Dry Van' },
  { id: '6', ref: 'LD-4826', origin: 'Seattle, WA', dest: 'Portland, OR', status: 'in_transit', carrier: 'Pacific Freight', driver: 'Tom L.', rate: 1200, eta: '2:00 PM', equipment: 'Dry Van' },
  { id: '7', ref: 'LD-4827', origin: 'Miami, FL', dest: 'Tampa, FL', status: 'at_delivery', carrier: 'Sunshine Carriers', driver: 'Chris B.', rate: 800, eta: '3:30 PM', equipment: 'Dry Van' },
  { id: '8', ref: 'LD-4828', origin: 'Phoenix, AZ', dest: 'Las Vegas, NV', status: 'delivered', carrier: 'Desert Haul Co.', driver: 'Sarah K.', rate: 950, equipment: 'Dry Van' },
  { id: '9', ref: 'LD-4815', origin: 'Dallas, TX', dest: 'Houston, TX', status: 'pod_received', carrier: 'Lone Star Freight', driver: 'Rick J.', rate: 700, equipment: 'Dry Van' },
  { id: '10', ref: 'LD-4816', origin: 'Boston, MA', dest: 'New York, NY', status: 'exception', carrier: 'Northeast Express', driver: 'Paul D.', rate: 1400, equipment: 'Reefer' },
];

const statusConfig: Record<DispatchStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:     { label: 'Pending',     color: 'text-gray-400',            bg: 'bg-gray-500/10 border-gray-500/20',              icon: <Clock size={12} /> },
  assigned:    { label: 'Assigned',    color: 'text-blue-400',            bg: 'bg-blue-500/10 border-blue-500/20',              icon: <Users size={12} /> },
  dispatched:  { label: 'Dispatched',  color: 'text-infamous-orange',     bg: 'bg-infamous-orange/10 border-infamous-orange/20', icon: <Zap size={12} /> },
  at_pickup:   { label: 'At Pickup',   color: 'text-yellow-400',          bg: 'bg-yellow-500/10 border-yellow-500/20',          icon: <Package size={12} /> },
  loaded:      { label: 'Loaded',      color: 'text-cyan-400',            bg: 'bg-cyan-500/10 border-cyan-500/20',              icon: <Truck size={12} /> },
  in_transit:  { label: 'In Transit',  color: 'text-purple-400',          bg: 'bg-purple-500/10 border-purple-500/20',          icon: <ArrowRight size={12} /> },
  at_delivery: { label: 'At Delivery', color: 'text-indigo-400',          bg: 'bg-indigo-500/10 border-indigo-500/20',          icon: <MapPin size={12} /> },  delivered:   { label: 'Delivered',   color: 'text-green-400',           bg: 'bg-green-500/10 border-green-500/20',            icon: <CheckCircle size={12} /> },
  pod_received:{ label: 'POD Received',color: 'text-emerald-400',         bg: 'bg-emerald-500/10 border-emerald-500/20',        icon: <FileCheck size={12} /> },
  exception:   { label: 'Exception',   color: 'text-red-400',             bg: 'bg-red-500/10 border-red-500/20',                icon: <AlertTriangle size={12} /> },
};

const statusColumns: DispatchStatus[] = [
  'pending', 'assigned', 'dispatched', 'at_pickup', 'loaded',
  'in_transit', 'at_delivery', 'delivered', 'pod_received', 'exception',
];

interface CarrierCandidate {
  id: string;
  name: string;
  mc: string;
  authority: 'active' | 'pending' | 'revoked';
  insuranceOnFile: boolean;
  insuranceExpiresInDays: number;
  safetyScore: number; // 0-100, higher is better
  equipmentTypes: string[];
  homeBase: string;
  laneHistoryHits: number; // prior loads on or near this lane
  onTimePct: number; // 0-100
  claimsLast12Mo: number;
  acceptanceRate: number; // 0-100
  appResponsiveMin: number; // median app response time, lower is better
  preferredRpm: number;
}

const mockCarriers: CarrierCandidate[] = [
  { id: 'c1', name: 'Lone Star Freight',     mc: 'MC-812441', authority: 'active',  insuranceOnFile: true, insuranceExpiresInDays: 184, safetyScore: 96, equipmentTypes: ['Dry Van', 'Reefer'], homeBase: 'Dallas, TX',     laneHistoryHits: 14, onTimePct: 98, claimsLast12Mo: 0, acceptanceRate: 92, appResponsiveMin: 4,  preferredRpm: 2.40 },
  { id: 'c2', name: 'Midland Freight',       mc: 'MC-660921', authority: 'active',  insuranceOnFile: true, insuranceExpiresInDays: 92,  safetyScore: 91, equipmentTypes: ['Dry Van', 'Flatbed'],  homeBase: 'Memphis, TN',    laneHistoryHits: 6,  onTimePct: 94, claimsLast12Mo: 1, acceptanceRate: 88, appResponsiveMin: 7,  preferredRpm: 2.32 },
  { id: 'c3', name: 'Desert Haul Co.',       mc: 'MC-519883', authority: 'active',  insuranceOnFile: true, insuranceExpiresInDays: 41,  safetyScore: 88, equipmentTypes: ['Reefer', 'Dry Van'],   homeBase: 'Phoenix, AZ',    laneHistoryHits: 9,  onTimePct: 95, claimsLast12Mo: 0, acceptanceRate: 81, appResponsiveMin: 11, preferredRpm: 2.55 },
  { id: 'c4', name: 'Rocky Road Transport',  mc: 'MC-440117', authority: 'active',  insuranceOnFile: true, insuranceExpiresInDays: 230, safetyScore: 84, equipmentTypes: ['Dry Van'],             homeBase: 'Denver, CO',     laneHistoryHits: 3,  onTimePct: 90, claimsLast12Mo: 1, acceptanceRate: 76, appResponsiveMin: 9,  preferredRpm: 2.28 },
  { id: 'c5', name: 'Pacific Freight',       mc: 'MC-302188', authority: 'active',  insuranceOnFile: true, insuranceExpiresInDays: 121, safetyScore: 89, equipmentTypes: ['Dry Van', 'Reefer'],   homeBase: 'Seattle, WA',    laneHistoryHits: 5,  onTimePct: 93, claimsLast12Mo: 0, acceptanceRate: 84, appResponsiveMin: 6,  preferredRpm: 2.45 },
  { id: 'c6', name: 'Northeast Express',     mc: 'MC-712009', authority: 'active',  insuranceOnFile: true, insuranceExpiresInDays: 18,  safetyScore: 72, equipmentTypes: ['Reefer'],              homeBase: 'Boston, MA',     laneHistoryHits: 2,  onTimePct: 81, claimsLast12Mo: 3, acceptanceRate: 68, appResponsiveMin: 22, preferredRpm: 2.75 },
  { id: 'c7', name: 'Sunshine Carriers',     mc: 'MC-188640', authority: 'active',  insuranceOnFile: true, insuranceExpiresInDays: 167, safetyScore: 86, equipmentTypes: ['Dry Van'],             homeBase: 'Miami, FL',      laneHistoryHits: 4,  onTimePct: 92, claimsLast12Mo: 0, acceptanceRate: 79, appResponsiveMin: 8,  preferredRpm: 2.20 },
  { id: 'c8', name: 'Heartland Hotshot',     mc: 'MC-957742', authority: 'pending', insuranceOnFile: false,insuranceExpiresInDays: 0,   safetyScore: 64, equipmentTypes: ['Power Only', 'Hotshot'],homeBase: 'Tulsa, OK',     laneHistoryHits: 1,  onTimePct: 88, claimsLast12Mo: 0, acceptanceRate: 95, appResponsiveMin: 5,  preferredRpm: 2.10 },
];

interface CarrierScore {
  carrier: CarrierCandidate;
  total: number; // 0-100
  blocking: string[];
  strengths: string[];
  rate: number; // suggested carrier rate for this load
}

function rankCarriers(load: DispatchLoad, carriers: CarrierCandidate[]): CarrierScore[] {
  const originState = load.origin.split(',')[1]?.trim() ?? '';
  const destState = load.dest.split(',')[1]?.trim() ?? '';

  return carriers
    .map<CarrierScore>((carrier) => {
      const blocking: string[] = [];
      const strengths: string[] = [];

      if (carrier.authority !== 'active') blocking.push(`Authority ${carrier.authority}`);
      if (!carrier.insuranceOnFile) blocking.push('No COI on file');
      else if (carrier.insuranceExpiresInDays < 30) blocking.push(`COI expires in ${carrier.insuranceExpiresInDays}d`);
      if (!carrier.equipmentTypes.includes(load.equipment)) blocking.push(`No ${load.equipment} equipment`);

      // Component scores (each 0-100)
      const safety = carrier.safetyScore;
      const onTime = carrier.onTimePct;
      const claims = Math.max(0, 100 - carrier.claimsLast12Mo * 18);
      const acceptance = carrier.acceptanceRate;
      const responsiveness = Math.max(0, 100 - carrier.appResponsiveMin * 3);
      const homeState = carrier.homeBase.split(',')[1]?.trim();
      const lane = Math.min(100, carrier.laneHistoryHits * 12 + (homeState && (homeState === originState || homeState === destState) ? 30 : 0));

      // Weighted total — safety + insurance priority, then lane fit, then service quality.
      const total = Math.round(
        safety * 0.22 +
        onTime * 0.18 +
        lane * 0.18 +
        claims * 0.12 +
        acceptance * 0.12 +
        responsiveness * 0.10 +
        (carrier.insuranceOnFile ? 8 : 0),
      );

      if (carrier.safetyScore >= 90) strengths.push('Top-tier safety');
      if (carrier.onTimePct >= 95) strengths.push('On-time 95%+');
      if (carrier.claimsLast12Mo === 0) strengths.push('No claims');
      if (lane >= 60) strengths.push('Lane history');
      if (carrier.acceptanceRate >= 90) strengths.push('High acceptance');
      if (carrier.appResponsiveMin <= 5) strengths.push('Fast app responder');

      // Suggested rate uses carrier's preferred RPM as a floor; assume avg 600mi if unknown.
      const milesEstimate = 600;
      const rate = Math.round(carrier.preferredRpm * milesEstimate);

      return { carrier, total: blocking.length ? Math.min(total, 49) : total, blocking, strengths, rate };
    })
    .sort((a, b) => b.total - a.total);
}

interface CarrierMatchModalProps {
  load: DispatchLoad;
  onClose: () => void;
}

const CarrierMatchModal: React.FC<CarrierMatchModalProps> = ({ load, onClose }) => {
  const ranked = useMemo(() => rankCarriers(load, mockCarriers).slice(0, 6), [load]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="carrier-match-title"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-infamous-card border border-infamous-border rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-5 border-b border-infamous-border">
          <div className="w-10 h-10 rounded-xl bg-infamous-orange/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-infamous-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="carrier-match-title" className="text-base font-semibold">AI Carrier Match — {load.ref}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {load.origin} <ArrowRight size={10} className="inline mx-1" /> {load.dest} · {load.equipment} · ${load.rate.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-white p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-500">
            Ranked by safety, insurance, lane history, claims, acceptance, and app responsiveness. Carriers with blocking issues are still shown so dispatch sees why they were filtered.
          </p>
          {ranked.map((entry, index) => {
            const blocked = entry.blocking.length > 0;
            return (
              <div
                key={entry.carrier.id}
                className={`rounded-xl border p-4 ${blocked ? 'border-red-500/20 bg-red-500/5' : 'border-infamous-border bg-infamous-bg/50'}`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${index === 0 && !blocked ? 'bg-infamous-orange text-white' : 'bg-infamous-card text-gray-400 border border-infamous-border'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{entry.carrier.name}</span>
                      {entry.carrier.authority === 'active' && entry.carrier.insuranceOnFile ? (
                        <ShieldCheck size={14} className="text-green-400 flex-shrink-0" aria-label="Authority active, COI on file" />
                      ) : (
                        <Shield size={14} className="text-red-400 flex-shrink-0" aria-label="Authority or insurance issue" />
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {entry.carrier.mc} · {entry.carrier.homeBase} · {entry.carrier.equipmentTypes.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${blocked ? 'text-red-400' : 'text-infamous-orange'}`}>{entry.total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-600">match score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-gray-400"><Star size={11} /> Safety <span className="text-white font-medium ml-auto">{entry.carrier.safetyScore}</span></div>
                  <div className="flex items-center gap-1 text-gray-400"><CheckCircle size={11} /> On-time <span className="text-white font-medium ml-auto">{entry.carrier.onTimePct}%</span></div>
                  <div className="flex items-center gap-1 text-gray-400"><AlertTriangle size={11} /> Claims <span className="text-white font-medium ml-auto">{entry.carrier.claimsLast12Mo}</span></div>
                  <div className="flex items-center gap-1 text-gray-400"><Clock size={11} /> Resp <span className="text-white font-medium ml-auto">{entry.carrier.appResponsiveMin}m</span></div>
                </div>

                {entry.strengths.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {entry.strengths.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{s}</span>
                    ))}
                  </div>
                )}

                {blocked && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.blocking.map((b) => (
                      <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{b}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-infamous-border">
                  <div className="text-xs text-gray-500">
                    Suggested carrier rate <span className="text-white font-semibold">${entry.rate.toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    disabled={blocked}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${blocked ? 'bg-infamous-card text-gray-600 cursor-not-allowed' : 'bg-infamous-orange text-white hover:bg-infamous-orange-light'}`}
                  >
                    {blocked ? 'Blocked' : 'Send rate con'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DispatchBoardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'board' | 'voice'>('board');
  const [isListening, setIsListening] = useState(false);
  const [matchLoad, setMatchLoad] = useState<DispatchLoad | null>(null);

  const pendingCount = mockLoads.filter((l) => l.status === 'pending').length;

  const runAutoDispatch = () => {
    const firstPending = mockLoads.find((l) => l.status === 'pending');
    if (firstPending) setMatchLoad(firstPending);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dispatch Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full load lifecycle — from pending to POD received · sample data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-infamous-card border border-infamous-border rounded-xl px-3 py-2">
            <Activity size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">Demo data</span>
          </div>
          <div role="tablist" aria-label="Dispatch view" className="flex gap-2">
          <button
            role="tab"
            aria-selected={activeTab === 'board'}
            aria-controls="dispatch-panel"
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange ${activeTab === 'board' ? 'bg-infamous-orange text-white' : 'bg-infamous-card text-gray-400 hover:text-white'}`}
          >
            Board
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'voice'}
            aria-controls="dispatch-panel"
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange ${activeTab === 'voice' ? 'bg-infamous-orange text-white' : 'bg-infamous-card text-gray-400 hover:text-white'}`}
          >
            <Mic size={14} aria-hidden="true" /> Voice
          </button>
        </div>
        </div>
      </div>

      {/* AI Banner */}
      <div className="bg-gradient-to-r from-infamous-orange/10 to-purple-500/5 border border-infamous-orange/20 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-infamous-orange/20 flex items-center justify-center">
          <Sparkles size={20} className="text-infamous-orange" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Auto-Dispatch AI Ready</p>
          <p className="text-xs text-gray-400">{pendingCount} {pendingCount === 1 ? 'load needs' : 'loads need'} carriers. Auto-Dispatch will rank verified carriers in seconds.</p>
        </div>
        <button onClick={runAutoDispatch} className="btn-primary flex items-center gap-2">
          <Zap size={16} /> Run Auto-Dispatch
        </button>
      </div>

      {activeTab === 'board' ? (
        /* Kanban Board — full lifecycle */
        <div id="dispatch-panel" role="tabpanel" className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${statusColumns.length * 220}px` }}>
            {statusColumns.map((status) => {
              const colLoads = mockLoads.filter((l) => l.status === status);
              const cfg = statusConfig[status];
              return (
                <div key={status} className="w-52 flex-shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-3 ${cfg.bg}`}>
                    <span className={`${cfg.color}`}>{cfg.icon}</span>
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs text-gray-600 ml-auto">{colLoads.length}</span>
                  </div>
                  <div className="space-y-3">
                    {colLoads.map((load) => {
                      const isPending = load.status === 'pending';
                      const cardClass = `card p-3 hover:border-infamous-orange/30 transition-all text-left w-full ${status === 'exception' ? 'border-red-500/30' : ''} ${isPending ? 'cursor-pointer' : 'cursor-default'}`;
                      const cardContent = (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-gray-600">{load.ref}</span>
                            {isPending && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-infamous-orange/15 text-infamous-orange border border-infamous-orange/30 font-semibold uppercase tracking-wider">
                                Match
                              </span>
                            )}
                            <span className="text-[10px] text-gray-600 ml-auto">{load.equipment}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm mb-2">
                            <span className="font-medium truncate">{load.origin.split(',')[0]}</span>
                            <ArrowRight size={10} className="text-gray-600 flex-shrink-0" />
                            <span className="font-medium truncate">{load.dest.split(',')[0]}</span>
                          </div>
                          {load.carrier && (
                            <div className="text-xs text-gray-500 mb-1 truncate">{load.carrier}</div>
                          )}
                          {load.driver && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                              <Users size={10} />
                              <span className="truncate">{load.driver}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-infamous-border">
                            <span className="font-bold text-infamous-orange text-sm">${load.rate.toLocaleString()}</span>
                            {load.eta && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={10} /> {load.eta}
                              </span>
                            )}
                          </div>
                        </>
                      );
                      return isPending ? (
                        <button
                          key={load.id}
                          type="button"
                          onClick={() => setMatchLoad(load)}
                          aria-label={`Find AI carrier match for ${load.ref}`}
                          className={`${cardClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange`}
                        >
                          {cardContent}
                        </button>
                      ) : (
                        <div key={load.id} className={cardClass}>
                          {cardContent}
                        </div>
                      );
                    })}
                    {colLoads.length === 0 && (
                      <EmptyState title="No loads" description={`No loads in ${cfg.label} status`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Voice Booking */
        <div id="dispatch-panel" role="tabpanel" className="max-w-lg mx-auto text-center py-12">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
              isListening
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-br from-infamous-orange to-infamous-orange-light hover:scale-105 shadow-xl shadow-infamous-orange/20'
            }`}
          >
            <Mic size={32} className="text-white" />
          </button>
          <h2 className="text-xl font-semibold mb-2">
            {isListening ? 'Listening...' : 'Tap to Start Voice Booking'}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {isListening ? 'Say something like "Find me a reefer load near Dallas"' : 'Press and hold the microphone button, then speak your load request'}
          </p>

          {isListening && (
            <div className="flex items-center justify-center gap-1 h-8 mb-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-infamous-orange rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 24 + 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="text-left space-y-2 max-w-sm mx-auto">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Try saying:</p>
            {[
              '"Find me a dry van load from Chicago"',
              '"Book the highest paying reefer within 100 miles"',
              '"What backhauls are available near Dallas?"',
              '"Assign Marcus to load LD-4821"',
            ].map((example) => (
              <button
                key={example}
                onClick={() => setIsListening(true)}
                className="w-full text-left text-sm text-gray-400 hover:text-white bg-infamous-card border border-infamous-border hover:border-infamous-orange/30 rounded-lg px-4 py-2.5 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      {matchLoad && <CarrierMatchModal load={matchLoad} onClose={() => setMatchLoad(null)} />}
    </div>
  );
};

export default DispatchBoardPage;
