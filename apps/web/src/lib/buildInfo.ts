/**
 * Build-time identification for the web bundle. Values are injected by Vite
 * via `define` in `vite.config.ts` and originate from CI environment
 * variables (`VITE_GIT_SHA` / `COMMIT_REF` and `VITE_BUILD_TIME`). Useful for
 * diagnostics — surface in support panels, error reports, and "About" UIs to
 * keep parity with the API's `/api/version` endpoint.
 */
export const BUILD_SHA: string =
  typeof __APP_BUILD_SHA__ === 'string' ? __APP_BUILD_SHA__ : 'unknown';

export const BUILD_TIME: string =
  typeof __APP_BUILD_TIME__ === 'string' ? __APP_BUILD_TIME__ : 'unknown';

export type BuildInfo = {
  sha: string;
  time: string;
};

export function getBuildInfo(): BuildInfo {
  return { sha: BUILD_SHA, time: BUILD_TIME };
}
