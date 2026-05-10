import React from 'react';
import { Award, Star, TrendingUp, Target, Truck, Clock, Zap, Trophy, Medal } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  avatar: string;
  level: string;
  xp: number;
  xpToNext: number;
  streak: number;
  loadsThisWeek: number;
  onTimePercent: number;
  revenueWeek: number;
  achievements: string[];
  rank: number;
}

const mockDrivers: Driver[] = [
  { id: '1', name: 'Marcus T.', avatar: 'M', level: 'Platinum', xp: 2450, xpToNext: 500, streak: 12, loadsThisWeek: 9, onTimePercent: 100, revenueWeek: 5800, achievements: ['Speed Demon', 'Perfect Week', 'Mile Master'], rank: 1 },
  { id: '2', name: 'James R.', avatar: 'J', level: 'Gold', xp: 2180, xpToNext: 320, streak: 8, loadsThisWeek: 8, onTimePercent: 95, revenueWeek: 5200, achievements: ['Rising Star', 'On-Time King'], rank: 2 },
  { id: '3', name: 'Carlos M.', avatar: 'C', level: 'Gold', xp: 2100, xpToNext: 400, streak: 15, loadsThisWeek: 7, onTimePercent: 100, revenueWeek: 4900, achievements: ['Streak Master'], rank: 3 },
  { id: '4', name: 'David K.', avatar: 'D', level: 'Gold', xp: 1950, xpToNext: 550, streak: 5, loadsThisWeek: 7, onTimePercent: 93, revenueWeek: 4700, achievements: ['Heavy Hauler'], rank: 4 },
  { id: '5', name: 'Amir H.', avatar: 'A', level: 'Silver', xp: 1840, xpToNext: 160, streak: 6, loadsThisWeek: 6, onTimePercent: 96, revenueWeek: 4200, achievements: ['Efficiency Pro'], rank: 5 },
  { id: '6', name: 'Robert L.', avatar: 'R', level: 'Silver', xp: 1620, xpToNext: 380, streak: 3, loadsThisWeek: 6, onTimePercent: 88, revenueWeek: 3800, achievements: [], rank: 6 },
];

const levelColors: Record<string, string> = {
  Platinum: 'from-purple-500 to-purple-700 border-purple-500/30',
  Gold: 'from-yellow-500 to-yellow-700 border-yellow-500/30',
  Silver: 'from-gray-400 to-gray-600 border-gray-500/30',
  Bronze: 'from-orange-600 to-orange-800 border-orange-600/30',
};

const DriverGamification: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy size={24} className="text-infamous-orange" />
            Driver Leaderboard
          </h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Track loads, on-time rate, and weekly revenue. Earn XP and badges for top performance.</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 pb-4">
        {[mockDrivers[1], mockDrivers[0], mockDrivers[2]].map((driver, i) => {
          const heights = ['h-32', 'h-44', 'h-36'];
          const medals = [<Medal size={24} className="text-[#F5E8E8]/80" />, <Trophy size={28} className="text-yellow-400" />, <Medal size={24} className="text-orange-400" />];
          const positions = [2, 1, 3];
          return (
            <div key={driver.id} className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${levelColors[driver.level]} flex items-center justify-center text-[#F5E8E8] font-bold text-lg border-2`}>
                  {driver.avatar}
                </div>
                <div className="absolute -top-3 -right-3">
                  {medals[i]}
                </div>
              </div>
              <p className="text-sm font-semibold">{driver.name}</p>
              <p className="text-xs text-[#B88989]/70">{driver.xp.toLocaleString()} XP</p>
              <div className={`w-24 ${heights[i]} rounded-t-xl bg-gradient-to-t from-infamous-card to-infamous-border border border-infamous-border flex items-end justify-center pb-2`}>
                <span className="text-lg font-bold text-infamous-orange">#{positions[i]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-infamous-border">
              <th className="table-header">Rank</th>
              <th className="table-header">Driver</th>
              <th className="table-header">Level</th>
              <th className="table-header text-right">XP</th>
              <th className="table-header text-center">Streak</th>
              <th className="table-header text-right">Loads</th>
              <th className="table-header text-right">On-Time</th>
              <th className="table-header text-right">Revenue</th>
              <th className="table-header">Badges</th>
            </tr>
          </thead>
          <tbody>
            {mockDrivers.map((d) => (
              <tr key={d.id} className="hover:bg-infamous-panel transition-colors">
                <td className="table-cell">
                  <span className={`font-bold ${d.rank <= 3 ? 'text-infamous-orange' : 'text-[#B88989]/70'}`}>#{d.rank}</span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${levelColors[d.level]} flex items-center justify-center text-[#F5E8E8] font-bold text-xs`}>
                      {d.avatar}
                    </div>
                    <span className="font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge text-[10px] bg-gradient-to-r ${levelColors[d.level]} bg-clip-text text-transparent border`}>
                    {d.level}
                  </span>
                </td>
                <td className="table-cell text-right font-mono text-sm">
                  <div>{d.xp.toLocaleString()}</div>
                  <div className="w-16 h-1 bg-infamous-border rounded-full ml-auto mt-1 overflow-hidden">
                    <div className="h-full bg-infamous-orange rounded-full" style={{ width: `${(d.xp / (d.xp + d.xpToNext)) * 100}%` }} />
                  </div>
                </td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap size={12} className={d.streak >= 7 ? 'text-infamous-orange' : 'text-[#B88989]/60'} />
                    <span className="text-sm">{d.streak}d</span>
                  </div>
                </td>
                <td className="table-cell text-right">{d.loadsThisWeek}</td>
                <td className="table-cell text-right">
                  <span className={d.onTimePercent >= 95 ? 'text-green-400' : d.onTimePercent >= 90 ? 'text-yellow-400' : 'text-red-400'}>
                    {d.onTimePercent}%
                  </span>
                </td>
                <td className="table-cell text-right font-medium">${d.revenueWeek.toLocaleString()}</td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    {d.achievements.slice(0, 2).map((a) => (
                      <span key={a} className="badge-orange text-[9px] py-0.5 px-1.5">
                        <Award size={8} className="inline mr-0.5" />{a}
                      </span>
                    ))}
                    {d.achievements.length > 2 && (
                      <span className="text-xs text-[#B88989]/60">+{d.achievements.length - 2}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Achievement Catalog */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Zap size={16} />, name: 'Speed Demon', desc: 'Book 5 loads in under 1 hour', earned: true },
          { icon: <Target size={16} />, name: 'Perfect Week', desc: '100% on-time for 7 days', earned: true },
          { icon: <Truck size={16} />, name: 'Mile Master', desc: 'Drive 3,000+ miles in a week', earned: true },
          { icon: <Star size={16} />, name: 'Rising Star', desc: 'Reach Gold level', earned: true },
          { icon: <Clock size={16} />, name: 'On-Time King', desc: '50 consecutive on-time deliveries', earned: false },
          { icon: <TrendingUp size={16} />, name: 'Revenue Crusher', desc: '$10K+ in a single week', earned: false },
          { icon: <Award size={16} />, name: 'Heavy Hauler', desc: 'Haul 40K+ lbs 10 times', earned: true },
          { icon: <Trophy size={16} />, name: 'Champion', desc: 'Reach #1 on leaderboard', earned: false },
        ].map((ach) => (
          <div
            key={ach.name}
            className={`p-4 rounded-xl border transition-all ${
              ach.earned
                ? 'bg-infamous-orange/5 border-infamous-orange/20 text-[#F5E8E8]'
                : 'bg-infamous-card border-infamous-border opacity-50'
            }`}
          >
            <div className={`mb-2 ${ach.earned ? 'text-infamous-orange' : 'text-[#B88989]/60'}`}>{ach.icon}</div>
            <p className="text-sm font-medium">{ach.name}</p>
            <p className="text-xs text-[#B88989]/70 mt-0.5">{ach.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverGamification;
