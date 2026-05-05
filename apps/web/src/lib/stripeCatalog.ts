export type StripeCatalogCta = {
  label: string;
  href: string;
};

export type StripeCatalogPlan = {
  name: string;
  price: string;
  cadence?: string;
  tagline: string;
  features: string[];
  cta: StripeCatalogCta;
  secondaryCta?: StripeCatalogCta;
  highlighted?: boolean;
};

export const STRIPE_SUBSCRIPTION_PLANS: StripeCatalogPlan[] = [
  {
    name: 'Starter',
    price: '$99',
    cadence: '/month',
    tagline: 'Perfect for small freight operations getting organized fast.',
    features: [
      'Up to 10 drivers',
      'Core dispatch workspace',
      'Quote, booking, and tracking tools',
      'Proof-of-delivery workflow',
      'Standard support',
    ],
    cta: {
      label: 'Start monthly',
      href: 'https://buy.stripe.com/aFa9AU0qScHh3dH1WLeME0b',
    },
    secondaryCta: {
      label: 'Pay yearly — $1,089/year',
      href: 'https://buy.stripe.com/4gMaEY4H87mXeWpcBpeME0e',
    },
  },
  {
    name: 'Professional',
    price: '$499',
    cadence: '/month',
    tagline: 'For growing freight companies that need stronger automation.',
    features: [
      'Up to 50 drivers',
      'Advanced dispatch and operations features',
      'SMS workflows',
      'API access',
      'Priority support',
    ],
    cta: {
      label: 'Start monthly',
      href: 'https://buy.stripe.com/cNi3cwgpQ8r1cOh58XeME0c',
    },
    secondaryCta: {
      label: 'Pay yearly — $5,389/year',
      href: 'https://buy.stripe.com/14A8wQ5Lc6iT01v7h5eME0f',
    },
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$2,000',
    cadence: '/month',
    tagline: 'For large enterprises running high-volume freight operations.',
    features: [
      'Unlimited drivers',
      'White-label options',
      'Custom integrations',
      'Dedicated support',
      'Enterprise operations setup',
    ],
    cta: {
      label: 'Start monthly',
      href: 'https://buy.stripe.com/7sY14o0qS8r115z30PeME0d',
    },
    secondaryCta: {
      label: 'Pay yearly — $21,600/year',
      href: 'https://buy.stripe.com/9B63cw6PgePp01vcBpeME0g',
    },
  },
];

export const STRIPE_ADD_ON_PLANS: StripeCatalogPlan[] = [
  {
    name: 'AI Action Pack 2,000',
    price: '$50',
    tagline: 'One-time add-on for load recommendations, dispatch drafts, broker summaries, rate checks, and document workflow automation.',
    features: ['2,000 additional AI actions', 'One-time purchase', 'Works with active platform workflows'],
    cta: {
      label: 'Buy add-on',
      href: 'https://buy.stripe.com/4gMaEY0qSgXxg0t6d1eME0h',
    },
  },
  {
    name: 'AI Action Pack 10,000',
    price: '$200',
    tagline: 'One-time add-on for higher-volume dispatch automation, document workflows, broker checks, and rate intelligence.',
    features: ['10,000 additional AI actions', 'One-time purchase', 'Built for busier operations'],
    cta: {
      label: 'Buy add-on',
      href: 'https://buy.stripe.com/9B6cN67Tk22D15zdFteME0i',
    },
  },
  {
    name: 'AI Action Pack 50,000',
    price: '$750',
    tagline: 'One-time add-on for enterprise-level freight automation and high-volume AI workflows.',
    features: ['50,000 additional AI actions', 'One-time purchase', 'Best for high-volume teams'],
    cta: {
      label: 'Buy add-on',
      href: 'https://buy.stripe.com/8x200kddE22DbKd8l9eME0j',
    },
    highlighted: true,
  },
  {
    name: 'Document AI Pack 500',
    price: '$50',
    tagline: 'One-time add-on for AI document scans, including BOL/POD extraction, invoice field extraction, and paperwork automation.',
    features: ['500 additional AI document scans', 'BOL/POD extraction', 'Invoice field extraction'],
    cta: {
      label: 'Buy add-on',
      href: 'https://buy.stripe.com/dRm5kEc9Aaz97tX8l9eME0k',
    },
  },
  {
    name: 'Voice AI Minutes 1,000',
    price: '$200',
    tagline: 'One-time add-on for call automation, voice booking workflows, and dispatch phone assistance.',
    features: ['1,000 Voice AI minutes', 'Call automation', 'Dispatch phone assistance'],
    cta: {
      label: 'Buy add-on',
      href: 'https://buy.stripe.com/6oU8wQ7Tk36H9C50SHeME0l',
    },
  },
];
