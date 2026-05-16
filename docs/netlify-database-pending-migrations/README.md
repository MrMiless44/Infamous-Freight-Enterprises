# Pending Netlify Database migrations

These SQL files were moved out of `netlify/database/migrations` so Netlify deploy previews can build without provisioning a managed Database branch.

The production web deploy currently proxies API traffic to the Fly.io backend, and the Netlify Functions directory is disabled in `netlify.toml`. Move these files back to `netlify/database/migrations` only when the Netlify Database integration is intentionally re-enabled for the site.
