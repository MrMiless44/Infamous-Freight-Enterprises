import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, AlertTriangle, Activity, ChevronRight, Package,
  MapPin, TrendingUp, Clock, Navigation, Phone,
  FileUp, CheckCircle2, Circle, Infinity, Smartphone,
} from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import { ShipmentRouteMap } from '@/components/ShipmentRouteMap';
import api from '@/api-client/client';

interface ActiveLoad {
  ref: string;
  origin: string;
  destination: string;
  carrier: string;
  status: string;
  statusLabel: string;
  eta: string;
  rate: string;
  equipment: string;
  weight: string;
  miles: string;
  driver: string;
  phone: string;
  pickupDate: string;
  deliveryDate: string;
}

const statusLabelMap: Record<string, string> = {
  in_transit: 'In Transit',
  at_pickup: 'At Pickup',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  exception: 'Delayed',
  pending: 'Pending',
};

const statusColorMap: Record<string, { color: string; textColor: string }> = {
  in_transit: { color: 'bg-infamous-red-light', textColor: 'text-infamous-red-light' },
  at_pickup: { color: 'bg-infamous-ember', textColor: 'text-infamous-ember' },
  delivered: { color: 'bg-infamous-green', textColor: 'text-infamous-green' },
  exception: { color: 'bg-infamous-orange', textColor: 'text-infamous-orange' },
  pending: { color: 'bg-infamous-muted', textColor: 'text-infamous-muted' },
  dispatched: { color: 'bg-infamous-orange', textColor: 'text-infamous-orange' },
};

function formatRate(cents: number): string {
  return '$' + cents.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatWeight(lbs: number): string {
  return lbs.toLocaleString('en-US') + ' lbs';
}

function formatMiles(mi: number): string {
  return mi.toLocaleString('en-US') + ' mi';
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatEta(iso: string, status: string): string {
  if (status === 'delivered') return 'Done';
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const statusBarColor: Record<string, string> = {
  in_transit: 'bg-infamous-red-light',
  at_pickup: 'bg-infamous-ember',
  dispatched: 'bg-infamous-orange',
  delivered: 'bg-infamous-green',
  exception: 'bg-infamous-orange',
  pending: 'bg-infamous-muted',
};

const statusBadgeClass: Record<string, string> = {
  in_transit: 'bg-infamous-red/15 text-infamous-red-light border border-infamous-red/25',
  at_pickup: 'bg-infamous-ember/15 text-infamous-ember border border-infamous-ember/25',
  dispatched: 'bg-infamous-orange/15 text-infamous-orange border border-infamous-orange/25',
  delivered: 'bg-infamous-green/15 text-infamous-green border border-infamous-green/25',
  exception: 'bg-infamous-orange/15 text-infamous-orange border border-infamous-orange/25',
  pending: 'bg-infamous-muted/15 text-infamous-muted border border-infamous-muted/25',
};

const driverAppStages = [
  'Accept Load',
  'Arrived at Pickup',
  'Mark Picked Up',
  'In Transit',
  'Arrived at Delivery',
  'Upload POD',
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loads, setLoads] = useState<ActiveLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoad, setSelectedLoad] = useState<ActiveLoad | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getLoads()
      .then((res) => {
        if (cancelled) return;
        const mapped: ActiveLoad[] = (res.loads || []).map((l: Record<string, unknown>) => ({
          ref: (l.trackingNumber as string) || '—',
          origin: (l.origin as string) || '—',
          destination: (l.destination as string) || '—',
          carrier: (l.shipperName as string) || '—',
          status: (l.status as string) || 'pending',
          statusLabel: statusLabelMap[(l.status as string)] || (l.status as string) || 'Pending',
          eta: formatEta((l.deliveryAt as string) || '', (l.status as string) || ''),
          rate: formatRate((l.rate as number) || 0),
          equipment: (l.equipment as string) || '—',
          weight: formatWeight((l.weightLbs as number) || 0),
          miles: formatMiles((l.miles as number) || 0),
          driver: '—',
          phone: '—',
          pickupDate: formatDate((l.pickupAt as string) || ''),
          deliveryDate: formatDate((l.deliveryAt as string) || ''),
        }));
        setLoads(mapped);
        setSelectedLoad(mapped[0] || null);
      })
      .catch(() => {
        if (cancelled) return;
        setLoads([]);
        setSelectedLoad(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const inTransitCount = loads.filter((l) => l.status === 'in_transit').length;
  const atPickupCount = loads.filter((l) => l.status === 'at_pickup').length;
  const deliveredCount = loads.filter((l) => l.status === 'delivered').length;
  const delayedCount = loads.filter((l) => l.status === 'exception').length;
  const pendingCount = loads.filter((l) => l.status === 'pending' || l.status === 'dispatched').length;
  const totalLoads = loads.length;
  const totalRevenue = loads.reduce((sum, l) => sum + Number(l.rate.replace(/[^0-9.]/g, '')), 0);
  const onTimeCount = loads.filter((l) => l.status !== 'exception').length;
  const onTimeRate = totalLoads > 0 ? ((onTimeCount / totalLoads) * 100).toFixed(1) + '%' : '0%';

  const deliveryStatuses = [
    { label: 'In Transit', count: inTransitCount, color: 'bg-infamous-red-light', textColor: 'text-infamous-red-light' },
    { label: 'At Pickup', count: atPickupCount, color: 'bg-infamous-ember', textColor: 'text-infamous-ember' },
    { label: 'Delivered', count: deliveredCount, color: 'bg-infamous-green', textColor: 'text-infamous-green' },
    { label: 'Delayed', count: delayedCount, color: 'bg-infamous-orange', textColor: 'text-infamous-orange' },
    { label: 'Pending', count: pendingCount, color: 'bg-infamous-muted', textColor: 'text-infamous-muted' },
  ];

  const metrics = [
    { label: 'Active Loads', value: String(totalLoads), icon: <Truck size={18} />, color: 'text-infamous-red-light' },
    { label: 'In Transit', value: String(inTransitCount), icon: <Navigation size={18} />, color: 'text-infamous-red-light' },
    { label: 'Available Drivers', value: '—', icon: <Package size={18} />, color: 'text-infamous-green' },
    { label: 'On-Time Rate', value: onTimeRate, icon: <TrendingUp size={18} />, color: 'text-infamous-green' },
    { label: 'Revenue MTD', value: totalRevenue >= 1_000_000 ? '$' + (totalRevenue / 1_000_000).toFixed(1) + 'M' : '$' + totalRevenue.toLocaleString('en-US'), icon: <Activity size={18} />, color: 'text-infamous-red-light' },
  ];

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[16px] p-4"
              style={{
                background: 'rgba(36, 16, 19, 0.85)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
              }}
            >
              <div className="h-4 w-8 rounded bg-infamous-panel animate-pulse mb-2" />
              <div className="h-8 w-16 rounded bg-infamous-panel animate-pulse" />
              <div className="h-3 w-20 rounded bg-infamous-panel animate-pulse mt-2" />
            </div>
          ))}
        </div>
        <div className="text-center text-infamous-muted py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Metric Cards Row */}
      <WidgetErrorBoundary label="Operations metrics">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="relative overflow-hidden rounded-[16px] p-4 transition-all group"
              style={{
                background: 'rgba(36, 16, 19, 0.85)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                boxShadow: '0 0 20px rgba(255, 26, 26, 0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`${m.color} opacity-70`}>{m.icon}</span>
              </div>
              <p className="text-3xl font-black font-display tracking-tight" style={{ textShadow: '0 0 20px rgba(255, 26, 26, 0.3)' }}>{m.value}</p>
              <p className="text-[11px] text-infamous-muted mt-1 uppercase tracking-wider font-medium">{m.label}</p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-infamous-red/40 to-transparent" />
            </div>
          ))}
        </div>
      </WidgetErrorBoundary>

      {/* Map + Delivery Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Shipment Tracking Map */}
        <WidgetErrorBoundary label="Shipment tracking">
          <div className="lg:col-span-2 rounded-[18px] overflow-hidden" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.2)', boxShadow: '0 0 25px rgba(255, 26, 26, 0.1)' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-infamous-border">
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-infamous-red-light" />
                <h2 className="text-sm font-bold uppercase tracking-wide font-display">Shipment Tracking</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-infamous-red-light animate-pulse" />
                <span className="text-[10px] text-infamous-muted">{totalLoads} active routes</span>
              </div>
            </div>
            <div className="h-[320px]">
              <ShipmentRouteMap origin={selectedLoad?.origin || 'Atlanta, GA'} destination={selectedLoad?.destination || 'Dallas, TX'} status={selectedLoad?.status || 'in_transit'} />
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Delivery Status */}
        <WidgetErrorBoundary label="Delivery status">
          <div className="rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.2)', boxShadow: '0 0 25px rgba(255, 26, 26, 0.1)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide font-display mb-5">Delivery Status</h2>
            <div className="space-y-4">
              {deliveryStatuses.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} style={{ boxShadow: `0 0 8px currentColor` }} />
                  <span className="text-sm text-[#F5E8E8]/80 flex-1">{s.label}</span>
                  <span className={`text-lg font-bold font-display ${s.textColor}`}>{s.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-infamous-border">
              <div className="flex items-center justify-between text-xs text-infamous-muted mb-2">
                <span>Overall Progress</span>
                <span className="text-infamous-red-light font-bold">{deliveredCount + inTransitCount} / {totalLoads} target</span>
              </div>
              <div className="w-full h-2 rounded-full bg-infamous-panel overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-infamous-red to-infamous-red-light" style={{ width: totalLoads > 0 ? `${Math.min(100, Math.round(((deliveredCount + inTransitCount) / totalLoads) * 100))}%` : '0%', boxShadow: '0 0 10px rgba(255, 26, 26, 0.5)' }} />
              </div>
            </div>
            <button
              onClick={() => navigate('/dispatch')}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-infamous-red-light border border-infamous-red/20 bg-infamous-red/5 hover:bg-infamous-red/10 transition-all"
            >
              View Dispatch Board <ChevronRight size={14} />
            </button>
          </div>
        </WidgetErrorBoundary>
      </div>

      {/* Active Loads + Load Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Loads */}
        <WidgetErrorBoundary label="Active loads">
          <div className="lg:col-span-2 rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.2)', boxShadow: '0 0 25px rgba(255, 26, 26, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide font-display">Active Loads</h2>
              <button onClick={() => navigate('/loads')} className="text-xs text-infamous-red-light hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </button>
            </div>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[auto_1fr_1fr_100px_80px_80px] gap-3 px-3 py-2 text-[10px] text-infamous-muted uppercase tracking-wider font-medium border-b border-infamous-border mb-2">
              <span className="w-2" />
              <span>Load / Route</span>
              <span>Carrier</span>
              <span>Status</span>
              <span className="text-right">ETA</span>
              <span className="text-right">Rate</span>
            </div>

            <div className="space-y-1.5">
              {loads.length === 0 ? (
                <div className="text-center text-infamous-muted py-8">No loads</div>
              ) : loads.map((load) => (
                <button
                  key={load.ref}
                  type="button"
                  onClick={() => setSelectedLoad(load)}
                  className={`w-full text-left md:grid md:grid-cols-[auto_1fr_1fr_100px_80px_80px] flex flex-col gap-1 md:gap-3 items-start md:items-center p-3 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red ${
                    selectedLoad?.ref === load.ref
                      ? 'bg-infamous-red/8 border border-infamous-red/25'
                      : 'border border-transparent hover:bg-infamous-panel hover:border-infamous-border'
                  }`}
                >
                  <div className={`w-1.5 h-8 rounded-full ${statusBarColor[load.status] ?? 'bg-gray-400'} hidden md:block`} />
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-infamous-muted">{load.ref}</span>
                    <p className="text-sm font-medium text-[#F5E8E8] truncate">{load.origin} → {load.destination}</p>
                  </div>
                  <span className="text-xs text-infamous-muted truncate">{load.carrier}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeClass[load.status] ?? ''}`}>
                    {load.statusLabel}
                  </span>
                  <span className="text-xs text-infamous-muted text-right">{load.eta}</span>
                  <span className="text-sm font-bold text-right">{load.rate}</span>
                </button>
              ))}
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Load Details Panel */}
        <WidgetErrorBoundary label="Load details">
          <div className="rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.2)', boxShadow: '0 0 25px rgba(255, 26, 26, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide font-display">Load Details</h2>
              <span className="text-xs font-mono text-infamous-red-light">{selectedLoad?.ref || '—'}</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-infamous-panel border border-infamous-border p-3">
                <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-1">Route</p>
                <p className="text-sm font-medium">{selectedLoad?.origin || '—'}</p>
                <div className="flex items-center gap-2 my-1.5">
                  <div className="flex-1 h-px bg-infamous-border" />
                  <Truck size={12} className="text-infamous-red-light" />
                  <div className="flex-1 h-px bg-infamous-border" />
                </div>
                <p className="text-sm font-medium">{selectedLoad?.destination || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-infamous-panel border border-infamous-border p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Equipment</p>
                  <p className="text-sm font-medium mt-1">{selectedLoad?.equipment || '—'}</p>
                </div>
                <div className="rounded-xl bg-infamous-panel border border-infamous-border p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Weight</p>
                  <p className="text-sm font-medium mt-1">{selectedLoad?.weight || '—'}</p>
                </div>
                <div className="rounded-xl bg-infamous-panel border border-infamous-border p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Miles</p>
                  <p className="text-sm font-medium mt-1">{selectedLoad?.miles || '—'}</p>
                </div>
                <div className="rounded-xl bg-infamous-panel border border-infamous-border p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Rate</p>
                  <p className="text-sm font-bold text-infamous-red-light mt-1">{selectedLoad?.rate || '—'}</p>
                </div>
              </div>

              <div className="rounded-xl bg-infamous-panel border border-infamous-border p-3">
                <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-1">Driver</p>
                <p className="text-sm font-medium">{selectedLoad?.driver || '—'}</p>
                <p className="text-xs text-infamous-muted">{selectedLoad?.carrier || '—'}</p>
              </div>

              <div className="rounded-xl bg-infamous-panel border border-infamous-border p-3">
                <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-2">Pickup / Delivery</p>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-infamous-muted">Pickup</p>
                    <p className="text-[#F5E8E8] font-medium">{selectedLoad?.pickupDate || '—'}</p>
                  </div>
                  <ChevronRight size={12} className="text-infamous-muted" />
                  <div className="text-right">
                    <p className="text-infamous-muted">Delivery</p>
                    <p className="text-[#F5E8E8] font-medium">{selectedLoad?.deliveryDate || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {[
                { label: 'Accept Load', icon: <CheckCircle2 size={14} /> },
                { label: 'Arrived at Pickup', icon: <MapPin size={14} /> },
                { label: 'Mark Delivered', icon: <Truck size={14} /> },
                { label: 'Upload POD', icon: <FileUp size={14} /> },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-infamous-red/15 to-infamous-red-dark/15 border border-infamous-red/25 text-infamous-red-light hover:from-infamous-red/25 hover:to-infamous-red-dark/25 hover:shadow-[0_0_15px_rgba(255,26,26,0.2)]"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </WidgetErrorBoundary>
      </div>

      {/* Mobile App Preview + Bottom Brand */}
      <div className="rounded-[18px] overflow-hidden" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.2)', boxShadow: '0 0 25px rgba(255, 26, 26, 0.1)' }}>
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Driver App Preview - Phone Mockup */}
            <div className="flex justify-center gap-6">
              {/* Phone 1 - Load Overview */}
              <div className="w-[160px] rounded-[20px] overflow-hidden border-2 border-infamous-red/30 shadow-[0_0_30px_rgba(255,26,26,0.2)]" style={{ background: '#0d0305' }}>
                <div className="p-2">
                  <div className="flex items-center gap-1.5 mb-3 px-1">
                    <Infinity size={12} className="text-infamous-red-light" />
                    <span className="text-[8px] font-bold text-infamous-red-light font-display">INFAMOUS</span>
                  </div>
                  <div className="rounded-lg p-2 mb-2" style={{ background: 'rgba(36, 16, 19, 0.9)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                    <p className="text-[7px] text-infamous-muted uppercase mb-1">Current Load</p>
                    <p className="text-[9px] font-bold text-[#F5E8E8]">IF-77391</p>
                    <p className="text-[7px] text-infamous-muted">Atlanta → Dallas</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <Circle size={5} className="text-infamous-red-light fill-infamous-red-light" />
                      <span className="text-[7px] text-infamous-red-light font-medium">In Transit</span>
                    </div>
                  </div>
                  {driverAppStages.slice(0, 4).map((stage, i) => (
                    <div key={stage} className={`flex items-center gap-1.5 py-1 px-1 rounded text-[7px] ${i === 3 ? 'text-infamous-red-light bg-infamous-red/10' : 'text-infamous-muted'}`}>
                      <div className={`w-1 h-1 rounded-full ${i <= 3 ? 'bg-infamous-red-light' : 'bg-infamous-muted/40'}`} />
                      {stage}
                    </div>
                  ))}
                  <div className="mt-2 py-1.5 rounded-lg text-center text-[8px] font-bold text-[#F5E8E8] bg-gradient-to-r from-infamous-red to-infamous-red-dark" style={{ boxShadow: '0 0 12px rgba(255, 26, 26, 0.4)' }}>
                    Update Status
                  </div>
                </div>
              </div>

              {/* Phone 2 - Action Screen */}
              <div className="w-[160px] rounded-[20px] overflow-hidden border-2 border-infamous-red/30 shadow-[0_0_30px_rgba(255,26,26,0.2)] hidden sm:block" style={{ background: '#0d0305' }}>
                <div className="p-2">
                  <div className="flex items-center gap-1.5 mb-3 px-1">
                    <Infinity size={12} className="text-infamous-red-light" />
                    <span className="text-[8px] font-bold text-infamous-red-light font-display">DRIVER</span>
                  </div>
                  <div className="rounded-lg p-2 mb-2" style={{ background: 'rgba(36, 16, 19, 0.9)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                    <p className="text-[7px] text-infamous-muted uppercase mb-1">Delivery</p>
                    <p className="text-[9px] font-bold text-[#F5E8E8]">Dallas, TX</p>
                    <p className="text-[7px] text-infamous-muted">ETA 6:30 PM</p>
                  </div>
                  {[
                    { icon: <Navigation size={8} />, label: 'Navigate' },
                    { icon: <Phone size={8} />, label: 'Call Dispatch' },
                    { icon: <FileUp size={8} />, label: 'Upload POD' },
                  ].map((a) => (
                    <div key={a.label} className="flex items-center gap-1.5 py-1.5 px-2 mb-1 rounded-lg text-[8px] text-infamous-muted border border-infamous-border/50" style={{ background: 'rgba(36, 16, 19, 0.5)' }}>
                      <span className="text-infamous-red-light">{a.icon}</span>
                      {a.label}
                    </div>
                  ))}
                  <div className="mt-2 py-1.5 rounded-lg text-center text-[8px] font-bold text-[#F5E8E8] bg-gradient-to-r from-infamous-red to-infamous-red-dark" style={{ boxShadow: '0 0 12px rgba(255, 26, 26, 0.4)' }}>
                    Upload POD
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Footer */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <Infinity size={40} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 12px rgba(255, 59, 48, 0.8))' }} />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-black uppercase tracking-tight">
                <span className="text-infamous-red-light" style={{ textShadow: '0 0 20px rgba(255, 59, 48, 0.5)' }}>Infamous</span>{' '}
                <span className="text-[#F5E8E8]">Freight</span>
              </h2>
              <p className="mt-2 font-display text-lg font-bold uppercase tracking-[0.25em] text-infamous-muted">
                We Move. You Win.
              </p>
              <p className="mt-4 text-sm text-infamous-muted max-w-md">
                Real-time freight command center. Quote, book, track, deliver — all from one platform.
              </p>
              <button
                onClick={() => navigate('/request-quote')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-infamous-red to-infamous-red-dark px-6 py-3 text-sm font-bold text-[#F5E8E8] border border-infamous-red-light/40 transition hover:shadow-[0_0_28px_rgba(255,26,26,0.6)]"
                style={{ boxShadow: '0 0 18px rgba(255, 26, 26, 0.45)' }}
              >
                Get a Quote <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
