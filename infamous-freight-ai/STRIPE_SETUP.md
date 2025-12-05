# 🔐 Stripe Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Stripe Account
1. Visit: https://stripe.com/register
2. Sign up with your email
3. Verify email
4. Complete business profile

### Step 2: Get API Keys

#### For Testing (Use These First):
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Test Secret Key** (starts with `sk_test_`)
3. Copy your **Test Publishable Key** (starts with `pk_test_`)

#### For Production (After Testing):
1. Go to: https://dashboard.stripe.com/apikeys
2. **Activate your account** (requires business verification)
3. Copy your **Live Secret Key** (starts with `sk_live_`)
4. Copy your **Live Publishable Key** (starts with `pk_live_`)

### Step 3: Set Up Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://infamous-freight.fly.dev/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 4: Deploy to Fly.io

#### Using Test Keys (Recommended First):
```bash
# Set test keys
flyctl secrets set STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
flyctl secrets set STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
flyctl secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"
```

#### Using Live Keys (After Testing):
```bash
# Set live keys
flyctl secrets set STRIPE_SECRET_KEY="sk_live_YOUR_KEY_HERE"
flyctl secrets set STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_KEY_HERE"
flyctl secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"
```

### Step 5: Verify Setup

```bash
# Check secrets are set
flyctl secrets list

# Test the API
curl https://infamous-freight.fly.dev/api/billing/pricing

# Test in browser
open https://infamous-freight.fly.dev/pricing
```

---

## 🧪 Test Mode vs Live Mode

### Test Mode (Use First!)
- **Safe:** No real money involved
- **Test Cards:** Use `4242 4242 4242 4242` (any future date, any CVC)
- **Keys:** Start with `sk_test_` and `pk_test_`
- **Purpose:** Verify everything works before going live

### Live Mode (After Testing)
- **Real Money:** Actual charges to customers
- **Real Cards:** Customer credit/debit cards
- **Keys:** Start with `sk_live_` and `pk_live_`
- **Requirements:** Business verification completed

---

## 📝 Current Commands (DO THIS NOW)

### Option A: Quick Start with Test Keys (Recommended)

1. **Get test keys from Stripe Dashboard**
2. **Run these commands** (replace with your actual keys):

```bash
flyctl secrets set STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
flyctl secrets set STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
flyctl secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET"
```

### Option B: Environment File Method

Create a `.env.production` file:
```bash
cat > .env.production << 'EOF'
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
EOF

# Then set all at once
flyctl secrets import < .env.production
```

---

## ✅ Verification Checklist

After setting secrets:

- [ ] Run `flyctl secrets list` - Should show 3 Stripe keys
- [ ] Visit `https://infamous-freight.fly.dev/api/health` - Should return 200 OK
- [ ] Visit `https://infamous-freight.fly.dev/pricing` - Should show pricing table
- [ ] Click "Start Free Trial" - Should initiate Stripe checkout
- [ ] Use test card `4242 4242 4242 4242` - Should complete successfully
- [ ] Check Stripe Dashboard - Should show test payment

---

## 🚨 Security Notes

**DO NOT:**
- ❌ Commit keys to Git
- ❌ Share keys publicly
- ❌ Use live keys for testing
- ❌ Hardcode keys in source code

**DO:**
- ✅ Use test keys first
- ✅ Store keys in Fly.io secrets
- ✅ Rotate keys if exposed
- ✅ Use environment variables

---

## 🔗 Useful Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Test API Keys:** https://dashboard.stripe.com/test/apikeys
- **Live API Keys:** https://dashboard.stripe.com/apikeys
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Test Cards:** https://docs.stripe.com/testing
- **API Docs:** https://docs.stripe.com/api

---

## 🆘 Troubleshooting

### "Invalid API Key"
- Check you copied the full key (starts with `sk_test_` or `sk_live_`)
- Make sure no extra spaces before/after the key
- Verify you're using the correct mode (test vs live)

### "Webhook signature verification failed"
- Ensure webhook secret matches the endpoint
- Check endpoint URL is `https://infamous-freight.fly.dev/api/webhooks/stripe`
- Verify webhook is enabled in Stripe Dashboard

### "Cannot find secret"
- Run `flyctl secrets list` to verify secrets are set
- Run `flyctl secrets set KEY=value` again if missing
- Restart app: `flyctl apps restart infamous-freight`

---

## 📞 Support

- **Stripe Support:** https://support.stripe.com
- **Fly.io Docs:** https://fly.io/docs/reference/secrets/
- **GitHub Issues:** https://github.com/MrMiless44/Infamous-Freight-Enterprises/issues

---

**Next:** Once keys are set, test with card `4242 4242 4242 4242` on your pricing page! 🎉
