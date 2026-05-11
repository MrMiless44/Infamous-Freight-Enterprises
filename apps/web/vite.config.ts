import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { resolveSentryUploadConfig } from './sentryUploadConfig';

const sentryConfig = resolveSentryUploadConfig({
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableUpload: process.env.SENTRY_DISABLE_UPLOAD,
});
// Build identification surfaced into the bundle for diagnostics. Falls back to
// 'unknown' so dev builds still type-check; CI/Netlify can populate these.
const buildGitSha =
  process.env.VITE_GIT_SHA ?? process.env.COMMIT_REF ?? process.env.GIT_SHA ?? 'unknown';
const buildTime = process.env.VITE_BUILD_TIME ?? new Date().toISOString();
// Enable Sentry uploads when credentials exist, but allow CI to opt out
// and avoid hard build failures on auth issues.
if (sentryConfig.hasSentryCredentials && sentryConfig.hasLikelyPlaceholderCredentials) {
  console.warn('[sentry-vite-plugin] source-map upload disabled: SENTRY_* credentials appear to be placeholders or masked values.');
}
const uploadSourcemaps =
  sentryConfig.enableSentryUpload || process.env.SENTRY_SOURCEMAPS === '1';

const requestedMinifier = process.env.VITE_MINIFIER === 'esbuild' ? 'esbuild' : 'terser';

export default defineConfig({
  define: {
    __APP_BUILD_SHA__: JSON.stringify(buildGitSha),
    __APP_BUILD_TIME__: JSON.stringify(buildTime),
  },
  plugins: [
    react(),
    ...(sentryConfig.enableSentryUpload
      ? [
          sentryVitePlugin({
            org: sentryConfig.normalizedSentryOrg,
            project: sentryConfig.normalizedSentryProject,
            authToken: sentryConfig.normalizedSentryToken,
            errorHandler: (error) => {
              const message = error.message ?? String(error);
              console.warn('[sentry-vite-plugin] source-map upload skipped:', message);
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Keep terser as the default minifier for conservative output compatibility,
    // but allow faster CI builds with VITE_MINIFIER=esbuild when needed.
    minify: requestedMinifier,
    terserOptions: {
      format: {
        comments: false,
      },
    },
    esbuild: {
      legalComments: 'none',
    },
    sourcemap: uploadSourcemaps ? 'hidden' : false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/recharts/')) return 'charts';
          if (id.includes('/@stripe/')) return 'stripe';
          if (id.includes('/@sentry/')) return 'vendor-sentry';
          if (id.includes('/@supabase/')) return 'vendor-supabase';
          if (id.includes('/framer-motion/')) return 'vendor-motion';
          if (id.includes('/socket.io-client/') || id.includes('/engine.io-client/')) return 'vendor-socket';
          if (id.includes('/react-router-dom/') || id.includes('/react-router/')) return 'vendor-router';
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
});
