import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  FileText,
  MapPin,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';
import api from '@/api-client/client';

const statusColorMap: Record<string, string> = {
  'In Transit': 'badge-blue',
  'Picked Up': 'badge-blue',
  'Booked': 'badge-blue',
  'Carrier Assigned': 'badge-blue',
  'Delivered': 'badge-green',
  'POD Uploaded': 'badge-green',
  'Delayed': 'badge-orange',
  'Exception': 'badge-red',
  'Quote Pending': 'badge-gray',
  'Invoiced': 'badge-green',
};

function getStatusBadge(status: string) {
  const cls = statusColorMap[status] || 'badge-blue';
  return <span className={`${cls}`}>{status}</span>;
}

const CustomerPortalPage: React.FC = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [shipments, setShipments] = useState<Array<{ trackingNumber: string; status: string; route: string; carrier: string; eta: string; origin: string; destination: string; equipment: string }>>([]);
  const [quotes, setQuotes] = useState<Array<{ id: string; lane: string; status: string; equipment: string; weight: string }>>([]);
  const [invoices, setInvoices] = useState<Array<{ id: string; load: string; amount: string; status: string; date: string }>>([]);
  const [alerts, setAlerts] = useState<Array<{ id: string | number; type: string; message: string; time: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ name: string; type: string; date: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [loadsRes, quotesRes, invoicesRes, notificationsRes] = await Promise.all([
          api.getLoads(),
          api.getQuotes(),
          api.getInvoices(),
          api.getNotifications({ limit: 5 }),
        ]);

        const formatStatus = (s: string) =>
          s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

        setShipments(
          (loadsRes.loads || []).map((l: Record<string, unknown>) => ({
            trackingNumber: l.trackingNumber as string,
            status: formatStatus(l.status as string),
            route: `${l.origin} → ${l.destination}`,
            carrier: l.shipperName as string,
            eta: l.deliveryAt
              ? new Date(l.deliveryAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '',
            origin: l.origin as string,
            destination: l.destination as string,
            equipment: l.equipment as string,
          }))
        );

        setQuotes(
          (quotesRes.quotes || []).map((q: Record<string, unknown>) => ({
            id: q.quoteNumber as string,
            lane: `${q.origin} → ${q.destination}`,
            status: q.status as string,
            equipment: q.equipment as string,
            weight: q.weight as string,
          }))
        );

        setInvoices(
          (invoicesRes.invoices || []).map((inv: Record<string, unknown>) => ({
            id: inv.invoiceNumber as string,
            load: inv.loadId as string,
            amount: `$${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            status: inv.status as string,
            date: inv.issuedAt
              ? new Date(inv.issuedAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '',
          }))
        );

        setAlerts(
          (notificationsRes.notifications || []).map((n: Record<string, unknown>) => ({
            id: n.id as string,
            type: n.type as string,
            message: n.message as string || n.title as string,
            time: n.createdAt
              ? new Date(n.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '',
          }))
        );

        setDocuments([]);
      } catch {
        // errors handled by api interceptor
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-infamous-dark px-5 py-8 text-[#F5E8E8] lg:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">Shipper Dashboard</p>
            <h1 className="mt-2 text-3xl font-black">Freight Overview</h1>
            <p className="mt-2 max-w-2xl text-[#B88989]">Track shipments, manage quotes, review invoices, and handle documents from one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/request-quote" className="inline-flex items-center gap-2 rounded-xl bg-infamous-red px-6 py-3 font-semibold text-[#F5E8E8] shadow-lg shadow-infamous-red/20 transition hover:bg-infamous-red-light">
              Get a Quote <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        {/* Quick Track */}
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-4">
          <Search size={18} className="shrink-0 text-infamous-muted" />
          <input
            type="text"
            placeholder="Enter tracking number to check status..."
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F5E8E8] placeholder-[#B88989]/60 focus:outline-none"
          />
          <Link
            to={`/track-shipment${trackingInput ? `?tracking=${trackingInput}` : ''}`}
            className="rounded-lg bg-infamous-red/10 px-4 py-2 text-sm font-semibold text-infamous-red-light transition hover:bg-infamous-red/20"
          >
            Track
          </Link>
        </div>

        {/* Top Stats */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <Truck size={20} className="text-infamous-red-light" />
              <span className="badge-blue">Active</span>
            </div>
            <p className="mt-4 text-3xl font-black">{shipments.filter((s) => s.status !== 'Delivered').length}</p>
            <p className="mt-1 text-sm text-infamous-muted">Active Loads</p>
          </div>
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <AlertTriangle size={20} className="text-infamous-orange" />
              <span className="badge-orange">Action</span>
            </div>
            <p className="mt-4 text-3xl font-black">{shipments.filter((s) => s.status === 'Delayed' || s.status === 'Exception').length}</p>
            <p className="mt-1 text-sm text-infamous-muted">Loads Needing Action</p>
          </div>
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <DollarSign size={20} className="text-[#36D399]" />
              <span className="badge-green">Ready</span>
            </div>
            <p className="mt-4 text-3xl font-black">{invoices.length}</p>
            <p className="mt-1 text-sm text-infamous-muted">Recent Invoices</p>
          </div>
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <Package size={20} className="text-infamous-ember" />
              <span className="badge-gray">Month</span>
            </div>
            <p className="mt-4 text-3xl font-black">{shipments.filter((s) => s.status === 'Delivered').length}</p>
            <p className="mt-1 text-sm text-infamous-muted">Delivered This Month</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Active Shipments */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card">
              <div className="flex items-center justify-between border-b border-infamous-border p-5">
                <h2 className="text-lg font-bold">Active Shipments</h2>
                <Link to="/track-shipment" className="text-sm font-medium text-infamous-red-light hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-infamous-border">
                {shipments.map((shipment) => (
                  <div
                    key={shipment.trackingNumber}
                    className="flex items-center justify-between gap-4 p-5 transition hover:bg-infamous-panel/50"
                  >
                    <Link
                      to={`/shipment/${shipment.trackingNumber}`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-infamous-muted">{shipment.trackingNumber}</span>
                        {getStatusBadge(shipment.status)}
                      </div>
                      <h3 className="mt-1.5 font-semibold text-[#F5E8E8] truncate">{shipment.route}</h3>
                      <div className="mt-1 flex items-center gap-4 text-xs text-[#B88989]/70">
                        <span className="flex items-center gap-1"><Truck size={12} /> {shipment.carrier}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> ETA {shipment.eta}</span>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {(shipment.status === 'Delivered' || shipment.status === 'POD Uploaded' || shipment.status === 'Invoiced') && (
                        <Link
                          to={`/request-quote?origin=${encodeURIComponent(shipment.origin)}&destination=${encodeURIComponent(shipment.destination)}&equipment=${encodeURIComponent(shipment.equipment)}`}
                          className="flex items-center gap-1.5 rounded-lg bg-infamous-red/10 px-3 py-1.5 text-xs font-semibold text-infamous-red-light transition hover:bg-infamous-red/20"
                          title="Rebook this lane"
                        >
                          <RefreshCw size={12} /> Rebook
                        </Link>
                      )}
                      <ChevronRight size={18} className="text-infamous-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Timeline Preview */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
              <h2 className="mb-4 text-lg font-bold">Shipment Lifecycle</h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['Quote Created', 'Booked', 'Carrier Assigned', 'Picked Up', 'In Transit', 'Delivered', 'POD Uploaded', 'Invoiced'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 shrink-0">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i < 5 ? 'bg-infamous-red text-[#F5E8E8]' : 'bg-infamous-panel text-infamous-muted border border-infamous-border'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs whitespace-nowrap ${i < 5 ? 'text-[#F5E8E8] font-medium' : 'text-infamous-muted'}`}>{step}</span>
                    {i < 7 && <div className={`w-6 h-px ${i < 4 ? 'bg-infamous-red' : 'bg-infamous-border'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Quote Requests */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card">
              <div className="flex items-center justify-between border-b border-infamous-border p-5">
                <h2 className="text-lg font-bold">Recent Quotes</h2>
                <Link to="/request-quote" className="text-sm font-medium text-infamous-red-light hover:underline">New Quote</Link>
              </div>
              <div className="divide-y divide-infamous-border">
                {quotes.map((quote) => (
                  <div key={quote.id} className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-infamous-muted">{quote.id}</span>
                      <span className={quote.status === 'pending' ? 'badge-orange' : 'badge-blue'}>{quote.status}</span>
                    </div>
                    <h3 className="mt-1.5 font-semibold">{quote.lane}</h3>
                    <p className="mt-1 text-sm text-[#B88989]/70">{quote.equipment} · {quote.weight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card">
              <div className="flex items-center justify-between border-b border-infamous-border p-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Bell size={18} className="text-infamous-red-light" /> Alerts
                </h2>
              </div>
              <div className="divide-y divide-infamous-border">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        alert.type === 'warning' ? 'bg-infamous-orange' :
                        alert.type === 'success' ? 'bg-[#36D399]' : 'bg-infamous-red-light'
                      }`} />
                      <div>
                        <p className="text-sm text-[#F5E8E8]/80">{alert.message}</p>
                        <p className="mt-1 text-xs text-infamous-muted">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card">
              <div className="flex items-center justify-between border-b border-infamous-border p-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <DollarSign size={18} className="text-[#36D399]" /> Invoices
                </h2>
              </div>
              <div className="divide-y divide-infamous-border">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#F5E8E8]">{inv.id}</p>
                      <p className="text-xs text-infamous-muted">{inv.load} · {inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#F5E8E8]">{inv.amount}</p>
                      <span className={inv.status === 'Paid' ? 'badge-green' : 'badge-blue'}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card">
              <div className="flex items-center justify-between border-b border-infamous-border p-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText size={18} className="text-infamous-ember" /> Documents
                </h2>
              </div>
              <div className="divide-y divide-infamous-border">
                {documents.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-[#F5E8E8]">{doc.name}</p>
                      <p className="text-xs text-infamous-muted">{doc.type} · {doc.date}</p>
                    </div>
                    <button className="rounded-lg bg-infamous-panel p-2 text-infamous-muted transition hover:text-[#F5E8E8]">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <Link
              to="/contact"
              className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-5 transition hover:border-infamous-red/20"
            >
              <MessageSquare size={20} className="text-infamous-red-light" />
              <div className="flex-1">
                <p className="font-semibold text-[#F5E8E8]">Need Help?</p>
                <p className="text-sm text-infamous-muted">Message dispatch support</p>
              </div>
              <ChevronRight size={16} className="text-infamous-muted" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalPage;
