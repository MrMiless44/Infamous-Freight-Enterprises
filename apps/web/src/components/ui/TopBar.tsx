import { Bell, Search, Command, CircleDot } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

const TopBar: React.FC = () => {
  const { user, sidebarOpen, unreadCount } = useAppStore();

  return (
    <header role="banner" className={`h-16 bg-infamous-card/80 backdrop-blur-xl border-b border-infamous-border flex items-center justify-between px-6 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
      {/* Search */}
      <div role="search" aria-label="Global" className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <label htmlFor="global-search" className="sr-only">Search loads, drivers, brokers</label>
          <input
            id="global-search"
            type="text"
            placeholder="Search loads, drivers, brokers..."
            className="w-full bg-infamous-panel border border-infamous-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-infamous-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange transition-colors"
          />
          <div aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-600">
            <Command size={12} />
            <span className="text-[10px]">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button aria-label={`Open notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`} className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-infamous-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-orange transition-all">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-4 h-4 bg-infamous-orange rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 rounded-full border border-infamous-steel/20 bg-infamous-steel/10 px-3 py-1.5">
          <CircleDot size={10} className="text-infamous-steel animate-pulse" />
          <span className="text-xs text-infamous-steel font-medium">Live</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-infamous-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Owner'}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-infamous-orange via-infamous-amber to-infamous-steel flex items-center justify-center text-infamous-darker font-bold text-sm">
            {user?.name?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
