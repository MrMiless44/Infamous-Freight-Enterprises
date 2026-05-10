import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  FileText,
  MapPin,
  MessageSquare,
  Navigation,
  Package,
  Phone,
  RefreshCw,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { ShipmentRouteMap } from '@/components/ShipmentRouteMap';
import api from '@/api-client/client';

interface TimelineStep {
  key: string;
  label: string;
  date: string | null;
}

interface ShipmentDoc {
  name: string;
  type: string;
  date: string;
}

interface ShipmentMessage {
  from: string;
  text: string;
  time: string;
}

interface Shipment {
  trackingNumber: string;
  status: string;
  customer: string;
  origin: string;
  originAddress: string;
  destination: string;
  destinationAddress: string;
  pickupDate: string;
  deliveryDate: string;
  eta: string;
  equipment: string;
  weight: string;
  commodity: string;
  rate: string;
  miles: string;
  carrier: string;
  carrierMc: string;
  driver: string;
  driverPhone: string;
  currentStep: number;
  invoiceId: string | null;
  invoiceStatus: string;
  documents: ShipmentDoc[];
  messages: ShipmentMessage[];
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatWeight(lbs: number | null | undefined): string {
  if (!lbs) return '—';
  return lbs.toLocaleString() + ' lb';
}

function formatRate(cents: number | null | undefined): string {
  if (!cents && cents !== 0) return '—';
  return '$' + cents.toLocaleString();
}

function buildTimelineSteps(events: Array<{ status: string; createdAt: string }>): { steps: TimelineStep[]; currentStep: number } {
  const statusOrder = [
    'quote_created',
    'shipment_booked',
    'driver_assigned',
    'pickup_completed',
    'in_transit',
    'arrived_destination',
    'delivered',
    'pod_uploaded',
    'invoice_ready',
  ];

  const labelMap: Record<string, string> = {
    quote_created: 'Quote Created',
    shipment_booked: 'Shipment Booked',
    booked: 'Shipment Booked',
    driver_assigned: 'Driver Assigned',
    pickup_completed: 'Pickup Completed',
    at_pickup: 'Pickup Completed',
    in_transit: 'In Transit',
    arrived_destination: 'Arrived at Destination',
    delivered: 'Delivered',
    pod_uploaded: 'Proof of Delivery Uploaded',
    invoice_ready: 'Invoice Ready',
  };

  const eventMap = new Map<string, string>();
  for (const ev of events) {
    const key = ev.status.toLowerCase();
    if (!eventMap.has(key)) {
      eventMap.set(key, ev.createdAt);
    }
    const mapped = key === 'booked' ? 'shipment_booked' : key === 'at_pickup' ? 'pickup_completed' : null;
    if (mapped && !eventMap.has(mapped)) {
      eventMap.set(mapped, ev.createdAt);
    }
  }

  let currentStep = -1;
  const steps: TimelineStep[] = statusOrder.map((key, i) => {
    const dateStr = eventMap.get(key) || null;
    if (dateStr) currentStep = i;
    return {
      key,
      label: labelMap[key] || formatStatus(key),
      date: dateStr ? formatDate(dateStr) : null,
    };
  });

  return { steps, currentStep };
}

const statusColorMap: Record<string, string> = {
  'In Transit': 'badge-blue',
  'At Pickup': 'badge-blue',
  'Booked': 'badge-blue',
  'Delivered': 'badge-green',
  'POD Uploaded': 'badge-green',
  'Delayed': 'badge-orange',
  'Exception': 'badge-red',
};

const ShipmentDetailPage: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackingId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        const loadsRes = await api.getLoads();
        const loads = loadsRes.loads || loadsRes || [];
        const load = (Array.isArray(loads) ? loads : []).find(
          (l: Record<string, unknown>) => l.trackingNumber === trackingId
        );

        if (!load) {
          if (!cancelled) {
            setShipment(null);
            setLoading(false);
          }
          return;
        }

        const loadId = load.id;

        const [timelineRes, docsRes] = await Promise.all([
          api.getLoadTimeline(loadId).catch(() => ({ events: [] })),
          api.getLoadDocuments(loadId).catch(() => ({ documents: [] })),
        ]);

        const events = timelineRes.events || [];
        const documents = (docsRes.documents || []).map((doc: Record<string, unknown>) => ({
          name: (doc.fileName as string) || (doc.type as string) || 'Document',
          type: (doc.type as string) || '—',
          date: formatDate(doc.createdAt as string),
        }));

        const { steps, currentStep } = buildTimelineSteps(events);

        const displayStatus = formatStatus(load.status || '');

        const mapped: Shipment = {
          trackingNumber: load.trackingNumber || trackingId,
          status: displayStatus,
          customer: load.shipperName || '—',
          origin: load.origin || '—',
          originAddress: load.origin || '—',
          destination: load.destination || '—',
          destinationAddress: load.destination || '—',
          pickupDate: formatDate(load.pickupAt),
          deliveryDate: formatDate(load.deliveryAt),
          eta: formatDate(load.deliveryAt) || '—',
          equipment: load.equipment || '—',
          weight: formatWeight(load.weightLbs),
          commodity: load.commodity || '—',
          rate: formatRate(load.rate),
          miles: load.miles ? `${load.miles.toLocaleString()} mi` : '—',
          carrier: '—',
          carrierMc: '',
          driver: '—',
          driverPhone: '',
          currentStep,
          invoiceId: null,
          invoiceStatus: 'Pending delivery',
          documents,
          messages: [],
        };

        if (!cancelled) {
          setShipment(mapped);
          setTimelineSteps(steps);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setShipment(null);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [trackingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-infamous-dark text-[#F5E8E8] flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto text-infamous-muted mb-4 animate-spin" />
          <h2 className="text-xl font-bold mb-2">Loading Shipment</h2>
          <p className="text-infamous-muted">Fetching details for {trackingId}...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-infamous-dark text-[#F5E8E8] flex items-center justify-center p-6">
        <div className="text-center">
          <Package size={48} className="mx-auto text-infamous-muted mb-4" />
          <h2 className="text-xl font-bold mb-2">Shipment Not Found</h2>
          <p className="text-infamous-muted mb-4">No shipment found with tracking number {trackingId}</p>
          <Link to="/customer-portal" className="text-infamous-red-light hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isException = shipment.status === 'Exception';

  return (
    <div className="min-h-screen bg-infamous-dark text-[#F5E8E8] px-5 py-6 lg:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <Link to="/customer-portal" className="inline-flex items-center gap-2 text-sm text-infamous-muted hover:text-[#F5E8E8] transition mb-4">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black">{shipment.trackingNumber}</h1>
              <span className={statusColorMap[shipment.status] || 'badge-blue'}>{shipment.status}</span>
              <button className="text-infamous-muted hover:text-[#F5E8E8] transition" title="Copy tracking number">
                <Copy size={14} />
              </button>
            </div>
            <p className="text-infamous-muted">{shipment.customer} · {shipment.origin} to {shipment.destination}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/request-quote?origin=${encodeURIComponent(shipment.origin)}&destination=${encodeURIComponent(shipment.destination)}&equipment=${encodeURIComponent(shipment.equipment)}&weight=${encodeURIComponent(shipment.weight)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-4 py-2.5 text-sm font-semibold transition hover:border-infamous-red/30"
            >
              <RefreshCw size={14} /> Rebook This Lane
            </Link>
            <Link
              to={`/track-shipment?tracking=${shipment.trackingNumber}`}
              className="inline-flex items-center gap-2 rounded-xl bg-infamous-red px-4 py-2.5 text-sm font-semibold text-[#F5E8E8] shadow-lg shadow-infamous-red/20 transition hover:bg-infamous-red-light"
            >
              <Navigation size={14} /> Live Tracking
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Exception Alert */}
            {isException && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
                <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-400">Exception — Delivery Delayed</p>
                  <p className="text-sm text-red-300/80 mt-1">
                    Weather delay reported near El Paso. Dispatch is working on a revised ETA and recovery plan.
                  </p>
                </div>
              </div>
            )}

            {/* Shipment Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-infamous-red-light" />
                  <p className="text-xs text-infamous-muted">Pickup</p>
                </div>
                <p className="font-semibold text-sm">{shipment.origin}</p>
                <p className="text-xs text-[#B88989]/70 mt-0.5">{shipment.originAddress}</p>
                <p className="text-xs text-infamous-red-light mt-1">{shipment.pickupDate}</p>
              </div>
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-[#36D399]" />
                  <p className="text-xs text-infamous-muted">Delivery</p>
                </div>
                <p className="font-semibold text-sm">{shipment.destination}</p>
                <p className="text-xs text-[#B88989]/70 mt-0.5">{shipment.destinationAddress}</p>
                <p className="text-xs text-[#36D399] mt-1">{shipment.deliveryDate}</p>
              </div>
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className={isException ? 'text-red-400' : 'text-infamous-ember'} />
                  <p className="text-xs text-infamous-muted">ETA</p>
                </div>
                <p className={`font-semibold text-sm ${isException ? 'text-red-400' : ''}`}>{shipment.eta}</p>
              </div>
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={14} className="text-infamous-ember" />
                  <p className="text-xs text-infamous-muted">Equipment</p>
                </div>
                <p className="font-semibold text-sm">{shipment.equipment}</p>
                <p className="text-xs text-[#B88989]/70 mt-0.5">{shipment.weight} · {shipment.miles}</p>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card overflow-hidden">
              <div className="p-4 border-b border-infamous-border flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Navigation size={16} className="text-infamous-red-light" /> Route Map
                </h2>
              </div>
              <div className="h-72 lg:h-80">
                <ShipmentRouteMap origin={shipment.origin} destination={shipment.destination} status={shipment.status} />
              </div>
            </div>

            {/* Messages */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card">
              <div className="flex items-center justify-between border-b border-infamous-border p-4">
                <h2 className="font-bold flex items-center gap-2">
                  <MessageSquare size={16} className="text-infamous-red-light" /> Messages
                </h2>
                <Link to="/messages" className="text-xs text-infamous-red-light hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-infamous-border">
                {shipment.messages.map((msg, i) => (
                  <div key={i} className="p-4 flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      msg.from === 'Dispatch' ? 'bg-infamous-red text-[#F5E8E8]' : 'bg-emerald-600 text-[#F5E8E8]'
                    }`}>
                      {msg.from[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{msg.from}</p>
                        <span className="text-xs text-infamous-muted">{msg.time}</span>
                      </div>
                      <p className="text-sm text-[#F5E8E8]/80 mt-0.5">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card">
              <div className="flex items-center justify-between border-b border-infamous-border p-4">
                <h2 className="font-bold flex items-center gap-2">
                  <FileText size={16} className="text-infamous-ember" /> Documents
                </h2>
              </div>
              <div className="divide-y divide-infamous-border">
                {shipment.documents.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-infamous-muted" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-infamous-muted">{doc.type} · {doc.date}</p>
                      </div>
                    </div>
                    <button className="rounded-lg bg-infamous-panel p-2 text-infamous-muted transition hover:text-[#F5E8E8]">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Shipment Timeline */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
              <h2 className="font-bold mb-4">Shipment Timeline</h2>
              <div className="space-y-0">
                {timelineSteps.map((step, i) => {
                  const isCompleted = i < shipment.currentStep;
                  const isCurrent = i === shipment.currentStep;
                  const isExceptionStep = isCurrent && isException;

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          isExceptionStep ? 'bg-red-500 ring-2 ring-red-500/30' :
                          isCompleted ? 'bg-[#36D399]' :
                          isCurrent ? 'bg-infamous-red ring-2 ring-infamous-red/30' :
                          'border border-infamous-border bg-infamous-panel'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle size={14} className="text-[#F5E8E8]" />
                          ) : isExceptionStep ? (
                            <XCircle size={14} className="text-[#F5E8E8]" />
                          ) : isCurrent ? (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-infamous-border" />
                          )}
                        </div>
                        {i < timelineSteps.length - 1 && (
                          <div className={`w-px h-6 ${isCompleted ? 'bg-[#36D399]' : 'bg-infamous-border'}`} />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className={`text-sm font-medium ${
                          isExceptionStep ? 'text-red-400' :
                          isCompleted || isCurrent ? 'text-[#F5E8E8]' : 'text-infamous-muted'
                        }`}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-xs text-infamous-muted mt-0.5">{step.date}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carrier Info */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <Truck size={16} className="text-infamous-red-light" /> Carrier
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">{shipment.carrier}</p>
                  <p className="text-xs text-infamous-muted">{shipment.carrierMc}</p>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-infamous-panel p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-infamous-red text-sm font-bold text-[#F5E8E8]">
                    {shipment.driver[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{shipment.driver}</p>
                    <p className="text-xs text-infamous-muted">Driver</p>
                  </div>
                  <a
                    href={`tel:${shipment.driverPhone}`}
                    className="rounded-lg bg-infamous-card p-2 text-infamous-muted hover:text-[#36D399] transition"
                  >
                    <Phone size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Invoice Status */}
            <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-[#36D399]" /> Invoice
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-infamous-muted">Status</p>
                  <p className="font-semibold mt-0.5">{shipment.invoiceStatus}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-infamous-muted">Rate</p>
                  <p className="font-semibold text-[#36D399] mt-0.5">{shipment.rate}</p>
                </div>
              </div>
              {shipment.invoiceId && (
                <button className="mt-3 w-full rounded-lg bg-infamous-panel py-2 text-sm font-medium text-infamous-red-light transition hover:bg-infamous-border">
                  Download Invoice
                </button>
              )}
            </div>

            {/* Rebook */}
            <Link
              to={`/request-quote?origin=${encodeURIComponent(shipment.origin)}&destination=${encodeURIComponent(shipment.destination)}&equipment=${encodeURIComponent(shipment.equipment)}&weight=${encodeURIComponent(shipment.weight)}`}
              className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-5 transition hover:border-infamous-red/20"
            >
              <RefreshCw size={20} className="text-infamous-red-light" />
              <div className="flex-1">
                <p className="font-semibold">Rebook This Shipment</p>
                <p className="text-sm text-infamous-muted">Same lane, new booking</p>
              </div>
              <span className="text-infamous-muted"><User size={14} /></span>
            </Link>

            {/* Support */}
            <Link
              to="/contact"
              className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-5 transition hover:border-infamous-red/20"
            >
              <MessageSquare size={20} className="text-infamous-red-light" />
              <div className="flex-1">
                <p className="font-semibold">Need Help?</p>
                <p className="text-sm text-infamous-muted">Contact support</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailPage;
