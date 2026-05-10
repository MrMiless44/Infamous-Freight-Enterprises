import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  FileText,
  MapPin,
  MessageSquare,
  Search,
  Truck,
} from 'lucide-react';
import { demoShipments } from '@/data/mvpFreightData';
import { trackPublicEvent } from '@/lib/analytics';
import { getPublicShipment, PublicShipment } from '@/lib/publicFreightApi';
import { ShipmentRouteMap } from '@/components/ShipmentRouteMap';

const TIMELINE_STEPS = [
  { key: 'quote_created', label: 'Quote Created' },
  { key: 'shipment_booked', label: 'Shipment Booked' },
  { key: 'driver_assigned', label: 'Driver Assigned' },
  { key: 'pickup_completed', label: 'Pickup Completed' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'arrived_destination', label: 'Arrived at Destination' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'pod_uploaded', label: 'Proof of Delivery Uploaded' },
  { key: 'invoice_ready', label: 'Invoice Ready' },
];

function getCompletedIndex(status: string): number {
  const map: Record<string, number> = {
    'Quote Pending': 0,
    'Booked': 1,
    'Carrier Assigned': 2,
    'At pickup': 3,
    'Picked Up': 3,
    'In transit': 4,
    'In Transit': 4,
    'Arrived': 5,
    'Delivered': 6,
    'POD received': 7,
    'POD Uploaded': 7,
    'Invoiced': 8,
    'Delayed': 4,
  };
  return map[status] ?? 1;
}

const statusBadgeClass: Record<string, string> = {
  'In Transit': 'badge-blue',
  'In transit': 'badge-blue',
  'At pickup': 'badge-blue',
  'Picked Up': 'badge-blue',
  'Booked': 'badge-blue',
  'Carrier Assigned': 'badge-blue',
  'Delivered': 'badge-green',
  'POD received': 'badge-green',
  'POD Uploaded': 'badge-green',
  'Invoiced': 'badge-green',
  'Paid': 'badge-green',
  'Delayed': 'badge-orange',
  'Quote Pending': 'badge-gray',
};

const ShipmentTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '');
  const [liveShipment, setLiveShipment] = useState<PublicShipment | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const demoShipment = useMemo(() => {
    return demoShipments.find((item) => item.trackingNumber.toLowerCase() === trackingNumber.trim().toLowerCase());
  }, [trackingNumber]);

  const shipment = liveShipment ?? demoShipment;
  const isDemo = !liveShipment && Boolean(demoShipment);

  const lookupShipment = async () => {
    const value = trackingNumber.trim();
    if (!value) return;

    setLoading(true);
    setLookupError('');

    try {
      const result = await getPublicShipment(value);
      setLiveShipment(result);
      setSearched(true);
      trackPublicEvent('tracking_search', { found: Boolean(result || demoShipment), demo: !result && Boolean(demoShipment) });
    } catch (error) {
      setLiveShipment(null);
      setLookupError(error instanceof Error ? error.message : 'Tracking lookup is temporarily unavailable.');
      trackPublicEvent('tracking_search', { found: Boolean(demoShipment), demo: Boolean(demoShipment), error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('tracking')) {
      void lookupShipment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedIndex = shipment ? getCompletedIndex(shipment.status) : -1;
  const isException = shipment?.status === 'Exception review';

  return (
    <div className="min-h-screen bg-infamous-dark px-5 py-8 text-[#F5E8E8] lg:px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[#B88989] hover:text-[#F5E8E8]">
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Search Section */}
        <div className="rounded-xl border border-infamous-border bg-infamous-card p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-lg bg-infamous-red/10 p-3 text-infamous-red-light">
                <Search size={22} />
              </div>
              <h1 className="text-3xl font-black">Track a Shipment</h1>
              <p className="mt-2 text-[#B88989]">Enter your tracking number to see real-time status, timeline, and delivery details.</p>
            </div>
            {shipment && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isDemo ? 'border-infamous-orange/20 bg-infamous-orange/5 text-infamous-orange' : 'border-[#36D399]/20 bg-[#36D399]/5 text-[#36D399]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-infamous-orange' : 'bg-[#36D399] animate-pulse'}`} />
                {isDemo ? 'Demo Data' : 'Live'}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void lookupShipment(); }}
              className="input-field flex-1"
              placeholder="Enter tracking number (e.g. IF-20491)"
            />
            <button
              type="button"
              onClick={() => void lookupShipment()}
              disabled={loading}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Search size={17} /> {loading ? 'Searching...' : 'Track Shipment'}
            </button>
          </div>

          {lookupError && (
            <p className="mt-4 rounded-lg border border-infamous-orange/30 bg-infamous-orange/10 p-3 text-sm text-infamous-orange-light">{lookupError}</p>
          )}
        </div>

        {/* Shipment Details */}
        {shipment ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Status Header */}
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-sm text-infamous-muted">{shipment.trackingNumber}</p>
                    <h2 className="mt-1 text-2xl font-black">{shipment.route}</h2>
                  </div>
                  <span className={statusBadgeClass[shipment.status] || 'badge-blue'}>{shipment.status}</span>
                </div>

                <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Pickup', value: shipment.pickupDate || 'Pending', icon: MapPin },
                    { label: 'Delivery', value: shipment.deliveryDate || 'Pending', icon: MapPin },
                    { label: 'ETA', value: shipment.eta || 'Pending', icon: Clock },
                    { label: 'Equipment', value: shipment.equipment || 'Pending', icon: Truck },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-infamous-border bg-infamous-panel p-3">
                      <div className="flex items-center gap-1.5 text-infamous-muted">
                        <item.icon size={12} />
                        <p className="text-xs uppercase tracking-wider">{item.label}</p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#F5E8E8]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl border border-infamous-border bg-infamous-card overflow-hidden">
                <ShipmentRouteMap
                  origin={shipment.origin}
                  destination={shipment.destination}
                  status={shipment.status}
                />
              </div>

              {/* Dispatch Notes */}
              {shipment.notes && (
                <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#F5E8E8]">
                    <MessageSquare size={14} className="text-infamous-red-light" /> Dispatch Notes
                  </h3>
                  <p className="mt-2 text-sm text-[#B88989] leading-6">{shipment.notes}</p>
                </div>
              )}

              {/* Documents */}
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#F5E8E8]">
                  <FileText size={14} className="text-infamous-ember" /> Documents
                </h3>
                <div className="mt-3 space-y-2">
                  {['Bill of Lading', 'Rate Confirmation'].map((doc) => (
                    <div key={doc} className="flex items-center justify-between rounded-lg border border-infamous-border bg-infamous-panel px-4 py-3">
                      <span className="text-sm text-[#F5E8E8]/80">{doc}</span>
                      <button className="rounded-lg bg-infamous-red/10 p-2 text-infamous-red-light transition hover:bg-infamous-red/20">
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-6">
                <h3 className="text-lg font-bold mb-6">Shipment Timeline</h3>
                <div className="space-y-0">
                  {TIMELINE_STEPS.map((step, index) => {
                    const completed = index <= completedIndex;
                    const isCurrent = index === completedIndex;
                    const isExceptionStep = isException && index === completedIndex;
                    const isLast = index === TIMELINE_STEPS.length - 1;

                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                            isExceptionStep
                              ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30'
                              : isCurrent
                                ? 'bg-infamous-red text-[#F5E8E8] ring-2 ring-infamous-red/30'
                                : completed
                                  ? 'bg-[#36D399]/20 text-[#36D399]'
                                  : 'bg-infamous-panel text-infamous-muted border border-infamous-border'
                          }`}>
                            {isExceptionStep ? (
                              <AlertTriangle size={14} />
                            ) : completed ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Circle size={14} />
                            )}
                          </div>
                          {!isLast && (
                            <div className={`w-px flex-1 min-h-6 ${
                              completed && index < completedIndex ? 'bg-[#36D399]/30' : 'bg-infamous-border'
                            }`} />
                          )}
                        </div>
                        <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                          <p className={`text-sm font-medium ${
                            isExceptionStep
                              ? 'text-red-400'
                              : isCurrent
                                ? 'text-infamous-red-light'
                                : completed
                                  ? 'text-[#F5E8E8]'
                                  : 'text-infamous-muted'
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && !isExceptionStep && (
                            <p className="mt-0.5 text-xs text-infamous-muted">Current status</p>
                          )}
                          {isExceptionStep && (
                            <p className="mt-0.5 text-xs text-red-400">Exception flagged — review pending</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrier/Driver Info */}
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
                <h3 className="text-sm font-bold text-[#F5E8E8] mb-3">Carrier Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-infamous-muted">Carrier</span>
                    <span className="text-[#F5E8E8]/80">{'carrier' in shipment ? (shipment as Record<string, unknown>).carrier as string : 'Pending assignment'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-infamous-muted">Equipment</span>
                    <span className="text-[#F5E8E8]/80">{shipment.equipment || 'TBD'}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Status */}
              <div className="rounded-xl border border-infamous-border bg-infamous-card p-5">
                <h3 className="text-sm font-bold text-[#F5E8E8] mb-3">Invoice</h3>
                <p className="text-sm text-infamous-muted">
                  {completedIndex >= 8 ? 'Invoice ready for download.' : 'Invoice will be available after delivery and POD confirmation.'}
                </p>
              </div>

              {/* Need Help */}
              <Link
                to="/contact"
                className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-5 transition hover:border-infamous-red/20"
              >
                <MessageSquare size={18} className="text-infamous-red-light" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#F5E8E8]">Need Help?</p>
                  <p className="text-xs text-infamous-muted">Contact dispatch</p>
                </div>
              </Link>
            </div>
          </div>
        ) : searched ? (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-infamous-card p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 text-red-400" size={32} />
            <h2 className="text-xl font-bold">Tracking Number Not Found</h2>
            <p className="mt-2 text-[#B88989]">
              Double-check the format (IF-##### with five digits) or contact dispatch if the shipment should be active.
            </p>
            <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-infamous-red-light hover:underline">
              Contact Dispatch <MessageSquare size={14} />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ShipmentTrackingPage;
