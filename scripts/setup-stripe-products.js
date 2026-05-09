#!/usr/bin/env node
/**
 * Infamous Freight — Stripe Products Setup
 * Creates all pricing plans, coupons, and webhook configuration
 * 
 * Usage: node scripts/setup-stripe-products.js
 * Requires: STRIPE_SECRET_KEY environment variable
 */

const Stripe = require('stripe');

const LEGAL_BUSINESS_NAME = 'INFAMOUS FREIGHT';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

const expectedStripeAccountId = process.env.STRIPE_ACCOUNT_ID?.trim();

const PRODUCTS = {
  starter: {
    name: 'Infamous Freight — Starter',
    description: 'Perfect for owner-operators and small fleets (1-5 trucks)',
    features: [
      'Up to 5 drivers',
      '50 loads/month',
      'Basic load board search',
      'Digital BOL/POD',
      'Email support',
    ],
  },
  growth: {
    name: 'Infamous Freight — Growth',
    description: 'For growing fleets with dispatch teams (5-25 trucks)',
    features: [
      'Unlimited drivers',
      'Unlimited loads',
      'Auto-dispatch AI',
      'Rate negotiation bot',
      'Voice booking',
      'ELD sync (all providers)',
      'Driver payroll',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Infamous Freight — Enterprise',
    description: 'For large fleets with custom needs (25+ trucks)',
    features: [
      'Everything in Growth',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'SLA guarantee',
      'Onboarding specialist',
    ],
  },
  pay_per_load: {
    name: 'Infamous Freight — Pay Per Load',
    description: 'Flexibility for occasional haulers',
    features: [
      'No monthly fee',
      'Pay only per load booked',
      'Full feature access',
    ],
  },
};

async function createProducts() {
  console.log('🚛 Infamous Freight — Stripe Products Setup\n');

  for (const [key, product] of Object.entries(PRODUCTS)) {
    console.log(`Creating: ${product.name}...`);

    // Create product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      features: product.features.map(f => ({ name: f })),
      metadata: { plan_key: key, legal_business_name: LEGAL_BUSINESS_NAME },
    });

    console.log(`  ✅ Product: ${stripeProduct.id}`);

    // Create prices based on plan
    if (key === 'pay_per_load') {
      // Metered usage price
      const price = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: 299, // $2.99 in cents
        currency: 'usd',
        recurring: {
          usage_type: 'metered',
          interval: 'month',
        },
        nickname: 'Pay Per Load — Monthly Metered',
      });
      console.log(`  ✅ Price: ${price.id} ($2.99/load, metered)`);
    } else if (key === 'enterprise') {
      // No fixed price — contact sales
      console.log(`  ℹ️  Enterprise: No fixed price (contact sales)`);
    } else {
      // Monthly price with trial
      const monthlyPrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: key === 'starter' ? 4900 : 9900, // $49 or $99 in cents
        currency: 'usd',
        recurring: {
          interval: 'month',
          trial_period_days: 14,
        },
        nickname: `${product.name} — Monthly`,
      });
      console.log(`  ✅ Monthly: ${monthlyPrice.id} ($${key === 'starter' ? 49 : 99}/mo, 14-day trial)`);

      // Annual price (20% off)
      const annualPrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: key === 'starter' ? 47040 : 95040, // 20% off annual
        currency: 'usd',
        recurring: {
          interval: 'year',
          trial_period_days: 14,
        },
        nickname: `${product.name} — Annual (20% off)`,
      });
      console.log(`  ✅ Annual: ${annualPrice.id} (20% off)\n`);
    }
  }
}

async function createCoupon() {
  console.log('🏷️  Creating Founding 50 coupon...');

  const coupon = await stripe.coupons.create({
    name: 'Founding 50 — 40% Off Forever',
    percent_off: 40,
    duration: 'forever',
    max_redemptions: 50,
    metadata: {
      campaign: 'founding_50',
      description: 'First 50 customers get 40% off for life',
    },
  });

  console.log(`  ✅ Coupon: ${coupon.id} (40% off, max 50 redemptions)\n`);

  // Create promotion code
  const promoCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: 'FOUNDING50',
    metadata: {
      source: 'product_launch',
    },
  });

  console.log(`  ✅ Promo Code: FOUNDING50 (${promoCode.id})\n`);
}

async function setupWebhook() {
  console.log('🔔 Configuring webhook endpoint...');
  console.log('  ℹ️  Manual step required in Stripe Dashboard:');
  console.log('     https://dashboard.stripe.com/webhooks');
  console.log('');
  console.log('  Add endpoint: https://api.infamousfreight.com/stripe/webhook');
  console.log('  Select events:');
  console.log('    - checkout.session.completed');
  console.log('    - invoice.paid');
  console.log('    - invoice.payment_failed');
  console.log('    - customer.subscription.created');
  console.log('    - customer.subscription.updated');
  console.log('    - customer.subscription.deleted');
  console.log('');
}

async function setupCustomerPortal() {
  console.log('🚪 Configuring customer portal...');
  console.log('  ℹ️  Manual step required in Stripe Dashboard:');
  console.log('     https://dashboard.stripe.com/settings/billing/portal');
  console.log('');
  console.log('  Enable:');
  console.log('    ☑ Allow customers to update payment methods');
  console.log('    ☑ Allow customers to update subscriptions');
  console.log('    ☑ Allow customers to cancel subscriptions');
  console.log('    ☑ Show billing history');
  console.log('');
}

async function main() {
  try {
    // Verify Stripe key
    const account = await stripe.accounts.retrieve();
    if (expectedStripeAccountId && account.id !== expectedStripeAccountId) {
      throw new Error('STRIPE_SECRET_KEY is connected to a different Stripe account than STRIPE_ACCOUNT_ID');
    }

    const accountLabel = account.settings?.dashboard?.display_name || account.id;
    console.log(`Connected to Stripe account: ${accountLabel}\n`);

    await createProducts();
    await createCoupon();
    await setupWebhook();
    await setupCustomerPortal();

    console.log('✅ Stripe setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Copy the Price IDs above into your .env file');
    console.log('  2. Configure the webhook endpoint in Stripe Dashboard');
    console.log('  3. Set up the customer portal in Stripe Dashboard');
    console.log('  4. Test with: npm run test:stripe');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
