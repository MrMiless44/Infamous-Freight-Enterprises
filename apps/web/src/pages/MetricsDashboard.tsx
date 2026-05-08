import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Truck,
  DollarSign,
  Activity,
  Clock,
  Target,
  BarChart3,
  Map,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';

interface WeeklyMetric {
  label: string;
  current: number;
  previous: number;
  change: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface TopLane {
  origin: string;
  destination: string;
  loads: number;
  avgRate: number;
  change: number;
}

interface DriverLeader {
  name: string;
  loads: number;
  onTime: number;
  revenue: number;
  xp: number;
}

const MetricsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [metrics, setMetrics] = useState<WeeklyMetric[]>([]);
  const [topLanes, setTopLanes] = useState<TopLane[]>([]);
  const [driverLeaders, setDriverLeaders] = useState<DriverLeader[]>([]);

  useEffect(() => {
    // Simulated data - replace with actual API calls
    setMetrics([
      {
        label: 'Total Loads',
        current: 47,
        previous: 38,
        change: 23.7,
        target: 50,
        unit: 'loads',
        icon: <Truck size={20} />,
        color: 'text-blue-400'
      },
      {
        label: 'Revenue',
        current: 28400,
        previous: 22100,
        change: 28.5,
        target: 30000,
        unit: '$',
        icon: <DollarSign size={20} />,
        color: 'text-green-400'
      },
      {
        label: 'Active Drivers',
        current: 12,
        previous: 12,
        change: 0,
        target: 15,
        unit: 'drivers',
        icon: <Users size={20} />,
        color: 'text-purple-400'
      },
      {
        label: 'Avg Rate/Mile',
        current: 2.84,
        previous: 2.71,
        change: 4.8,
        target: 3.00,
        unit: '$/mi',
        icon: <Activity size={20} />,
        color: 'text-orange-400'
      },
      {
        label: 'Dispatch Time',
        current: 4.2,
        previous: 6.8,
        change: -38.2,
        target: 3.0,
        unit: 'min',
        icon: <Clock size={20} />,
        color: 'text-cyan-400'
      },
      {
        label: 'On-Time %',
        current: 94,
        previous: 89,
        change: 5.6,
        target: 95,
        unit: '%',
        icon: <Target size={20} />,
        color: 'text-emerald-400'
      }
    ]);

    setTopLanes([
      { origin: 'Chicago, IL', destination: 'Dallas, TX', loads: 8, avgRate: 2.91, change: 5.2 },
      { origin: 'Atlanta, GA', destination: 'Charlotte, NC', loads: 6, avgRate: 2.74, change: -2.1 },
      { origin: 'Houston, TX', destination: 'Phoenix, AZ', loads: 5, avgRate: 3.12, change: 8.4 },
      { origin: 'Memphis, TN', destination: 'Indianapolis, IN', loads: 4, avgRate: 2.68, change: 1.3 },
      { origin: 'Denver, CO', destination: 'Kansas City, MO', loads: 4, avgRate: 2.55, change: -4.5 }
    ]);

    setDriverLeaders([
      { name: 'Marcus T.', loads: 9, onTime: 100, revenue: 5800, xp: 2450 },
      { name: 'James R.', loads: 8, onTime: 95, revenue: 5200, xp: 2180 },
      { name: 'David K.', loads: 7, onTime: 93, revenue: 4700, xp: 1950 },
      { name: 'Carlos M.', loads: 7, onTime: 100, revenue: 4900, xp: 2100 },
      { name: 'Robert L.', loads: 6, onTime: 88, revenue: 3800, xp: 1620 }
    ]);
  }, [dateRange]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight size={14} className="text-green-400" />;
    if (change < 0) return <ArrowDownRight size={14} className="text-red-400" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getChangeColor = (change: number, metric: string) => {
    if (metric === 'Dispatch Time') {
      if (change < 0) return 'text-green-400';
      if (change > 0) return 'text-red-400';
    }
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const progressPercent = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Weekly Metrics</h1>
            <p className="text-gray-400 text-sm">Track your fleet performance at a glance · sample data</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-2">
              <Activity size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Demo data</span>
            </div>
            <div className="flex gap-2 bg-[#1a1a1a] rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dateRange === range
                    ? 'bg-[#ff3d00] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* KPI Cards */}
        <WidgetErrorBoundary label="KPI metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="bg-[#141414] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${metric.color} bg-[#1a1a1a] p-2.5 rounded-lg`}>
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(metric.change)}
                  <span className={`text-xs font-medium ${getChangeColor(metric.change, metric.label)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-gray-400 text-sm">{metric.label}</p>
                <p className="text-2xl font-bold">
                  {metric.unit === '$' ? '$' : ''}
                  {metric.current.toLocaleString()}
                  {metric.unit !== '$' ? ` ${metric.unit}` : ''}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Target: {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}</span>
                  <span className="text-gray-500">{progressPercent(metric.current, metric.target)}%</span>
                </div>
                <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercent(metric.current, metric.target) >= 100 ? 'bg-green-500' :
                      progressPercent(metric.current, metric.target) >= 75 ? 'bg-[#ff3d00]' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${progressPercent(metric.current, metric.target)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        </WidgetErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Lanes */}
          <WidgetErrorBoundary label="Top lanes">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Map size={18} className="text-[#ff3d00]" />
              <h2 className="text-lg font-semibold">Top Lanes</h2>
            </div>
            <div className="space-y-3">
              {topLanes.map((lane, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#222] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{lane.origin} → {lane.destination}</p>
                      <p className="text-xs text-gray-500">{lane.loads} loads this week</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${lane.avgRate.toFixed(2)}/mi</p>
                    <p className={`text-xs ${lane.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {lane.change >= 0 ? '+' : ''}{lane.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </WidgetErrorBoundary>

          {/* Driver Leaderboard */}
          <WidgetErrorBoundary label="Driver leaderboard">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-[#ff3d00]" />
              <h2 className="text-lg font-semibold">Driver Leaderboard</h2>
            </div>
            <div className="space-y-3">
              {driverLeaders.map((driver, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#222] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-gray-400/20 text-gray-300' :
                      i === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-[#222] text-gray-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{driver.name}</p>
                      <p className="text-xs text-gray-500">{driver.loads} loads • {driver.onTime}% on-time</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${driver.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-[#ff3d00]">
                      <Zap size={10} />
                      <span>{driver.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </WidgetErrorBoundary>
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 bg-gradient-to-r from-[#ff3d00]/10 to-transparent border border-[#ff3d00]/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-[#ff3d00]" />
            <h2 className="text-lg font-semibold">Week Summary</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-[#ff3d00]">47</p>
              <p className="text-xs text-gray-400">Loads Dispatched</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">$28.4k</p>
              <p className="text-xs text-gray-400">Revenue Generated</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">4.2 min</p>
              <p className="text-xs text-gray-400">Avg Dispatch Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">94%</p>
              <p className="text-xs text-gray-400">On-Time Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
