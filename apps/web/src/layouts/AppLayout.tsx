import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
        // Refuse to mount an authenticated session without a tenant scope.
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
        // Default to least-privilege role; elevate via verified user_metadata only.
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

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-infamous-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-infamous-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-sm">Loading {BRAND.displayName}...</p>
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
            style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' },
          }}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-infamous-dark overflow-hidden">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {offlineBanner}
        <TopBar />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 6000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#4caf50', secondary: '#1a1a1a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a1a' } },
        }}
      />
    </div>
  );
};

export default AppLayout;
