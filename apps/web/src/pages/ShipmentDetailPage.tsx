import { useEffect } from 'react';
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
import { LazyShipmentRouteMap, preloadShipmentRouteMap } from '@/components/LazyShipmentRouteMap';

const timelineSteps = [
  { key: 'quote_created', label: 'Quote Created', date: 'Apr 25, 2026 · 9:15 AM' },
  { key: 'shipment_booked', label: 'Shipment Booked', date: 'Apr 26, 2026 · 11:00 AM' },
  { key: 'driver_assigned', label: 'Driver Assigned', date: 'Apr 27, 2026 · 3:30 PM' },
  { key: 'pickup_completed', label: 'Pickup Completed', date: 'Apr 29, 2026 · 10:15 AM' },
  { key: 'in_transit', label: 'In Transit', date: 'Apr 29, 2026 · 10:30 AM' },
  { key: 'arrived_destination', label: 'Arrived at Destination', date: null },
  { key: 'delivered', label: 'Delivered', date: null },
  { key: 'pod_uploaded', label: 'Proof of Delivery Uploaded', date: null },
  { key: 'invoice_ready', label: 'Invoice Ready', date: null },
];

const shipmentData = {
  'IF-20491': {
    trackingNumber: 'IF-20491',
    status: 'In Transit',
    customer: 'Summit Retail Group',
    origin: 'Chicago, IL',
    originAddress: '1200 S Ashland Ave, Chicago, IL 60608',
    destination: 'Dallas, TX',
    destinationAddress: '4500 S Lamar St, Dallas, TX 75215',
    pickupDate: 'Apr 29, 2026 · 8:00 AM',
    deliveryDate: 'Apr 30, 2026 · 6:30 PM',
    eta: 'Apr 30, 2026 · 6:30 PM',
    equipment: '53 ft Dry Van',
    weight: '24,000 lb',
    commodity: 'Palletized retail goods',
    rate: '$3,200',
    miles: '925 mi',
    carrier: 'Midwest Linehaul Co.',
    carrierMc: 'MC-892104',
    driver: 'James R.',
    driverPhone: '+1 (312) 555-0187',
    currentStep: 4,
    invoiceId: null as string | null,
    invoiceStatus: 'Pending delivery',
    documents: [
      { name: 'Bill of Lading', type: 'BOL', date: 'Apr 29, 2026' },
      { name: 'Rate Confirmation', type: 'Rate Con', date: 'Apr 26, 2026' },
    ],
    messages: [
      { from: 'Dispatch', text: 'Driver checked in. Running on schedule.', time: '2:15 PM' },
      { from: 'Driver', text: 'Past Oklahoma City. Traffic clear ahead.', time: '1:42 PM' },
    ],
  },
  'IF-20492': {
    trackingNumber: 'IF-20492',
    status: 'At Pickup',
    customer: 'Blue Ridge Foods',
    origin: 'Atlanta, GA',
    originAddress: '600 Mitchell St SW, Atlanta, GA 30314',
    destination: 'Charlotte, NC',
    destinationAddress: '1000 W Trade St, Charlotte, NC 28202',
    pickupDate: 'Apr 29, 2026 · 12:00 PM',
    deliveryDate: 'Apr 29, 2026 · 4:00 PM',
    eta: 'Apr 29, 2026 · 4:00 PM',
    equipment: 'Reefer',
    weight: '18,500 lb',
    commodity: 'Refrigerated food product',
    rate: '$1,850',
    miles: '245 mi',
    carrier: 'Road Runner Inc.',
    carrierMc: 'MC-445210',
    driver: 'David K.',
    driverPhone: '+1 (404) 555-0239',
    currentStep: 3,
    invoiceId: null as string | null,
    invoiceStatus: 'Pending delivery',
    documents: [
      { name: 'Bill of Lading', type: 'BOL', date: 'Apr 29, 2026' },
      { name: 'Rate Confirmation', type: 'Rate Con', date: 'Apr 27, 2026' },
    ],
    messages: [
      { from: 'Dispatch', text: 'Waiting on dock assignment. Temp confirmed at 34°F.', time: '11:45 AM' },
    ],
  },
  'IF-20493': {
    trackingNumber: 'IF-20493',
    status: 'Exception',
    customer: 'Desert Supply Co.',
    origin: 'Houston, TX',
    originAddress: '3100 Fannin St, Houston, TX 77004',
    destination: 'Phoenix, AZ',
    destinationAddress: '201 E Washington St, Phoenix, AZ 85004',
    pickupDate: 'Apr 28, 2026 · 6:00 AM',
    deliveryDate: 'Apr 30, 2026 · 2:00 PM',
    eta: 'Delayed — recovery plan pending',
    equipment: 'Flatbed',
    weight: '42,000 lb',
    commodity: 'Building materials',
    rate: '$4,100',
    miles: '1,180 mi',
    carrier: 'Desert Haul Co.',
    carrierMc: 'MC-671392',
    driver: 'Carlos M.',
    driverPhone: '+1 (713) 555-0441',
    currentStep: 4,
    invoiceId: null as string | null,
    invoiceStatus: 'Pending delivery',
    documents: [
      { name: 'Bill of Lading', type: 'BOL', date: 'Apr 28, 2026' },
      { name: 'Rate Confirmation', type: 'Rate Con', date: 'Apr 27, 2026' },
    ],
    messages: [
      { from: 'Dispatch', text: 'Weather delay near El Paso. Confirming revised ETA.', time: '9:30 AM' },
      { from: 'Driver', text: 'Pulled over at truck stop. Roads closed ahead.', time: '8:50 AM' },
    ],
  },
};

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
  const shipment = shipmentData[trackingId as keyof typeof shipmentData];

  useEffect(() => {
    preloadShipmentRouteMap();
  }, []);

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
                <LazyShipmentRouteMap origin={shipment.origin} destination={shipment.destination} status={shipment.status} />
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
