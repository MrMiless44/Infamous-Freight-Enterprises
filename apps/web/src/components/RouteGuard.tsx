import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';
import { ShieldX } from 'lucide-react';

type UserRole = 'owner' | 'admin' | 'dispatcher' | 'driver';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  dispatcher: 2,
  driver: 1,
};

function roleRank(role: string): number {
  return ROLE_HIERARCHY[role as UserRole] ?? 0;
}

interface RouteGuardProps {
  minRole: UserRole;
  children: ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ minRole, children }) => {
  const user = useAppStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roleRank(user.role) < roleRank(minRole)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <ShieldX className="mx-auto h-14 w-14 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-[#F5E8E8] mb-2">Access Restricted</h1>
          <p className="text-[#B88989] mb-6">
            This page requires {minRole}-level access. Your current role ({user.role}) does not have permission to view this content.
          </p>
          <Link
            to="/ops"
            className="inline-flex items-center gap-2 rounded-xl bg-infamous-red px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
