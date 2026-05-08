import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, DollarSign, AlertTriangle, Activity,
  ChevronRight, FileText, ShieldAlert, Package, ClipboardList,
  FileX, Ban, ArrowDownToLine, ArrowUpFromLine, MapPin, Wallet,
  TrendingUp, Receipt, Banknote
} from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';

interface OpsMetric {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  path: string;
  urgent?: boolean;
}

interface ActiveLoad {
  ref: string;
  route: string;
  carrier: string;
  status: string;
  eta: string;
  rate: string;
  hasException?: boolean;
  missingPod?: boolean;
}

const mockActiveLoads: ActiveLoad[] = [
  { ref: 'LD-4821', route: 'Chicago, IL → Dallas, TX', carrier: 'Swift Logistics', status: 'in_transit', eta: '6:30 PM', rate: '$3,200' },
  { ref: 'LD-4822', route: 'Atlanta, GA → Charlotte, NC', carrier: 'Road Runner Inc.', status: 'at_pickup', eta: '4:00 PM', rate: '$1,850' },
  { ref: 'LD-4823', route: 'Houston, TX → Phoenix, AZ', carrier: 'Desert Haul Co.', status: 'exception', eta: 'Delayed', rate: '$4,100', hasException: true },
  { ref: 'LD-4819', route: 'Memphis, TN → Indianapolis, IN', carrier: 'Midland Freight', status: 'delivered', eta: 'Done', rate: '$2,400', missingPod: true },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeLoadFilter, setActiveLoadFilter] = useState<'all' | 'exceptions' | 'missing_pod'>('all');

  const opsMetrics: OpsMetric[] = [
    { label: 'Open Quotes', value: 7, icon: <ClipboardList size={20} />, color: 'text-blue-400', badgeColor: 'badge-blue', path: '/quotes' },
    { label: 'Active Loads', value: 12, icon: <Truck size={20} />, color: 'text-infamous-orange', badgeColor: 'badge-orange', path: '/dispatch' },
    { label: 'Exceptions', value: 2, icon: <AlertTriangle size={20} />, color: 'text-red-400', badgeColor: 'badge-red', path: '/dispatch', urgent: true },
    { label: 'Missing PODs', value: 3, icon: <FileX size={20} />, color: 'text-yellow-400', badgeColor: 'badge-yellow', path: '/dispatch', urgent: true },
    { label: 'Overdue Invoices', value: 4, icon: <DollarSign size={20} />, color: 'text-red-400', badgeColor: 'badge-red', path: '/accounting', urgent: true },
    { label: 'Blocked Compliance', value: 1, icon: <Ban size={20} />, color: 'text-red-400', badgeColor: 'badge-red', path: '/compliance', urgent: true },
  ];

  const filteredLoads = activeLoadFilter === 'exceptions'
    ? mockActiveLoads.filter((l) => l.hasException)
    : activeLoadFilter === 'missing_pod'
    ? mockActiveLoads.filter((l) => l.missingPod)
    : mockActiveLoads;

  const statusStyle: Record<string, string> = {
    in_transit: 'badge-blue',
    at_pickup: 'badge-yellow',
    dispatched: 'badge-orange',
    delivered: 'badge-green',
    exception: 'badge-red',
    pending: 'text-gray-400',
  };

  const urgentCount = opsMetrics.filter((m) => m.urgent && m.value > 0).reduce((s, m) => s + m.value, 0);

  // Today's pickup/delivery flow + unassigned and at-risk counts give dispatch
  // a one-glance read on what the next 24 hours actually look like.
  const todaysFlow = [
    { label: "Today's pickups",    value: 6,  icon: <ArrowUpFromLine size={18} />, color: 'text-cyan-400',          path: '/dispatch' },
    { label: "Today's deliveries", value: 5,  icon: <ArrowDownToLine size={18} />, color: 'text-green-400',         path: '/dispatch' },
    { label: 'Unassigned loads',   value: 3,  icon: <MapPin size={18} />,          color: 'text-infamous-orange',   path: '/dispatch' },
    { label: 'Loads at risk',      value: 2,  icon: <AlertTriangle size={18} />,   color: 'text-red-400',           path: '/dispatch' },
  ];

  // Financial pulse: revenue, gross margin, carrier payables, shipper
  // receivables. These are the four numbers the brief calls out for the admin
  // home screen. Demo values; production wires to the accounting service.
  const financialPulse = [
    { label: 'Revenue MTD',          value: '$184,250', sub: '+12% vs last month', icon: <Banknote size={18} />,  color: 'text-green-400',         path: '/accounting' },
    { label: 'Gross margin',         value: '14.6%',    sub: 'Target 12–18%',      icon: <TrendingUp size={18} />, color: 'text-emerald-400',      path: '/accounting' },
    { label: 'Carrier payables',     value: '$48,900',  sub: '7 carriers · 2 QuickPay', icon: <Wallet size={18} />, color: 'text-yellow-400',     path: '/accounting' },
    { label: 'Shipper receivables',  value: '$96,400',  sub: '4 invoices overdue', icon: <Receipt size={18} />,    color: 'text-infamous-orange',   path: '/accounting' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Daily freight control overview · sample data</p>
        </div>
        <div className="flex items-center gap-2 bg-infamous-card border border-infamous-border rounded-xl px-3 py-2">
          <Activity size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">Demo data</span>
          {urgentCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{urgentCount} urgent</span>
          )}
        </div>
      </div>

      {/* Operations Metrics */}
      <WidgetErrorBoundary label="Operations metrics">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {opsMetrics.map((metric) => (
          <button
            key={metric.label}
            onClick={() => navigate(metric.path)}
            aria-label={`${metric.label}: ${metric.value}${metric.urgent && metric.value > 0 ? ' — urgent' : ''}`}
            className={`card text-left group transition-all hover:border-infamous-orange/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange ${metric.urgent && metric.value > 0 ? 'border-red-500/30' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span aria-hidden="true" className={metric.color}>{metric.icon}</span>
              {metric.urgent && metric.value > 0 && (
                <ShieldAlert size={12} aria-hidden="true" className="text-red-400" />
              )}
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-300 transition-colors">{metric.label}</p>
          </button>
        ))}
      </div>
      </WidgetErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Flow */}
        <WidgetErrorBoundary label="Today's flow">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today&apos;s flow</h2>
            <button onClick={() => navigate('/dispatch')} className="text-sm text-infamous-orange hover:underline flex items-center gap-1">
              Dispatch board <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {todaysFlow.map((m) => (
              <button
                key={m.label}
                onClick={() => navigate(m.path)}
                aria-label={`${m.label}: ${m.value}`}
                className="text-left rounded-xl border border-infamous-border bg-[#1a1a1a] hover:border-infamous-orange/30 p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange"
              >
                <span aria-hidden="true" className={`${m.color} mb-3 inline-flex`}>{m.icon}</span>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
              </button>
            ))}
          </div>
        </div>
        </WidgetErrorBoundary>

        {/* Financial Pulse */}
        <WidgetErrorBoundary label="Financial pulse">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Financial pulse</h2>
            <button onClick={() => navigate('/accounting')} className="text-sm text-infamous-orange hover:underline flex items-center gap-1">
              Accounting <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {financialPulse.map((m) => (
              <button
                key={m.label}
                onClick={() => navigate(m.path)}
                aria-label={`${m.label}: ${m.value}`}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-infamous-border hover:border-infamous-border-light transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange"
              >
                <span aria-hidden="true" className={`${m.color}`}>{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className="text-base font-bold truncate">{m.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 whitespace-nowrap">{m.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        </WidgetErrorBoundary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WidgetErrorBoundary label="Active loads">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Loads</h2>
            <div role="group" aria-label="Filter active loads" className="flex items-center gap-2">
              {(['all', 'exceptions', 'missing_pod'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveLoadFilter(f)}
                  aria-pressed={activeLoadFilter === f}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange ${
                    activeLoadFilter === f ? 'bg-infamous-orange text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
              <button onClick={() => navigate('/dispatch')} className="text-sm text-infamous-orange hover:underline flex items-center gap-1 ml-2">
                Full Board <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {filteredLoads.map((load) => (
              <button
                key={load.ref}
                type="button"
                onClick={() => navigate('/dispatch')}
                aria-label={`${load.ref} ${load.route}, ${load.status.replace('_', ' ')}, ${load.rate}${load.hasException ? ', exception' : ''}${load.missingPod ? ', missing POD' : ''}`}
                className={`w-full text-left flex items-center gap-4 p-3 rounded-xl bg-[#1a1a1a] border transition-all cursor-pointer hover:border-infamous-border-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange ${
                  load.hasException ? 'border-red-500/30' : load.missingPod ? 'border-yellow-500/30' : 'border-infamous-border'
                }`}
              >
                <div aria-hidden="true" className={`w-2 h-12 rounded-full ${
                  load.status === 'in_transit' ? 'bg-blue-400' :
                  load.status === 'at_pickup' ? 'bg-yellow-400' :
                  load.status === 'exception' ? 'bg-red-400' :
                  load.status === 'delivered' ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-500">{load.ref}</span>
                    <span className={`badge text-[10px] ${statusStyle[load.status] ?? ''}`}>
                      {load.status.replace('_', ' ')}
                    </span>
                    {load.hasException && <span className="badge badge-red text-[10px]">Exception</span>}
                    {load.missingPod && <span className="badge badge-yellow text-[10px]">Missing POD</span>}
                  </div>
                  <p className="text-sm font-medium mt-0.5 truncate">{load.route}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{load.carrier} · ETA {load.eta}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{load.rate}</p>
                </div>
              </button>
            ))}
            {filteredLoads.length === 0 && (
              <EmptyState
                icon={<Truck size={36} />}
                title="No loads matching filter"
                description="Try selecting a different filter to see active loads."
              />
            )}
          </div>
        </div>
        </WidgetErrorBoundary>

        {/* Action Required */}
        <WidgetErrorBoundary label="Action items">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Action Required</h2>
          <div className="space-y-3">
            {[
              { icon: <AlertTriangle size={16} />, label: '2 exception loads need attention', path: '/dispatch', color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: <FileX size={16} />, label: '3 delivered loads missing POD', path: '/dispatch', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { icon: <DollarSign size={16} />, label: '4 invoices overdue — follow up', path: '/accounting', color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: <Package size={16} />, label: '2 carriers need documents', path: '/carriers', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: <Ban size={16} />, label: '1 compliance item blocking ops', path: '/compliance', color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: <FileText size={16} />, label: '7 open quotes awaiting review', path: '/quotes', color: 'text-infamous-orange', bg: 'bg-infamous-orange/10' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-all group text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.label}</p>
                <ChevronRight size={14} className="ml-auto text-gray-600 group-hover:text-gray-400" />
              </button>
            ))}
          </div>
        </div>
        </WidgetErrorBoundary>
      </div>
    </div>
  );
};

export default DashboardPage;
