import { useState, useEffect } from 'react';
import { Users, MapPin, Clock, Star, Phone, Truck, TrendingUp, Award } from 'lucide-react';
import api from '@/api-client/client';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';

interface Driver {
  id: string;
  name: string;
  status: 'available' | 'driving' | 'on_duty' | 'off_duty';
  currentLocation: string;
  hosRemaining: number;
  loadsToday: number;
  revenueWeek: number;
  onTimePercent: number;
  rating: number;
  phone: string;
  truck: string;
  equipment: string;
  xp: number;
  level: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  available: { color: 'bg-green-500', label: 'Available' },
  driving: { color: 'bg-blue-500', label: 'Driving' },
  on_duty: { color: 'bg-yellow-500', label: 'On Duty' },
  off_duty: { color: 'bg-gray-500', label: 'Off Duty' },
};

const levelColor: Record<string, string> = {
  Platinum: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Gold: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Silver: 'text-[#F5E8E8]/80 bg-gray-500/10 border-gray-500/20',
};

const DriversPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDrivers().then((res: any) => {
      const mapped: Driver[] = (res.drivers || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        phone: d.phone || '',
        status: d.status === 'sleeper' ? 'off_duty' : d.status,
        currentLocation: d.currentLocation || '',
        hosRemaining: d.hosRemainingHours || 0,
        loadsToday: 0,
        revenueWeek: 0,
        onTimePercent: 0,
        rating: 0,
        truck: '—',
        equipment: '—',
        xp: 0,
        level: 'Silver',
      }));
      setDrivers(mapped);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const filtered = drivers.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Drivers</h1>
            <p className="text-sm text-[#B88989]/70 mt-0.5">Loading drivers...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-12 bg-infamous-dark rounded-xl mb-3" />
              <div className="h-20 bg-infamous-dark rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">{drivers.filter((d) => d.status === 'available').length} of {drivers.length} drivers available</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary">+ Add Driver</button>
        </div>
      </div>

      {/* Stats */}
      <WidgetErrorBoundary label="Driver stats">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: drivers.length, icon: <Users size={18} />, color: 'text-blue-400' },
          { label: 'Available Now', value: drivers.filter((d) => d.status === 'available').length, icon: <Truck size={18} />, color: 'text-green-400' },
          { label: 'On the Road', value: drivers.filter((d) => d.status === 'driving').length, icon: <MapPin size={18} />, color: 'text-infamous-orange' },
          { label: 'Weekly Revenue', value: `$${(drivers.reduce((s, d) => s + d.revenueWeek, 0) / 1000).toFixed(1)}K`, icon: <TrendingUp size={18} />, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="card flex items-center gap-3">
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-[#B88989]/70">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      </WidgetErrorBoundary>

      {/* Filters */}
      <div className="flex gap-3">
        <input type="text" className="input-field flex-1 max-w-xs" placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>available</option>
          <option>driving</option>
          <option>on_duty</option>
          <option>off_duty</option>
        </select>
      </div>

      {/* Driver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="No drivers found" description="Try adjusting your search or status filter" />
          </div>
        )}
        {filtered.map((driver) => {
          const status = statusConfig[driver.status];
          return (
            <div key={driver.id} className="card hover:border-infamous-border-light transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-infamous-orange to-infamous-orange-light flex items-center justify-center text-[#F5E8E8] font-bold text-lg flex-shrink-0">
                  {driver.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{driver.name}</h3>
                    <span className={`badge text-[10px] ${levelColor[driver.level]}`}>
                      <Award size={10} className="inline mr-0.5" />{driver.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span className="text-xs text-[#B88989]">{status.label}</span>
                    <span className="text-xs text-[#B88989]/60 ml-2">{driver.truck} · {driver.equipment}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-yellow-400">
                    <Star size={12} className="fill-yellow-400" />
                    <span className="text-xs font-medium">{driver.rating}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-infamous-dark rounded-lg p-2.5">
                  <p className="text-[10px] text-[#B88989]/70 uppercase">HOS Remaining</p>
                  <p className={`text-sm font-bold ${driver.hosRemaining < 3 ? 'text-red-400' : driver.hosRemaining < 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {driver.hosRemaining}h
                  </p>
                </div>
                <div className="bg-infamous-dark rounded-lg p-2.5">
                  <p className="text-[10px] text-[#B88989]/70 uppercase">Loads Today</p>
                  <p className="text-sm font-bold">{driver.loadsToday}</p>
                </div>
                <div className="bg-infamous-dark rounded-lg p-2.5">
                  <p className="text-[10px] text-[#B88989]/70 uppercase">Week Revenue</p>
                  <p className="text-sm font-bold text-infamous-orange">${driver.revenueWeek.toLocaleString()}</p>
                </div>
                <div className="bg-infamous-dark rounded-lg p-2.5">
                  <p className="text-[10px] text-[#B88989]/70 uppercase">On-Time</p>
                  <p className="text-sm font-bold text-green-400">{driver.onTimePercent}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-infamous-border">
                <div className="flex items-center gap-1 text-xs text-[#B88989]/70">
                  <MapPin size={10} />
                  <span className="truncate max-w-[140px]">{driver.currentLocation}</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-infamous-border text-[#B88989]/70 hover:text-[#F5E8E8] transition-colors">
                    <Phone size={12} />
                  </button>
                  <button className="p-1.5 rounded-lg bg-infamous-orange/10 text-infamous-orange hover:bg-infamous-orange hover:text-[#F5E8E8] transition-colors text-xs font-medium px-3">
                    Assign Load
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriversPage;
