import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MapPin, PackageCheck, Search, Truck } from 'lucide-react';
import { demoShipments } from '@/data/mvpFreightData';
import { trackPublicEvent } from '@/lib/analytics';

const ShipmentTrackingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('IF-20491');

  const shipment = useMemo(() => {
    return demoShipments.find((item) => item.trackingNumber.toLowerCase() === trackingNumber.trim().toLowerCase());
  }, [trackingNumber]);

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
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                <AlertTriangle size={14} /> Demo data
              </span>
            </div>
            <p className="mt-4 rounded-2xl border border-white/10 bg-[#111] p-4 text-sm leading-6 text-gray-300">
              Public lookup is currently a demo preview. Real customer tracking should use an assigned secure link or
              portal access before live shipment, carrier, customer, or rate details are exposed.
            </p>
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
              onClick={() => trackPublicEvent('tracking_search', { found: Boolean(shipment), demo: true })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white"
            >
              <Search size={17} /> Search
            </button>
          </div>

          {shipment ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-infamous-border bg-[#111] p-6">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{shipment.trackingNumber}</p>
                    <h2 className="mt-1 text-2xl font-bold">{shipment.route}</h2>
                    <p className="mt-2 text-gray-400">Demo customer details hidden from public preview</p>
                  </div>
                  <span className="rounded-full bg-infamous-orange/10 px-4 py-2 text-sm font-semibold text-infamous-orange">{shipment.status}</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['Pickup', shipment.pickupDate],
                    ['Delivery', shipment.deliveryDate],
                    ['ETA', shipment.eta],
                    ['Equipment', shipment.equipment],
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
                  <p className="mt-2 text-sm leading-6 text-gray-300">{shipment.notes}</p>
                </div>
              </div>

              <aside className="rounded-2xl border border-infamous-border bg-[#111] p-6">
                <h3 className="text-lg font-bold">Status timeline</h3>
                <div className="mt-5 space-y-5">
                  {[
                    ['Quote approved', true],
                    ['Carrier assigned', true],
                    ['Picked up', shipment.status !== 'At pickup'],
                    ['In transit', shipment.status === 'In transit' || shipment.status === 'Exception review'],
                    ['Delivered', false],
                  ].map(([label, active]) => (
                    <div key={String(label)} className="flex gap-3">
                      <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                        {active ? <PackageCheck size={15} /> : <MapPin size={15} />}
                      </span>
                      <p className={`pt-1 text-sm ${active ? 'text-gray-200' : 'text-gray-500'}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <h2 className="text-xl font-bold">Tracking number not found</h2>
              <p className="mt-2 text-gray-300">We couldn't find that tracking number. Double-check the format (IF-##### with five digits) or contact dispatch if it should be active.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ShipmentTrackingPage;
