import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MapPin, PackageCheck, Search, Truck } from 'lucide-react';
import { demoShipments } from '@/data/mvpFreightData';
import { trackPublicEvent } from '@/lib/analytics';
import { getPublicShipment, PublicShipment } from '@/lib/publicFreightApi';
import { ShipmentRouteMap } from '@/components/ShipmentRouteMap';

const ShipmentTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || 'IF-20491');
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
    // Search parameters should trigger only the initial deep-link lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link to="/home" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <section className="rounded-3xl border border-infamous-border bg-infamous-card p-6 lg:p-8">
          <div className="mb-8">
            <div className="mb-3 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
              <Truck size={24} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Track shipment</h1>
                <p className="mt-2 text-gray-400">
                  Enter a tracking number to view status, ETA, and dispatch notes.
                </p>
              </div>
              <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                isDemo
                  ? 'border-amber-400/25 bg-amber-300/10 text-amber-200'
                  : 'border-green-400/25 bg-green-300/10 text-green-200'
              }`}>
                {isDemo ? <AlertTriangle size={14} /> : <PackageCheck size={14} />}
                {isDemo ? 'Demo fallback' : 'Live tracking'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              className="flex-1 rounded-xl border border-infamous-border bg-[#111] px-4 py-3 text-white outline-none transition focus:border-infamous-orange"
              placeholder="Example: IF-20491"
            />
            <button
              type="button"
              onClick={() => void lookupShipment()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white"
            >
              <Search size={17} /> {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {lookupError ? (
            <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">{lookupError}</p>
          ) : null}

          {shipment ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-infamous-border bg-[#111] p-6">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{shipment.trackingNumber}</p>
                    <h2 className="mt-1 text-2xl font-bold">{shipment.route}</h2>
                    <p className="mt-2 text-gray-400">Customer, carrier, and rate details are hidden from public tracking.</p>
                  </div>
                  <span className="rounded-full bg-infamous-orange/10 px-4 py-2 text-sm font-semibold text-infamous-orange">{shipment.status}</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['Pickup', shipment.pickupDate || 'Pending'],
                    ['Delivery', shipment.deliveryDate || 'Pending'],
                    ['ETA', shipment.eta || 'Pending'],
                    ['Equipment', shipment.equipment || 'Pending'],
                    ['Carrier', 'Hidden in public demo'],
                    ['Rate', 'Hidden in public demo'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-infamous-border bg-infamous-card p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
                      <p className="mt-1 font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-infamous-border bg-infamous-card p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Dispatch notes</p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">{shipment.notes || 'Dispatch has not added public notes yet.'}</p>
                </div>

                <div className="mt-6">
                  <ShipmentRouteMap
                    origin={shipment.origin}
                    destination={shipment.destination}
                    status={shipment.status}
                  />
                </div>
              </div>

              <aside className="rounded-2xl border border-infamous-border bg-[#111] p-6">
                <h3 className="text-lg font-bold">Status timeline</h3>
                <div className="mt-5 space-y-5">
                  {(() => {
                    const order = [
                      'Quote approved',
                      'Carrier assigned',
                      'Picked up',
                      'Loaded',
                      'In transit',
                      'ETA confirmed',
                      'Arrived at delivery',
                      'Unloaded',
                      'POD received',
                    ];
                    const completedThrough = (() => {
                      switch (shipment.status) {
                        case 'At pickup':
                          return 1;
                        case 'In transit':
                          return 5;
                        case 'Exception review':
                          return 4;
                        case 'Delivered':
                          return 7;
                        case 'POD received':
                          return 8;
                        default:
                          return 1;
                      }
                    })();
                    return order.map((label, index) => {
                      const isException = shipment.status === 'Exception review' && index === 5;
                      const active = index <= completedThrough;
                      return (
                        <div key={label} className="flex gap-3">
                          <span
                            className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${
                              isException
                                ? 'bg-amber-500/20 text-amber-300'
                                : active
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-700 text-gray-500'
                            }`}
                          >
                            {isException ? <AlertTriangle size={15} /> : active ? <PackageCheck size={15} /> : <MapPin size={15} />}
                          </span>
                          <div className="pt-1">
                            <p className={`text-sm ${active ? 'text-gray-200' : 'text-gray-500'}`}>{label}</p>
                            {isException ? (
                              <p className="mt-1 text-xs text-amber-300">Exception flagged — recovery plan pending</p>
                            ) : null}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </aside>
            </div>
          ) : searched ? (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <h2 className="text-xl font-bold">Tracking number not found</h2>
              <p className="mt-2 text-gray-300">We couldn't find that tracking number. Double-check the format (IF-##### with five digits) or contact dispatch if it should be active.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
};

export default ShipmentTrackingPage;
