import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, AlertTriangle, Activity, ChevronRight, Package,
  MapPin, TrendingUp, Clock, Navigation, Phone,
  FileUp, CheckCircle2, Infinity, Search,
  FileText, MessageSquare, Send, Filter,
  AlertCircle, Bell, Plus, DollarSign,
} from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import { ShipmentRouteMap } from '@/components/ShipmentRouteMap';

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
  docStatus: { bol: boolean; pod: boolean; rateCon: boolean; invoice: boolean };
  margin: string;
}

const mockActiveLoads: ActiveLoad[] = [
  { ref: 'IF-77391', origin: 'Atlanta, GA', destination: 'Dallas, TX', carrier: 'Swift Logistics', status: 'in_transit', statusLabel: 'In Transit', eta: '6:30 PM', rate: '$3,200', equipment: 'Dry Van', weight: '38,000 lbs', miles: '781 mi', driver: 'Marcus Johnson', phone: '(404) 555-0192', pickupDate: 'May 9, 2026', deliveryDate: 'May 10, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$480' },
  { ref: 'IF-77392', origin: 'Chicago, IL', destination: 'Memphis, TN', carrier: 'Road Runner Inc.', status: 'at_pickup', statusLabel: 'At Pickup', eta: '4:00 PM', rate: '$1,850', equipment: 'Reefer', weight: '22,000 lbs', miles: '530 mi', driver: 'James Wright', phone: '(312) 555-0234', pickupDate: 'May 10, 2026', deliveryDate: 'May 11, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$310' },
  { ref: 'IF-77393', origin: 'Houston, TX', destination: 'Phoenix, AZ', carrier: 'Desert Haul Co.', status: 'exception', statusLabel: 'Delayed', eta: 'TBD', rate: '$4,100', equipment: 'Flatbed', weight: '44,000 lbs', miles: '1,178 mi', driver: 'Carlos Rivera', phone: '(713) 555-0187', pickupDate: 'May 8, 2026', deliveryDate: 'May 11, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$615' },
  { ref: 'IF-77394', origin: 'Los Angeles, CA', destination: 'Seattle, WA', carrier: 'Pacific Freight', status: 'in_transit', statusLabel: 'In Transit', eta: '11:00 PM', rate: '$2,900', equipment: 'Dry Van', weight: '32,000 lbs', miles: '1,135 mi', driver: 'Sarah Chen', phone: '(213) 555-0145', pickupDate: 'May 9, 2026', deliveryDate: 'May 11, 2026', docStatus: { bol: true, pod: false, rateCon: true, invoice: false }, margin: '$420' },
  { ref: 'IF-77395', origin: 'Miami, FL', destination: 'Atlanta, GA', carrier: 'Southeast Express', status: 'delivered', statusLabel: 'Delivered', eta: 'Complete', rate: '$1,450', equipment: 'Box Truck', weight: '12,000 lbs', miles: '662 mi', driver: 'David Moore', phone: '(305) 555-0198', pickupDate: 'May 8, 2026', deliveryDate: 'May 9, 2026', docStatus: { bol: true, pod: true, rateCon: true, invoice: true }, margin: '$225' },
  { ref: 'IF-77396', origin: 'Nashville, TN', destination: 'Indianapolis, IN', carrier: 'Midwest Haul', status: 'pickup_scheduled', statusLabel: 'Pickup Scheduled', eta: '2:00 PM', rate: '$1,200', equipment: 'Dry Van', weight: '18,000 lbs', miles: '290 mi', driver: 'Tony Patel', phone: '(615) 555-0173', pickupDate: 'May 10, 2026', deliveryDate: 'May 10, 2026', docStatus: { bol: false, pod: false, rateCon: true, invoice: false }, margin: '$180' },
];

const deliveryStatuses = [
  { label: 'In Transit', count: 87, color: 'bg-infamous-red-light', textColor: 'text-infamous-red-light' },
  { label: 'At Pickup', count: 14, color: 'bg-infamous-ember', textColor: 'text-infamous-ember' },
  { label: 'Delivered', count: 41, color: 'bg-infamous-green', textColor: 'text-infamous-green' },
  { label: 'Delayed', count: 8, color: 'bg-infamous-orange', textColor: 'text-infamous-orange' },
  { label: 'Pickup Scheduled', count: 12, color: 'bg-infamous-muted', textColor: 'text-infamous-muted' },
];

const statusBarColor: Record<string, string> = {
  in_transit: 'bg-infamous-red-light',
  at_pickup: 'bg-infamous-ember',
  dispatched: 'bg-infamous-orange',
  delivered: 'bg-infamous-green',
  exception: 'bg-infamous-orange',
  pickup_scheduled: 'bg-infamous-muted',
  carrier_assigned: 'bg-infamous-ember',
  booked: 'bg-infamous-red-light',
  pod_uploaded: 'bg-infamous-green',
  invoiced: 'bg-[#36D399]',
};

const statusBadgeClass: Record<string, string> = {
  in_transit: 'bg-infamous-red/15 text-infamous-red-light border border-infamous-red/25',
  at_pickup: 'bg-infamous-ember/15 text-infamous-ember border border-infamous-ember/25',
  dispatched: 'bg-infamous-orange/15 text-infamous-orange border border-infamous-orange/25',
  delivered: 'bg-infamous-green/15 text-infamous-green border border-infamous-green/25',
  exception: 'bg-infamous-orange/15 text-infamous-orange border border-infamous-orange/25',
  pickup_scheduled: 'bg-infamous-muted/15 text-infamous-muted border border-infamous-muted/25',
  carrier_assigned: 'bg-infamous-ember/15 text-infamous-ember border border-infamous-ember/25',
  booked: 'bg-infamous-red/15 text-infamous-red-light border border-infamous-red/25',
  pod_uploaded: 'bg-infamous-green/15 text-infamous-green border border-infamous-green/25',
  invoiced: 'bg-[#36D399]/15 text-[#36D399] border border-[#36D399]/25',
};

const alerts = [
  { id: 1, severity: 'critical' as const, message: 'IF-77393 delayed — ETA shift pending carrier update', time: '12 min ago' },
  { id: 2, severity: 'warning' as const, message: 'IF-77396 pickup appointment in 90 minutes — no driver check-in', time: '25 min ago' },
  { id: 3, severity: 'info' as const, message: 'IF-77395 POD uploaded — invoice ready for review', time: '1 hr ago' },
  { id: 4, severity: 'resolved' as const, message: 'IF-77391 ETA confirmed — on schedule for 6:30 PM delivery', time: '2 hr ago' },
];

const alertSeverityStyle: Record<string, string> = {
  critical: 'border-[#FF0033]/30 bg-[#FF0033]/8',
  warning: 'border-infamous-orange/30 bg-infamous-orange/8',
  info: 'border-infamous-red/20 bg-infamous-red/5',
  resolved: 'border-infamous-green/20 bg-infamous-green/5',
};

const alertSeverityIcon: Record<string, React.ReactNode> = {
  critical: <AlertCircle size={14} className="text-[#FF0033]" />,
  warning: <AlertTriangle size={14} className="text-infamous-orange" />,
  info: <Bell size={14} className="text-infamous-red-light" />,
  resolved: <CheckCircle2 size={14} className="text-infamous-green" />,
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLoad, setSelectedLoad] = useState<ActiveLoad>(mockActiveLoads[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertFilter, setAlertFilter] = useState<string>('all');

  const filteredLoads = mockActiveLoads.filter((load) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      load.ref.toLowerCase().includes(q) ||
      load.origin.toLowerCase().includes(q) ||
      load.destination.toLowerCase().includes(q) ||
      load.carrier.toLowerCase().includes(q) ||
      load.driver.toLowerCase().includes(q)
    );
  });

  const filteredAlerts = alerts.filter((a) => alertFilter === 'all' || a.severity === alertFilter);

  const metrics = [
    { label: 'Active Loads', value: '128', icon: <Truck size={18} />, color: 'text-infamous-red-light' },
    { label: 'In Transit', value: '87', icon: <Navigation size={18} />, color: 'text-infamous-red-light' },
    { label: 'Available Drivers', value: '34', icon: <Package size={18} />, color: 'text-infamous-green' },
    { label: 'On-Time Rate', value: '96.2%', icon: <TrendingUp size={18} />, color: 'text-infamous-green' },
    { label: 'Revenue MTD', value: '$2.4M', icon: <Activity size={18} />, color: 'text-infamous-red-light' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Quick Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-infamous-muted" />
          <input
            type="text"
            placeholder="Search loads, customers, cities, drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/request-quote')}
            className="btn-primary inline-flex items-center gap-2 text-sm glow-high"
          >
            <Plus size={16} /> Create Quote
          </button>
          <button
            onClick={() => navigate('/loads')}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <Truck size={16} /> All Loads
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <WidgetErrorBoundary label="Operations metrics">
        <div>
          <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-2">Sample data — connect your account for live metrics</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="relative overflow-hidden rounded-[16px] p-4 transition-all group"
              style={{
                background: 'rgba(36, 16, 19, 0.85)',
                border: '1px solid rgba(255, 59, 48, 0.15)',
                boxShadow: '0 0 12px rgba(255, 26, 26, 0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`${m.color} opacity-70`}>{m.icon}</span>
              </div>
              <p className="text-3xl font-black font-display tracking-tight">{m.value}</p>
              <p className="text-[11px] text-infamous-muted mt-1 uppercase tracking-wider font-medium">{m.label}</p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-infamous-red/30 to-transparent" />
            </div>
          ))}
        </div>
        </div>
      </WidgetErrorBoundary>

      {/* Map + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Shipment Tracking Map */}
        <WidgetErrorBoundary label="Shipment tracking">
          <div className="lg:col-span-2 rounded-[18px] overflow-hidden" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.15)', boxShadow: '0 0 12px rgba(255, 26, 26, 0.06)' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-infamous-border/60">
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-infamous-red-light" />
                <h2 className="text-sm font-bold uppercase tracking-wide font-display">Shipment Tracking</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-infamous-muted">sample data</span>
              </div>
            </div>
            <div className="h-[320px]">
              <ShipmentRouteMap origin="Atlanta, GA" destination="Dallas, TX" status="in_transit" />
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Alerts Panel */}
        <WidgetErrorBoundary label="Alerts">
          <div className="rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.15)', boxShadow: '0 0 12px rgba(255, 26, 26, 0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide font-display flex items-center gap-2">
                <AlertTriangle size={14} className="text-infamous-orange" /> Alerts
              </h2>
              <div className="flex items-center gap-1">
                {['all', 'critical', 'warning'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setAlertFilter(f)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider transition ${
                      alertFilter === f
                        ? 'bg-infamous-red/10 text-infamous-red-light border border-infamous-red/20'
                        : 'text-infamous-muted hover:text-[#F5E8E8]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl p-3 border ${alertSeverityStyle[alert.severity]} transition hover:brightness-110 cursor-pointer`}
                >
                  <div className="flex items-start gap-2.5">
                    {alertSeverityIcon[alert.severity]}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#F5E8E8]/85 leading-5">{alert.message}</p>
                      <p className="text-[10px] text-infamous-muted mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WidgetErrorBoundary>
      </div>

      {/* Active Loads + Load Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Loads */}
        <WidgetErrorBoundary label="Active loads">
          <div className="lg:col-span-2 rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.15)', boxShadow: '0 0 12px rgba(255, 26, 26, 0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide font-display">Active Loads</h2>
              <button onClick={() => navigate('/loads')} className="text-xs text-infamous-red-light hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </button>
            </div>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[auto_1fr_1fr_110px_80px_80px] gap-3 px-3 py-2.5 text-[11px] text-infamous-muted uppercase tracking-wider font-medium border-b border-infamous-border/60 mb-2">
              <span className="w-2" />
              <span>Load / Route</span>
              <span>Carrier</span>
              <span>Status</span>
              <span className="text-right">ETA</span>
              <span className="text-right">Rate</span>
            </div>

            <div className="space-y-1.5">
              {filteredLoads.map((load) => (
                <button
                  key={load.ref}
                  type="button"
                  onClick={() => setSelectedLoad(load)}
                  className={`w-full text-left md:grid md:grid-cols-[auto_1fr_1fr_110px_80px_80px] flex flex-col gap-1 md:gap-3 items-start md:items-center p-3 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red ${
                    selectedLoad.ref === load.ref
                      ? 'bg-infamous-red/8 border border-infamous-red/25 glow-low'
                      : 'border border-transparent hover:bg-infamous-panel hover:border-infamous-border/60'
                  }`}
                >
                  <div className={`w-1.5 h-8 rounded-full ${statusBarColor[load.status] ?? 'bg-gray-400'} hidden md:block`} />
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-infamous-muted">{load.ref}</span>
                    <p className="text-[15px] font-medium text-[#F5E8E8] truncate">{load.origin} → {load.destination}</p>
                  </div>
                  <span className="text-xs text-infamous-muted truncate">{load.carrier}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeClass[load.status] ?? ''}`}>
                    {load.statusLabel}
                  </span>
                  <span className="text-xs text-infamous-muted text-right">{load.eta}</span>
                  <span className="text-[15px] font-bold text-right">{load.rate}</span>
                </button>
              ))}
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Load Details Panel */}
        <WidgetErrorBoundary label="Load details">
          <div className="rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.15)', boxShadow: '0 0 12px rgba(255, 26, 26, 0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide font-display">Load Details</h2>
              <span className="text-xs font-mono text-infamous-red-light">{selectedLoad.ref}</span>
            </div>

            <div className="space-y-3">
              {/* Route */}
              <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-1">Route</p>
                <p className="text-[15px] font-medium">{selectedLoad.origin}</p>
                <div className="flex items-center gap-2 my-1.5">
                  <div className="flex-1 h-px bg-infamous-border/60" />
                  <Truck size={12} className="text-infamous-red-light" />
                  <div className="flex-1 h-px bg-infamous-border/60" />
                </div>
                <p className="text-[15px] font-medium">{selectedLoad.destination}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Equipment</p>
                  <p className="text-sm font-medium mt-1">{selectedLoad.equipment}</p>
                </div>
                <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Weight</p>
                  <p className="text-sm font-medium mt-1">{selectedLoad.weight}</p>
                </div>
                <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Rate</p>
                  <p className="text-sm font-bold text-infamous-red-light mt-1">{selectedLoad.rate}</p>
                </div>
                <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                  <p className="text-[10px] text-infamous-muted uppercase tracking-wider">Margin</p>
                  <p className="text-sm font-bold text-infamous-green mt-1">{selectedLoad.margin}</p>
                </div>
              </div>

              {/* Driver */}
              <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-1">Driver</p>
                <p className="text-sm font-medium">{selectedLoad.driver}</p>
                <p className="text-xs text-infamous-muted">{selectedLoad.carrier}</p>
              </div>

              {/* Documents Status */}
              <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-2">Documents</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'BOL', done: selectedLoad.docStatus.bol },
                    { label: 'Rate Con', done: selectedLoad.docStatus.rateCon },
                    { label: 'POD', done: selectedLoad.docStatus.pod },
                    { label: 'Invoice', done: selectedLoad.docStatus.invoice },
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center gap-1.5 text-xs">
                      {doc.done ? (
                        <CheckCircle2 size={12} className="text-infamous-green" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-infamous-muted/40" />
                      )}
                      <span className={doc.done ? 'text-[#F5E8E8]/80' : 'text-infamous-muted'}>{doc.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup / Delivery */}
              <div className="rounded-xl bg-infamous-panel border border-infamous-border/60 p-3">
                <p className="text-[10px] text-infamous-muted uppercase tracking-wider mb-2">Pickup / Delivery</p>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-infamous-muted">Pickup</p>
                    <p className="text-[#F5E8E8] font-medium">{selectedLoad.pickupDate}</p>
                  </div>
                  <ChevronRight size={12} className="text-infamous-muted" />
                  <div className="text-right">
                    <p className="text-infamous-muted">Delivery</p>
                    <p className="text-[#F5E8E8] font-medium">{selectedLoad.deliveryDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all bg-infamous-red/8 border border-infamous-red/20 text-infamous-red-light hover:bg-infamous-red/15">
                <MessageSquare size={13} /> Message Customer
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all bg-infamous-red/8 border border-infamous-red/20 text-infamous-red-light hover:bg-infamous-red/15">
                <Phone size={13} /> Call Carrier
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all bg-infamous-red/8 border border-infamous-red/20 text-infamous-red-light hover:bg-infamous-red/15">
                <Send size={13} /> Send ETA Update
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all bg-infamous-red/8 border border-infamous-red/20 text-infamous-red-light hover:bg-infamous-red/15">
                <FileUp size={13} /> Upload Document
              </button>
            </div>

            {/* Document Actions */}
            <div className="mt-3 space-y-1.5">
              {[
                { label: 'Upload BOL', icon: <FileText size={13} /> },
                { label: 'Upload POD', icon: <FileUp size={13} /> },
                { label: 'View Rate Confirmation', icon: <DollarSign size={13} /> },
                { label: 'Download Invoice', icon: <FileText size={13} /> },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-medium transition-all border border-infamous-border/40 text-infamous-muted hover:text-[#F5E8E8] hover:border-infamous-red/20 hover:bg-infamous-red/5"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </WidgetErrorBoundary>
      </div>

      {/* Delivery Status + Dispatch Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Delivery Status */}
        <WidgetErrorBoundary label="Delivery status">
          <div className="rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.15)', boxShadow: '0 0 12px rgba(255, 26, 26, 0.06)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide font-display mb-5">Delivery Status</h2>
            <div className="space-y-4">
              {deliveryStatuses.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-sm text-[#F5E8E8]/80 flex-1">{s.label}</span>
                  <span className={`text-lg font-bold font-display ${s.textColor}`}>{s.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-infamous-border/60">
              <div className="flex items-center justify-between text-xs text-infamous-muted mb-2">
                <span>Overall Progress</span>
                <span className="text-infamous-red-light font-bold">162 / 128 target</span>
              </div>
              <div className="w-full h-2 rounded-full bg-infamous-panel overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-infamous-red to-infamous-red-light glow-medium" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Dispatch Quick Actions */}
        <WidgetErrorBoundary label="Dispatch controls">
          <div className="lg:col-span-2 rounded-[18px] p-5" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.15)', boxShadow: '0 0 12px rgba(255, 26, 26, 0.06)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide font-display mb-5">Dispatch Controls</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Create Quote', icon: <Plus size={20} />, action: () => navigate('/request-quote'), primary: true },
                { label: 'Dispatch Board', icon: <Filter size={20} />, action: () => navigate('/dispatch'), primary: false },
                { label: 'Assign Carrier', icon: <Truck size={20} />, action: () => navigate('/carriers'), primary: false },
                { label: 'View Quotes', icon: <FileText size={20} />, action: () => navigate('/quotes'), primary: false },
              ].map((ctrl) => (
                <button
                  key={ctrl.label}
                  onClick={ctrl.action}
                  className={`flex flex-col items-center gap-2.5 p-5 rounded-xl transition-all ${
                    ctrl.primary
                      ? 'bg-gradient-to-br from-infamous-red/15 to-infamous-red-dark/15 border border-infamous-red/30 text-infamous-red-light hover:from-infamous-red/25 hover:to-infamous-red-dark/25 glow-low'
                      : 'border border-infamous-border/60 text-infamous-muted hover:text-[#F5E8E8] hover:border-infamous-red/20 hover:bg-infamous-red/5'
                  }`}
                >
                  {ctrl.icon}
                  <span className="text-xs font-semibold">{ctrl.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/dispatch')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-infamous-red-light border border-infamous-red/20 bg-infamous-red/5 hover:bg-infamous-red/10 transition-all"
              >
                View Full Dispatch Board <ChevronRight size={14} />
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-infamous-muted border border-infamous-border/60 hover:text-[#F5E8E8] hover:border-infamous-red/20 transition-all"
              >
                <TrendingUp size={14} /> View Analytics
              </button>
            </div>
          </div>
        </WidgetErrorBoundary>
      </div>

      {/* Bottom Brand */}
      <div className="rounded-[18px] overflow-hidden" style={{ background: 'rgba(36, 16, 19, 0.85)', border: '1px solid rgba(255, 59, 48, 0.12)', boxShadow: '0 0 8px rgba(255, 26, 26, 0.04)' }}>
        <div className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Infinity size={36} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 12px rgba(255, 59, 48, 0.8))' }} />
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight">
            <span className="text-infamous-red-light text-glow">Infamous</span>{' '}
            <span className="text-[#F5E8E8]">Freight</span>
          </h2>
          <p className="mt-2 font-display text-base font-bold uppercase tracking-[0.25em] text-infamous-muted">
            We Move. You Win.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
