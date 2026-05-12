import { useEffect, useMemo, useRef, useState } from 'react';
import type { GeoJSONSource, LngLatBoundsLike, Map } from 'maplibre-gl';

type ShipmentRouteMapProps = {
  origin: string;
  destination: string;
  status: string;
};

type Coordinate = [number, number];

const cityCoordinates: Record<string, Coordinate> = {
  'atlanta, ga': [-84.388, 33.749],
  'charlotte, nc': [-80.843, 35.227],
  'chicago, il': [-87.6298, 41.8781],
  'dallas, tx': [-96.797, 32.7767],
  'denver, co': [-104.9903, 39.7392],
  'houston, tx': [-95.3698, 29.7604],
  'indianapolis, in': [-86.1581, 39.7684],
  'kansas city, mo': [-94.5786, 39.0997],
  'las vegas, nv': [-115.1398, 36.1699],
  'los angeles, ca': [-118.2437, 34.0522],
  'memphis, tn': [-90.049, 35.1495],
  'miami, fl': [-80.1918, 25.7617],
  'nashville, tn': [-86.7816, 36.1627],
  'newark, nj': [-74.1724, 40.7357],
  'orlando, fl': [-81.3792, 28.5383],
  'phoenix, az': [-112.074, 33.4484],
  'pittsburgh, pa': [-79.9959, 40.4406],
  'portland, or': [-122.6765, 45.5152],
  'salt lake city, ut': [-111.891, 40.7608],
  'seattle, wa': [-122.3321, 47.6062],
  'boston, ma': [-71.0589, 42.3601],
  'columbus, oh': [-82.9988, 39.9612],
  'new york, ny': [-74.006, 40.7128],
  'oklahoma city, ok': [-97.5164, 35.4676],
  'san antonio, tx': [-98.4936, 29.4241],
  'tampa, fl': [-82.4572, 27.9506],
};

const normalizePlace = (value: string) => value.trim().toLowerCase();

const lerpCoordinate = (from: Coordinate, to: Coordinate, progress: number): Coordinate => [
  from[0] + (to[0] - from[0]) * progress,
  from[1] + (to[1] - from[1]) * progress,
];

const progressForStatus = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase().replace(/[_-]/g, ' ');

  switch (normalizedStatus) {
    case 'at pickup':
    case 'carrier assigned':
    case 'dispatched':
      return 0.08;
    case 'picked up':
    case 'loaded':
      return 0.24;
    case 'in transit':
    case 'eta confirmed':
      return 0.58;
    case 'exception review':
    case 'exception':
      return 0.42;
    case 'arrived at delivery':
    case 'at delivery':
      return 0.86;
    case 'delivered':
    case 'unloaded':
    case 'pod received':
      return 1;
    default:
      return 0.18;
  }
};

export const ShipmentRouteMap: React.FC<ShipmentRouteMapProps> = ({ origin, destination, status }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapError, setMapError] = useState('');

  const route = useMemo(() => {
    const start = cityCoordinates[normalizePlace(origin)];
    const end = cityCoordinates[normalizePlace(destination)];
    if (!start || !end) return null;

    const truck = lerpCoordinate(start, end, progressForStatus(status));
    return { start, end, truck };
  }, [origin, destination, status]);

  useEffect(() => {
    if (!containerRef.current || !route) return;

    let isCancelled = false;
    let mapInstance: Map | null = null;

    const initializeMap = async () => {
      await import('maplibre-gl/dist/maplibre-gl.css');
      const { default: maplibregl } = await import('maplibre-gl');
      if (isCancelled || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: route.truck,
        zoom: 4,
        attributionControl: false,
      });

      mapRef.current = map;
      mapInstance = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    const loadRoute = () => {
      const line: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [route.start, route.end],
        },
      };

      map.addSource('shipment-route', {
        type: 'geojson',
        data: line,
      });

      map.addLayer({
        id: 'shipment-route-shadow',
        type: 'line',
        source: 'shipment-route',
        paint: {
          'line-color': '#090909',
          'line-width': 8,
          'line-opacity': 0.62,
        },
      });

      map.addLayer({
        id: 'shipment-route-line',
        type: 'line',
        source: 'shipment-route',
        paint: {
          'line-color': '#FF1A1A',
          'line-width': 4,
          'line-opacity': 0.95,
        },
      });

      new maplibregl.Marker({ color: '#FF3B30' }).setLngLat(route.start).setPopup(new maplibregl.Popup().setText(`Pickup: ${origin}`)).addTo(map);
      new maplibregl.Marker({ color: '#36D399' }).setLngLat(route.end).setPopup(new maplibregl.Popup().setText(`Delivery: ${destination}`)).addTo(map);
      new maplibregl.Marker({ color: status === 'Exception review' ? '#FF8A00' : '#FF1A1A' })
        .setLngLat(route.truck)
        .setPopup(new maplibregl.Popup().setText(`Current status: ${status}`))
        .addTo(map);

      map.fitBounds([route.start, route.end] as LngLatBoundsLike, {
        padding: { top: 70, right: 70, bottom: 70, left: 70 },
        maxZoom: 6,
        duration: 0,
      });
    };

      map.on('load', loadRoute);
      map.on('error', () => setMapError('Route map is temporarily unavailable.'));
    };

    void initializeMap();

    return () => {
      isCancelled = true;
      mapInstance?.remove();
      mapRef.current = null;
    };
  }, [destination, origin, route, status]);

  useEffect(() => {
    if (!mapRef.current || !route || !mapRef.current.getSource('shipment-route')) return;
    const source = mapRef.current.getSource('shipment-route') as GeoJSONSource;
    source.setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [route.start, route.end],
      },
    });
  }, [route]);

  if (!route) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-infamous-border bg-[#101010] p-6 text-center text-sm text-[#B88989]">
        Route map will appear after pickup and delivery coordinates are available.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-infamous-border bg-[#101010]">
      <div className="flex items-center justify-between gap-4 border-b border-infamous-border px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-orange">Live route</p>
          <h3 className="mt-1 text-lg font-bold text-[#F5E8E8]">{origin} to {destination}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[#F5E8E8]/80">
          MapLibre GL
        </span>
      </div>
      <div ref={containerRef} className="h-[320px] w-full sm:h-[380px]" aria-label={`Map route from ${origin} to ${destination}`} />
      {mapError ? <p className="border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{mapError}</p> : null}
    </section>
  );
};
