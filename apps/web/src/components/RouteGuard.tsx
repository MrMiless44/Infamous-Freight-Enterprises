import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';

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
    return <Navigate to="/ops" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
