import { Bell, CircleDot, MapPin, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

const TopBar: React.FC = () => {
  const { user, sidebarOpen, unreadCount } = useAppStore();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <header role="banner" className={`h-16 bg-infamous-navy/85 backdrop-blur-xl border-b border-infamous-border flex items-center justify-between px-4 md:px-6 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
      {/* Command Center Title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-display text-base font-bold uppercase tracking-wide text-[#F5E8E8]">Command Center</h1>
          <p className="text-[11px] text-infamous-muted">Real-time operations overview</p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-infamous-red/30 bg-infamous-red/10 px-3 py-1 shadow-[0_0_14px_rgba(255,26,26,0.18)]">
          <CircleDot size={8} className="text-infamous-red-light animate-pulse" />
          <span className="text-[10px] text-infamous-red-light font-medium">Live</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Location */}
        <div className="hidden lg:flex items-center gap-1.5 text-infamous-muted">
          <MapPin size={12} />
          <span className="text-xs">Atlanta, GA</span>
        </div>

        {/* Date/Time */}
        <div className="hidden md:flex items-center gap-1.5 text-infamous-muted">
          <Calendar size={12} />
          <span className="text-xs font-mono">{dateStr} · {timeStr}</span>
        </div>

        {/* Notifications */}
        <button aria-label={`Open notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`} className="relative p-2 rounded-xl text-[#B88989] hover:text-[#F5E8E8] hover:bg-infamous-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red transition-all">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span aria-hidden="true" className="absolute top-1 right-1 w-4 h-4 bg-infamous-red rounded-full text-[9px] font-bold text-[#F5E8E8] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-infamous-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[#F5E8E8]">{user?.name || 'User'}</p>
            <p className="text-[10px] text-[#B88989]">{user?.role || 'Owner'}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-infamous-red via-infamous-ember to-infamous-red-dark flex items-center justify-center text-[#F5E8E8] font-bold text-sm shadow-[0_0_12px_rgba(255,26,26,0.4)]">
            {user?.name?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
