# DNS & Domain Configuration Guide

Complete guide for routing all Infamous Freight subdomains to the main website.

---

## 1. DNS Records Setup

### Primary Domain (infamousfreight.com)

```
Type    Name                    Value                           TTL
A       infamousfreight.com     75.2.60.5 (Netlify IP)         3600
AAAA    infamousfreight.com     2606:4700:4700::1111            3600
CNAME   www                     infamousfreight.netlify.app     3600
```

### Subdomain Redirects

All subdomains should point to the main Netlify site:

```
Type    Name                    Value                           TTL
CNAME   api                     infamousfreight.netlify.app     3600
CNAME   app                     infamousfreight.netlify.app     3600
CNAME   admin                   infamousfreight.netlify.app     3600
CNAME   dispatch                infamousfreight.netlify.app     3600
CNAME   driver                  infamousfreight.netlify.app     3600
CNAME   broker                  infamousfreight.netlify.app     3600
CNAME   carrier                 infamousfreight.netlify.app     3600
```

---

## 2. Netlify Domain Configuration

### Step 1: Add Custom Domain to Netlify

1. Go to Netlify Dashboard
2. Select your site (infamous-freight)
3. Go to **Site Settings** → **Domain Management**
4. Click **Add Custom Domain**
5. Enter: `www.infamousfreight.com`
6. Click **Verify**
7. Add DNS records as shown above

### Step 2: Configure Redirects

Netlify will automatically handle redirects via:
- `_redirects` file (in `apps/web/public/`)
- `netlify.toml` configuration

### Step 3: SSL/TLS Certificate

1. Netlify automatically provisions Let's Encrypt certificate
2. Certificate covers:
   - www.infamousfreight.com
   - infamousfreight.com
   - All configured subdomains
3. Auto-renewal enabled

---

## 3. Subdomain Routing Strategy

### Option A: CNAME to Netlify (Recommended)

All subdomains point to Netlify, which handles routing:

```
api.infamousfreight.com    → CNAME → infamousfreight.netlify.app
app.infamousfreight.com    → CNAME → infamousfreight.netlify.app
admin.infamousfreight.com  → CNAME → infamousfreight.netlify.app
```

**Advantages:**
- Simple DNS configuration
- Netlify handles all routing
- Single SSL certificate
- Easy to manage

**Configuration in Netlify:**
```toml
# netlify.toml
[[redirects]]
  from = "https://api.infamousfreight.com/*"
  to = "https://www.infamousfreight.com/"
  status = 301
  force = true

[[redirects]]
  from = "https://app.infamousfreight.com/*"
  to = "https://www.infamousfreight.com/"
  status = 301
  force = true
```

### Option B: Separate DNS Records

Each subdomain has its own A/AAAA record:

```
Type    Name                    Value
A       api                     75.2.60.5
A       app                     75.2.60.5
A       admin                   75.2.60.5
```

**Advantages:**
- More control
- Can route to different servers

**Disadvantages:**
- More DNS records to manage
- Multiple SSL certificates needed

---

## 4. SSL/TLS Certificate Management

### Automatic (Recommended)

Netlify automatically:
1. Provisions Let's Encrypt certificate
2. Covers all domains and subdomains
3. Auto-renews 30 days before expiry
4. Enforces HTTPS

### Manual (If Needed)

1. Go to **Site Settings** → **Domain Management**
2. Click **SSL/TLS Certificate**
3. Choose certificate type:
   - **Automatic (default)** - Let's Encrypt
   - **Custom** - Upload your own certificate

---

## 5. Verify Configuration

### Test DNS Resolution

```bash
# Check DNS records
nslookup www.infamousfreight.com
nslookup api.infamousfreight.com
nslookup app.infamousfreight.com

# Check CNAME records
dig www.infamousfreight.com CNAME
dig api.infamousfreight.com CNAME

# Check A records
dig www.infamousfreight.com A
dig api.infamousfreight.com A
```

### Test HTTPS

```bash
# Check SSL certificate
curl -I https://www.infamousfreight.com
curl -I https://api.infamousfreight.com
curl -I https://app.infamousfreight.com

# Verify certificate chain
openssl s_client -connect www.infamousfreight.com:443
```

### Test Redirects

```bash
# Test redirect from subdomain to main site
curl -I https://api.infamousfreight.com/
curl -I https://app.infamousfreight.com/
curl -I https://admin.infamousfreight.com/

# Should return 301 redirect to https://www.infamousfreight.com/
```

---

## 6. Troubleshooting

### DNS Not Resolving

1. **Check DNS propagation:**
   - Use https://www.whatsmydns.net/
   - Enter domain name
   - Wait for global propagation (up to 48 hours)

2. **Verify DNS records:**
   ```bash
   dig +short www.infamousfreight.com
   ```

3. **Check Netlify DNS:**
   - Go to Netlify Dashboard
   - Site Settings → Domain Management
   - Verify nameservers are correct

### SSL Certificate Issues

1. **Certificate not issued:**
   - Wait 24 hours for Let's Encrypt
   - Check Netlify notifications

2. **Mixed content warnings:**
   - Ensure all resources use HTTPS
   - Update external links

3. **Certificate mismatch:**
   - Verify domain is correctly configured
   - Check certificate details

### Redirects Not Working

1. **Check _redirects file:**
   ```bash
   cat apps/web/public/_redirects
   ```

2. **Verify netlify.toml:**
   ```bash
   cat apps/web/netlify.toml
   ```

3. **Test redirect:**
   ```bash
   curl -v https://api.infamousfreight.com/
   ```

4. **Check Netlify logs:**
   - Go to Netlify Dashboard
   - Deploys → Select latest deploy
   - Check build logs

---

## 7. DNS Provider Specific Instructions

### Cloudflare

1. Go to **DNS** tab
2. Add CNAME records:
   ```
   Type    Name    Content                         Proxy
   CNAME   www     infamousfreight.netlify.app     Proxied
   CNAME   api     infamousfreight.netlify.app     Proxied
   CNAME   app     infamousfreight.netlify.app     Proxied
   ```
3. Set SSL/TLS to "Full"
4. Enable "Always Use HTTPS"

### Route 53 (AWS)

1. Go to **Hosted Zones**
2. Select your domain
3. Create record:
   - **Name:** www.infamousfreight.com
   - **Type:** CNAME
   - **Value:** infamousfreight.netlify.app
4. Repeat for subdomains

### GoDaddy

1. Go to **DNS Management**
2. Add CNAME record:
   - **Host:** www
   - **Points to:** infamousfreight.netlify.app
   - **TTL:** 1 hour
3. Repeat for subdomains

### Google Domains

1. Go to **DNS** settings
2. Click **Manage custom records**
3. Add CNAME:
   - **DNS name:** www
   - **Type:** CNAME
   - **TTL:** 3600
   - **Data:** infamousfreight.netlify.app
4. Repeat for subdomains

---

## 8. Monitoring & Maintenance

### Monthly Checks

- [ ] Verify DNS records are correct
- [ ] Check SSL certificate expiry
- [ ] Test all subdomains
- [ ] Review Netlify analytics
- [ ] Check for security warnings

### Annual Tasks

- [ ] Review domain registration
- [ ] Update DNS provider if needed
- [ ] Audit SSL certificate
- [ ] Review redirect rules
- [ ] Update DNS records if needed

---

## 9. Deployment Checklist

- [ ] DNS records configured
- [ ] Netlify domain added
- [ ] SSL certificate issued
- [ ] _redirects file in place
- [ ] netlify.toml configured
- [ ] All subdomains tested
- [ ] HTTPS enforced
- [ ] Redirects working
- [ ] Analytics enabled
- [ ] Monitoring configured

---

## Next Steps

1. Configure DNS records with your provider
2. Add custom domain to Netlify
3. Wait for DNS propagation (up to 48 hours)
4. Verify SSL certificate is issued
5. Test all subdomains
6. Monitor for any issues
