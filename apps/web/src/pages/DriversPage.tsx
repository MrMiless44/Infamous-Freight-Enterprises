import { useState } from 'react';
import { Users, MapPin, Clock, Star, Phone, Truck, TrendingUp, Award, Activity } from 'lucide-react';
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

const mockDrivers: Driver[] = [
  { id: '1', name: 'Marcus T.', status: 'driving', currentLocation: 'Springfield, MO', hosRemaining: 6.2, loadsToday: 2, revenueWeek: 5800, onTimePercent: 100, rating: 4.9, phone: '214-555-0101', truck: 'T-104', equipment: 'Dry Van', xp: 2450, level: 'Platinum' },
  { id: '2', name: 'James R.', status: 'on_duty', currentLocation: 'Atlanta, GA', hosRemaining: 4.1, loadsToday: 1, revenueWeek: 5200, onTimePercent: 95, rating: 4.7, phone: '404-555-0102', truck: 'T-105', equipment: 'Reefer', xp: 2180, level: 'Gold' },
  { id: '3', name: 'David K.', status: 'available', currentLocation: 'Houston, TX', hosRemaining: 10.5, loadsToday: 0, revenueWeek: 4700, onTimePercent: 93, rating: 4.8, phone: '713-555-0103', truck: 'T-106', equipment: 'Flatbed', xp: 1950, level: 'Gold' },
  { id: '4', name: 'Carlos M.', status: 'driving', currentLocation: 'Flagstaff, AZ', hosRemaining: 3.8, loadsToday: 1, revenueWeek: 4900, onTimePercent: 100, rating: 5.0, phone: '602-555-0104', truck: 'T-107', equipment: 'Dry Van', xp: 2100, level: 'Gold' },
  { id: '5', name: 'Robert L.', status: 'off_duty', currentLocation: 'Dallas, TX', hosRemaining: 11.0, loadsToday: 0, revenueWeek: 3800, onTimePercent: 88, rating: 4.5, phone: '469-555-0105', truck: 'T-108', equipment: 'Dry Van', xp: 1620, level: 'Silver' },
  { id: '6', name: 'Amir H.', status: 'available', currentLocation: 'Chicago, IL', hosRemaining: 9.2, loadsToday: 0, revenueWeek: 4200, onTimePercent: 96, rating: 4.8, phone: '312-555-0106', truck: 'T-109', equipment: 'Reefer', xp: 1840, level: 'Silver' },
];

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

  const filtered = mockDrivers.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">{mockDrivers.filter((d) => d.status === 'available').length} of {mockDrivers.length} drivers available · sample data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-infamous-card border border-infamous-border rounded-xl px-3 py-2">
            <Activity size={14} className="text-[#B88989]/70" />
            <span className="text-xs text-[#B88989]/70">Demo data</span>
          </div>
          <button className="btn-primary">+ Add Driver</button>
        </div>
      </div>

      {/* Stats */}
      <WidgetErrorBoundary label="Driver stats">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: mockDrivers.length, icon: <Users size={18} />, color: 'text-blue-400' },
          { label: 'Available Now', value: mockDrivers.filter((d) => d.status === 'available').length, icon: <Truck size={18} />, color: 'text-green-400' },
          { label: 'On the Road', value: mockDrivers.filter((d) => d.status === 'driving').length, icon: <MapPin size={18} />, color: 'text-infamous-orange' },
          { label: 'Weekly Revenue', value: `$${(mockDrivers.reduce((s, d) => s + d.revenueWeek, 0) / 1000).toFixed(1)}K`, icon: <TrendingUp size={18} />, color: 'text-purple-400' },
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
        <label htmlFor="drivers-search" className="sr-only">Search drivers</label>
        <input id="drivers-search" type="text" className="input-field flex-1 max-w-xs" placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <label htmlFor="drivers-status" className="sr-only">Filter drivers by status</label>
        <select id="drivers-status" className="input-field w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
