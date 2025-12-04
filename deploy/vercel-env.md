# Vercel Environment Variables

## Required
NEXT_PUBLIC_APP_NAME=Infæmous Freight
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_API_BASE=https://your-api.fly.dev/api

## Optional
STRIPE_PUBLIC_KEY=
PAYPAL_CLIENT_ID=

## Notes
- Only the web app is deployed to Vercel.
- All API calls route to Fly.io or Render via NEXT_PUBLIC_API_BASE.
- You may add custom-domain rewrites in vercel.json.
