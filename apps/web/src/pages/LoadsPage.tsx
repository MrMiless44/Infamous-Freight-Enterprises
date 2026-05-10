import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Star, Truck, Bookmark, Phone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/api-client/client';
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

const creditColor: Record<string, string> = { 'A+': 'badge-green', A: 'badge-blue', B: 'badge-yellow', C: 'badge-red' };

const LoadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState('All');
  const [minRate, setMinRate] = useState('');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getLoads().then((res) => {
      if (cancelled) return;
      const mapped: Load[] = (res.loads || []).map((l: Record<string, unknown>) => {
        const miles = Number(l.miles) || 0;
        const rate = Number(l.rate) || 0;
        return {
          id: (l.trackingNumber as string) || (l.id as string),
          broker: (l.shipperName as string) || '—',
          credit: 'A' as const,
          origin: l.origin as string,
          dest: l.destination as string,
          distance: miles,
          rate,
          ratePerMile: miles > 0 ? Math.round((rate / miles) * 100) / 100 : 0,
          equipment: l.equipment as string,
          weight: Number(l.weightLbs) || 0,
          pickup: l.pickupAt ? new Date(l.pickupAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—',
          age: '—',
          isHot: l.status === 'available',
        };
      });
      setLoads(mapped);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = loads.filter((l) => {
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
          <p className="text-sm text-[#B88989]/70 mt-0.5">Search and book available loads</p>
        </div>
        <button onClick={() => navigate('/rate-comparison')} className="btn-secondary flex items-center gap-2">
          <DollarSign size={16} /> Rate Tool
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B88989]/60" />
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-infamous-orange border-t-transparent" />
        </div>
      ) : (
      <>
      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-[#B88989]/70">
        <span className="text-[#F5E8E8] font-semibold">{filtered.length}</span> loads found
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
                <span className="text-xs font-mono text-[#B88989]/60">{load.id}</span>
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
                  <Bookmark size={14} aria-hidden="true" className={saved.has(load.id) ? 'text-infamous-orange fill-infamous-orange' : 'text-[#B88989]/60'} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{load.origin}</p>
                <p className="text-xs text-[#B88989]/70">{load.pickup}</p>
              </div>
              <div className="flex flex-col items-center px-3">
                <span className="text-xs text-[#B88989]/60">{load.distance} mi</span>
                <div className="w-12 h-px bg-infamous-border my-1 relative">
                  <div className="absolute right-0 -top-1 w-0 h-0 border-l-4 border-l-gray-600 border-y-4 border-y-transparent" />
                </div>
                <span className="text-[10px] text-[#B88989]/60">{load.equipment}</span>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-semibold">{load.dest}</p>
                <p className="text-xs text-[#B88989]/70">{load.weight.toLocaleString()} lbs</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-infamous-border">
              <div>
                <p className="text-xl font-bold text-infamous-orange">${load.rate.toLocaleString()}</p>
                <p className="text-xs text-[#B88989]/70">${load.ratePerMile.toFixed(2)}/mi</p>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label={`Call broker ${load.broker} about load ${load.id}`}
                  className="p-2 rounded-lg bg-infamous-border hover:bg-infamous-border-light text-[#B88989] hover:text-[#F5E8E8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange"
                >
                  <Phone size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.bookLoad(load.id);
                      toast.success(`Load ${load.id} booked successfully`);
                    } catch {
                      toast.error(`Failed to book load ${load.id}`);
                    }
                  }}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Truck size={14} aria-hidden="true" /> Book Load
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      </>
      )}
    </div>
  );
};

export default LoadsPage;
