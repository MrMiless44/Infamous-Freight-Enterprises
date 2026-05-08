import { useState } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Star, Truck, Bookmark, Phone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/ui/EmptyState';

interface Load {
  id: string;
  broker: string;
  credit: 'A+' | 'A' | 'B' | 'C';
  origin: string;
  dest: string;
  distance: number;
  rate: number;
  ratePerMile: number;
  equipment: string;
  weight: number;
  pickup: string;
  age: string;
  isHot: boolean;
}

const mockLoads: Load[] = [
  { id: 'DAT-49201', broker: 'RXO', credit: 'A+', origin: 'Chicago, IL', dest: 'Dallas, TX', distance: 925, rate: 3200, ratePerMile: 3.46, equipment: 'Dry Van', weight: 32000, pickup: 'Today 2PM', age: '3m', isHot: true },
  { id: 'TS-77342', broker: 'TQL', credit: 'A', origin: 'Atlanta, GA', dest: 'Charlotte, NC', distance: 245, rate: 1850, ratePerMile: 2.71, equipment: 'Dry Van', weight: 28000, pickup: 'Tomorrow 8AM', age: '12m', isHot: false },
  { id: '123-11092', broker: 'Landstar', credit: 'A+', origin: 'Houston, TX', dest: 'Phoenix, AZ', distance: 1080, rate: 4100, ratePerMile: 3.80, equipment: 'Reefer', weight: 35000, pickup: 'Today 6PM', age: '8m', isHot: true },
  { id: 'DAT-49205', broker: 'JB Hunt', credit: 'A', origin: 'Memphis, TN', dest: 'Indianapolis, IN', distance: 380, rate: 2400, ratePerMile: 2.53, equipment: 'Flatbed', weight: 42000, pickup: 'Tomorrow 10AM', age: '25m', isHot: false },
  { id: 'TS-77348', broker: 'Schneider', credit: 'B', origin: 'Denver, CO', dest: 'Kansas City, MO', distance: 560, rate: 1950, ratePerMile: 2.19, equipment: 'Dry Van', weight: 25000, pickup: 'Today 4PM', age: '45m', isHot: false },
  { id: 'DAT-49211', broker: 'RXO', credit: 'A+', origin: 'Seattle, WA', dest: 'Portland, OR', distance: 175, rate: 1200, ratePerMile: 2.74, equipment: 'Dry Van', weight: 18000, pickup: 'Today 3PM', age: '1m', isHot: true },
];

const creditColor: Record<string, string> = { 'A+': 'badge-green', A: 'badge-blue', B: 'badge-yellow', C: 'badge-red' };

const LoadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState('All');
  const [minRate, setMinRate] = useState('');
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const filtered = mockLoads.filter((l) => {
    if (search && !(`${l.origin} ${l.dest} ${l.broker}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (equipment !== 'All' && l.equipment !== equipment) return false;
    if (minRate && l.ratePerMile < parseFloat(minRate)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Load Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sample loads from DAT, Truckstop, and 123Loadboard — searchable in one place.</p>
        </div>
        <button onClick={() => navigate('/rate-comparison')} className="btn-secondary flex items-center gap-2">
          <DollarSign size={16} /> Rate Tool
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <label htmlFor="loads-search" className="sr-only">Search loads by origin, destination, or broker</label>
          <input
            id="loads-search"
            type="text"
            className="input-field pl-10"
            placeholder="Search origin, destination, broker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label htmlFor="loads-equipment" className="sr-only">Equipment type</label>
        <select id="loads-equipment" className="input-field w-36" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
          <option>All Equipment</option>
          <option>Dry Van</option>
          <option>Reefer</option>
          <option>Flatbed</option>
          <option>Step Deck</option>
        </select>
        <label htmlFor="loads-min-rate" className="sr-only">Minimum rate per mile</label>
        <input id="loads-min-rate" type="number" className="input-field w-28" placeholder="Min $/mi" aria-label="Minimum rate per mile" value={minRate} onChange={(e) => setMinRate(e.target.value)} />
        <button className="btn-secondary flex items-center gap-2">
          <Filter size={16} aria-hidden="true" /> More Filters
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-white font-semibold">{filtered.length}</span> loads found
        <span className="text-gray-700">|</span>
        <span className="text-green-400">{filtered.filter((l) => l.isHot).length} hot loads</span>
        <span className="text-gray-700">|</span>
        <span>Updated 2 min ago</span>
      </div>

      {/* Load Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Truck size={40} />}
          title="No loads match your filters"
          description="Try adjusting your search, equipment type, or minimum rate to see available loads."
          action={
            <button onClick={() => { setSearch(''); setEquipment('All'); setMinRate(''); }} className="btn-secondary text-sm">
              Reset filters
            </button>
          }
        />
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((load) => (
          <div key={load.id} className="card hover:border-infamous-orange/30 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-600">{load.id}</span>
                <span className={creditColor[load.credit]}>{load.credit}</span>
                {load.isHot && <span className="badge-orange">🔥 Hot</span>}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const next = new Set(saved);
                    if (next.has(load.id)) next.delete(load.id);
                    else next.add(load.id);
                    setSaved(next);
                  }}
                  aria-label={saved.has(load.id) ? `Remove load ${load.id} from saved` : `Save load ${load.id}`}
                  aria-pressed={saved.has(load.id)}
                  className="p-1.5 rounded-lg hover:bg-infamous-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange"
                >
                  <Bookmark size={14} aria-hidden="true" className={saved.has(load.id) ? 'text-infamous-orange fill-infamous-orange' : 'text-gray-600'} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{load.origin}</p>
                <p className="text-xs text-gray-500">{load.pickup}</p>
              </div>
              <div className="flex flex-col items-center px-3">
                <span className="text-xs text-gray-600">{load.distance} mi</span>
                <div className="w-12 h-px bg-infamous-border my-1 relative">
                  <div className="absolute right-0 -top-1 w-0 h-0 border-l-4 border-l-gray-600 border-y-4 border-y-transparent" />
                </div>
                <span className="text-[10px] text-gray-600">{load.equipment}</span>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-semibold">{load.dest}</p>
                <p className="text-xs text-gray-500">{load.weight.toLocaleString()} lbs</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-infamous-border">
              <div>
                <p className="text-xl font-bold text-infamous-orange">${load.rate.toLocaleString()}</p>
                <p className="text-xs text-gray-500">${load.ratePerMile.toFixed(2)}/mi</p>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label={`Call broker ${load.broker} about load ${load.id}`}
                  className="p-2 rounded-lg bg-infamous-border hover:bg-infamous-border-light text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange"
                >
                  <Phone size={14} aria-hidden="true" />
                </button>
                <button className="btn-primary flex items-center gap-2 text-sm">
                  <Truck size={14} aria-hidden="true" /> Book Load
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default LoadsPage;
