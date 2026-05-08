type EnvRule = {
  name: string;
  required: boolean;
  validate?: (value: string) => boolean;
};

const API_ENV_RULES: EnvRule[] = [
  { name: 'DATABASE_URL', required: true, validate: (v) => v.startsWith('postgres') },
  { name: 'PORT', required: false, validate: (v) => /^\d+$/.test(v) },
  { name: 'CORS_ORIGINS', required: true },
  { name: 'STRIPE_SECRET_KEY', required: true, validate: (v) => v.startsWith('sk_') },
  { name: 'STRIPE_WEBHOOK_SECRET', required: true, validate: (v) => v.startsWith('whsec_') },
  { name: 'STRIPE_CHECKOUT_SUCCESS_URL', required: true, validate: (v) => v.startsWith('http') },
  { name: 'STRIPE_CHECKOUT_CANCEL_URL', required: true, validate: (v) => v.startsWith('http') },
  { name: 'STRIPE_PORTAL_RETURN_URL', required: true, validate: (v) => v.startsWith('http') },
  { name: 'SUPABASE_URL', required: true, validate: (v) => v.startsWith('http') },
  { name: 'SUPABASE_SERVICE_KEY', required: true },
  { name: 'WEB_APP_URL', required: true, validate: (v) => v.startsWith('http') },
];

type ValidationResult = {
  valid: boolean;
  missing: string[];
  invalid: string[];
};

export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const rule of API_ENV_RULES) {
    const value = process.env[rule.name];

    if (!value || value.trim().length === 0) {
      if (rule.required) {
        missing.push(rule.name);
      }
      continue;
    }

    if (rule.validate && !rule.validate(value)) {
      invalid.push(rule.name);
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

export function assertEnvironment(): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const result = validateEnvironment();

  if (result.missing.length > 0) {
    console.error(`Missing required environment variables: ${result.missing.join(', ')}`);
  }

  if (result.invalid.length > 0) {
    console.error(`Invalid environment variable format: ${result.invalid.join(', ')}`);
  }

  if (!result.valid) {
    throw new Error(
      `Environment validation failed. Missing: [${result.missing.join(', ')}]. Invalid: [${result.invalid.join(', ')}].`,
    );
  }
}
