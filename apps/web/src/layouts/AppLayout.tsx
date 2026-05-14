import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';
import { getSupabase } from '@/hooks/useSupabase';
import { isPublicPath } from '@/lib/routes';
import {
  isBillingAllowedPath,
  isPaidSubscription,
  normalizeSubscriptionStatus,
} from '@/lib/paywall';
import { resolveRouteReadiness } from '@/lib/routeReadiness';
import Sidebar from '@/components/ui/Sidebar';
import TopBar from '@/components/ui/TopBar';
import { BRAND } from '@/lib/brand';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, MessageSquare, Truck, User } from 'lucide-react';

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

  const readinessNotice = useMemo(() => resolveRouteReadiness(location.pathname), [location.pathname]);

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
        readinessNotice.state === 'demo'
          ? 'bg-blue-950/80 text-blue-100 border-blue-800/70'
          : readinessNotice.state === 'live'
            ? 'bg-emerald-950/80 text-emerald-100 border-emerald-800/70'
            : 'bg-red-950/80 text-red-100 border-red-800/70'
      }`}
    >
      {readinessNotice.state === 'demo'
        ? 'Demo-backed surface:'
        : readinessNotice.state === 'live'
          ? 'Production-ready surface:'
          : 'Not ready for production:'}{' '}
      {readinessNotice.message}
    </div>
  ) : null;

  const notReadyGate = readinessNotice?.state === 'not_ready' ? (
    <section className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-800/80 bg-red-950/40 p-6 text-red-50">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-200">Authenticated route unavailable</p>
      <h1 className="mt-2 text-2xl font-bold">This surface is not ready for live operations</h1>
      <p className="mt-3 text-sm text-red-100/90">
        {readinessNotice.message} Route readiness statuses are tracked in <code>docs/current-status.md</code>.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to="/ops"
          className="inline-flex items-center justify-center rounded-xl bg-infamous-red px-4 py-2 text-sm font-semibold text-[#F5E8E8] hover:brightness-110 transition"
        >
          Back to operations dashboard
        </Link>
        <Link
          to="/request-quote"
          className="inline-flex items-center justify-center rounded-xl border border-red-200/30 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-900/40 transition"
        >
          Open public quote intake
        </Link>
      </div>
    </section>
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
          {notReadyGate ?? <Outlet />}
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
