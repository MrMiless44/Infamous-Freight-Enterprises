import { Suspense, lazy } from 'react';

const loadShipmentRouteMap = async () => {
  const mod = await import('./ShipmentRouteMap');
  return { default: mod.ShipmentRouteMap };
};

const ShipmentRouteMap = lazy(loadShipmentRouteMap);

export const preloadShipmentRouteMap = () => void loadShipmentRouteMap();

type LazyShipmentRouteMapProps = {
  origin: string;
  destination: string;
  status: string;
  className?: string;
};

const mapFallback = (
  <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-infamous-border bg-[#101010] p-6 text-center text-sm text-[#B88989]">
    Loading route map…
  </div>
);

export const LazyShipmentRouteMap: React.FC<LazyShipmentRouteMapProps> = ({ origin, destination, status, className }) => (
  <div className={className}>
    <Suspense fallback={mapFallback}>
      <ShipmentRouteMap origin={origin} destination={destination} status={status} />
    </Suspense>
  </div>
);
