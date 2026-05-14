import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';
import { getSupabase } from '@/hooks/useSupabase';
import { isPublicPath } from '@/lib/routes';
import {
  isBillingAllowedPath,
  isPaidSubscription,
  normalizeSubscriptionStatus,
} from '@/lib/paywall';
import Sidebar from '@/components/ui/Sidebar';
import TopBar from '@/components/ui/TopBar';
import { BRAND } from '@/lib/brand';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, MessageSquare, Truck, User } from 'lucide-react';

type RouteReadiness = {
  tone: 'demo' | 'hardening';
  message: string;
};

const routeReadinessMap: Record<string, RouteReadiness> = {
  '/ops': {
    tone: 'demo',
    message: 'This dashboard currently includes sample operational data while live services are being wired in.',
  },
  '/analytics': {
    tone: 'hardening',
    message: 'Analytics is still being hardened. Treat figures here as non-final until production data verification is complete.',
  },
  '/compliance': {
    tone: 'hardening',
    message: 'Compliance surfaces are still being hardened. Verify critical actions and records against source systems before relying on them operationally.',
  },
  '/carriers': {
    tone: 'hardening',
    message: 'Carrier management is still being hardened. Confirm workflow completeness before using it as the sole production workflow.',
  },
  '/accounting': {
    tone: 'hardening',
    message: 'Accounting surfaces are still being hardened. Validate finance-critical outputs before operational use.',
  },
  '/quotes': {
    tone: 'hardening',
    message: 'Quote operations are still being hardened. Double-check live quote state before customer-facing use.',
  },
};

const AppLayout: React.FC = () => {
  const { sidebarOpen, isLoading, user, setUser, setLoading, logout } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      logout();
      setLoading(false);
      if (!isPublicPath(location.pathname)) {
        navigate('/login', { replace: true });
      }
      return;
    }

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!session) {
        logout();
        if (!isPublicPath(location.pathname)) {
          navigate('/login', { replace: true });
        }
        setLoading(false);
        return;
      }

      const carrierId = session.user.user_metadata?.carrierId;
      if (!carrierId) {
        logout();
        if (!isPublicPath(location.pathname)) {
          navigate('/login', { replace: true });
        }
        setLoading(false);
        return;
      }

      const subscriptionStatus = normalizeSubscriptionStatus(
        session.user.app_metadata?.subscription_status ??
          session.user.user_metadata?.subscriptionStatus ??
          session.user.user_metadata?.subscription_status ??
          session.user.user_metadata?.billingStatus ??
          session.user.user_metadata?.billing_status ??
          'none'
      );

      localStorage.setItem('infamous_token', session.access_token);
      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
        role: session.user.user_metadata?.role ?? 'driver',
        carrierId,
        subscriptionStatus,
      });
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate, setLoading, setUser, logout]);

  useEffect(() => {
    if (isLoading || isPublicPath(location.pathname) || isBillingAllowedPath(location.pathname)) {
      return;
    }

    if (user && !isPaidSubscription(user.subscriptionStatus)) {
      navigate('/billing', { replace: true, state: { from: location.pathname } });
    }
  }, [isLoading, location.pathname, navigate, user]);

  const readinessNotice = useMemo(() => {
    const matchedPath = Object.keys(routeReadinessMap).find((path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
    return matchedPath ? routeReadinessMap[matchedPath] : null;
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-infamous-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-infamous-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#B88989] text-sm">Loading {BRAND.displayName}...</p>
        </div>
      </div>
    );
  }

  const offlineBanner = isOffline ? (
    <div
      role="status"
      aria-live="polite"
      className="bg-yellow-600 text-black text-center text-sm py-1 px-3"
    >
      You are offline — recent changes may not save until your connection returns.
    </div>
  ) : null;

  const readinessBanner = readinessNotice ? (
    <div
      role="note"
      aria-live="polite"
      className={`text-sm px-4 py-2 border-b ${
        readinessNotice.tone === 'demo'
          ? 'bg-blue-950/80 text-blue-100 border-blue-800/70'
          : 'bg-amber-950/80 text-amber-100 border-amber-800/70'
      }`}
    >
      {readinessNotice.tone === 'demo' ? 'Demo-backed surface:' : 'Still being hardened:'} {readinessNotice.message}
    </div>
  ) : null;

  if (isPublicPath(location.pathname)) {
    return (
      <>
        {offlineBanner}
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 6000,
            style: { background: '#241013', color: '#F5E8E8', border: '1px solid #3A0D12' },
          }}
        />
      </>
    );
  }

  return (
    <div className="ops-shell flex h-screen w-screen bg-infamous-dark overflow-hidden">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} max-md:!ml-0`}>
        {offlineBanner}
        {readinessBanner}
        <TopBar />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-infamous-border bg-infamous-navy md:hidden" aria-label="Mobile navigation">
        <div className="flex items-center justify-around py-2">
          {[
            { to: '/ops', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/loads', icon: Truck, label: 'Loads' },
            { to: '/messages', icon: MessageSquare, label: 'Messages' },
            { to: '/settings', icon: User, label: 'Account' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 ${isActive ? 'text-infamous-red-light' : 'text-[#B88989]/70'}`
              }
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 6000,
          style: {
            background: '#241013',
            color: '#F5E8E8',
            border: '1px solid #3A0D12',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#36D399', secondary: '#241013' } },
          error: { iconTheme: { primary: '#FF0033', secondary: '#241013' } },
        }}
      />
    </div>
  );
};

export default AppLayout;
