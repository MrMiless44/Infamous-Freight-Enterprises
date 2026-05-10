import { describe, expect, it } from 'vitest';
import {
  isBillingAllowedPath,
  isPaidSubscription,
  normalizeSubscriptionStatus,
} from '../paywall';

describe('paywall.normalizeSubscriptionStatus', () => {
  it('returns the canonical lowercase status for known values', () => {
    expect(normalizeSubscriptionStatus('Active')).toBe('active');
    expect(normalizeSubscriptionStatus('TRIALING')).toBe('trialing');
    expect(normalizeSubscriptionStatus('past_due')).toBe('past_due');
  });

  it('falls back to "unknown" for non-string or unrecognized values', () => {
    expect(normalizeSubscriptionStatus(undefined)).toBe('unknown');
    expect(normalizeSubscriptionStatus(null)).toBe('unknown');
    expect(normalizeSubscriptionStatus(42)).toBe('unknown');
    expect(normalizeSubscriptionStatus('mystery')).toBe('unknown');
  });
});

describe('paywall.isPaidSubscription', () => {
  it('treats only active and trialing as paid', () => {
    expect(isPaidSubscription('active')).toBe(true);
    expect(isPaidSubscription('trialing')).toBe(true);
    expect(isPaidSubscription('past_due')).toBe(false);
    expect(isPaidSubscription('none')).toBe(false);
    expect(isPaidSubscription('unknown')).toBe(false);
  });
});

describe('paywall.isBillingAllowedPath', () => {
  it('allows exact and prefix matches for billing-related paths', () => {
    expect(isBillingAllowedPath('/billing')).toBe(true);
    expect(isBillingAllowedPath('/billing/cancel')).toBe(true);
    expect(isBillingAllowedPath('/pay-per-load')).toBe(true);
    expect(isBillingAllowedPath('/settings')).toBe(true);
    expect(isBillingAllowedPath('/settings/profile')).toBe(true);
  });

  it('rejects unrelated paths', () => {
    expect(isBillingAllowedPath('/loads')).toBe(false);
    expect(isBillingAllowedPath('/billings')).toBe(false);
    expect(isBillingAllowedPath('/')).toBe(false);
  });
});
