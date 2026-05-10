import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';
import { canAccessLaunchValidation } from '@/lib/launchValidationAccess';
import {
  LayoutDashboard, Truck, Radio, Users, FileText, MessageSquare,
  TrendingUp, ShieldCheck, Settings, ChevronLeft, ChevronRight,
  LogOut, ClipboardCheck, ClipboardList, DollarSign, Infinity, type LucideIcon
} from 'lucide-react';
import { BRAND } from '@/lib/brand';

type UserRole = 'owner' | 'admin' | 'dispatcher' | 'driver';

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  end?: boolean;
  minRole?: UserRole;
};

const ROLE_RANK: Record<UserRole, number> = { owner: 4, admin: 3, dispatcher: 2, driver: 1 };

function meetsMinRole(userRole: string | undefined, minRole?: UserRole): boolean {
  if (!minRole) return true;
  return (ROLE_RANK[(userRole ?? 'driver') as UserRole] ?? 0) >= ROLE_RANK[minRole];
}

const baseNavItems: NavItem[] = [
  { path: '/ops', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/loads', label: 'Shipments', icon: Truck },
  { path: '/carriers', label: 'Carriers', icon: Users, minRole: 'admin' },
  { path: '/drivers', label: 'Drivers', icon: Users, minRole: 'dispatcher' },
  { path: '/dispatch', label: 'Dispatch', icon: Radio, minRole: 'dispatcher' },
  { path: '/accounting', label: 'Accounting', icon: DollarSign, minRole: 'admin' },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp, minRole: 'admin' },
  { path: '/quotes', label: 'Quotes', icon: ClipboardList, minRole: 'dispatcher' },
  { path: '/invoices', label: 'Invoices', icon: FileText, minRole: 'dispatcher' },
  { path: '/messages', label: 'Messages', icon: MessageSquare, badge: '3' },
  { path: '/compliance', label: 'Compliance', icon: ShieldCheck, minRole: 'admin' },
];

const launchValidationNavItem: NavItem = {
  path: '/launch-validation',
  label: 'Launch Validation',
  icon: ClipboardCheck,
};

const settingsNavItem: NavItem = { path: '/settings', label: 'Settings', icon: Settings, minRole: 'admin' };

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, logout, user } = useAppStore();
  const allItems: NavItem[] = canAccessLaunchValidation(user?.role)
    ? [...baseNavItems, launchValidationNavItem, settingsNavItem]
    : [...baseNavItems, settingsNavItem];
  const navItems = allItems.filter((item) => meetsMinRole(user?.role, item.minRole));

  return (
    <aside
      aria-label="Primary navigation"
      className={`fixed left-0 top-0 h-full bg-infamous-navy border-r border-infamous-border z-50 flex flex-col transition-all duration-300 max-md:hidden ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className={`flex items-center h-16 border-b border-infamous-border px-4 ${!sidebarOpen && 'justify-center'}`}>
        <div className="flex items-center gap-3">
          <Infinity size={sidebarOpen ? 28 : 22} className="text-infamous-red-light flex-shrink-0" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 10px rgba(255, 59, 48, 0.8))' }} />
          {sidebarOpen && (
            <div>
              <span className="font-display text-sm font-extrabold leading-none text-[#F5E8E8]">{BRAND.shortName}</span>
              <p className="text-[10px] text-infamous-muted leading-none">{BRAND.secondaryName}</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
          className={`ml-auto text-[#B88989] hover:text-[#F5E8E8] transition-colors p-1 rounded-lg hover:bg-infamous-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red ${!sidebarOpen && 'hidden'}`}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            aria-label={item.label}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
              isActive
                ? 'bg-infamous-red/10 text-infamous-red-light border border-infamous-red/20'
                : 'text-[#B88989] hover:text-[#F5E8E8] hover:bg-infamous-border/50'
            } ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-infamous-red-light' : 'text-[#B88989]/70 group-hover:text-[#F5E8E8]'} />
                {sidebarOpen && (
                  <>
                    <span aria-hidden="true" className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span aria-hidden="true" className="bg-infamous-red text-[#F5E8E8] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge && (
                  <span aria-hidden="true" className="absolute -top-1 -right-1 w-4 h-4 bg-infamous-red rounded-full text-[9px] font-bold text-[#F5E8E8] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`border-t border-infamous-border p-3 ${!sidebarOpen && 'flex justify-center'}`}>
        <button
          onClick={logout}
          aria-label="Log out"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[#B88989] hover:text-[#FF0033] hover:bg-[#FF0033]/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red ${!sidebarOpen && 'justify-center'}`}
          title="Log Out"
        >
          <LogOut size={18} />
          {sidebarOpen && <span className="text-sm font-medium">Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
