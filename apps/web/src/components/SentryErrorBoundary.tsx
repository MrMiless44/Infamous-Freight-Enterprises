import { ReactElement, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

const DefaultFallback = (): ReactElement => (
  <div
    role="alert"
    className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center"
  >
    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
      This page didn't load.
    </h1>
    <p className="text-[#B88989]/60 max-w-md mb-6">
      We've alerted the team. Try reloading or head back to the dashboard —
      and double-check any recent unsaved changes.
    </p>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-md bg-infamous-orange text-[#F5E8E8] font-medium hover:opacity-90"
      >
        Reload
      </button>
      <a
        href="/"
        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
      >
        Go home
      </a>
    </div>
  </div>
);

type AppErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactElement;
};

export const AppErrorBoundary = ({ children, fallback }: AppErrorBoundaryProps) => (
  <Sentry.ErrorBoundary fallback={fallback ?? <DefaultFallback />}>
    {children}
  </Sentry.ErrorBoundary>
);

export const SentryErrorBoundary = Sentry.ErrorBoundary;
export default SentryErrorBoundary;
