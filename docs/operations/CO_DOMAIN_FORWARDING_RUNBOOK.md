# `.co` Domain Forwarding Runbook

## Purpose

Redirect the external `.co` domain to the canonical Infamous Freight production site.

The `.co` domain is currently served outside the connected Netlify project, so the effective fix must be applied in Manus, the domain registrar, or the DNS/web-forwarding provider that controls the `.co` domain.

## Best free/legal gateway

Use the dashboard that controls `infamousfreight.co`:

1. Manus domain/site settings, if Manus controls the domain.
2. Registrar forwarding settings, if the registrar controls web forwarding.
3. DNS/web-forwarding provider, if DNS points to a separate forwarding service.

## Exact forwarding rule

Preferred path-preserving rule:

```text
Source: https://infamousfreight.co/*
Destination: https://www.infamousfreight.com/:splat
Redirect type: 301 permanent
Path preservation: enabled if available
```

If the dashboard only supports a simple destination URL, use:

```text
https://www.infamousfreight.com
```

## Verification commands

Run after the Manus/registrar change:

```bash
curl -I https://infamousfreight.co
curl -I https://infamousfreight.co/pricing
```

Expected result:

```text
HTTP 301 or 302 to https://www.infamousfreight.com
```

Best result:

```text
https://infamousfreight.co/pricing -> https://www.infamousfreight.com/pricing
```

## Automation or repeatable loop

After each DNS/domain change:

1. Run both curl checks above.
2. Open the apex `.co` domain in a browser.
3. Open a deep path such as `/pricing`.
4. Confirm the final URL is on `www.infamousfreight.com`.
5. Record the evidence in `docs/LAUNCH_EVIDENCE_LOG.md`.

## Risk check

Do not point the `.co` domain directly at the Netlify app unless Netlify domain ownership and SSL are configured for that domain. A registrar or Manus 301 forward is lower risk.

## Fallback option

If true 301 forwarding is unavailable, use the provider's standard domain-forwarding feature to send all `.co` traffic to `https://www.infamousfreight.com`. Treat client-side redirects as temporary only.
