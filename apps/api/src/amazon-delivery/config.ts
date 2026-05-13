export type AmazonDeliveryConfig = {
  dryRun: boolean;
  endpoint: string;
  region: string;
  marketplaceId: string;
  lwaTokenUrl: string;
  lwaClientId?: string;
  lwaClientSecret?: string;
  lwaRefreshToken?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsSessionToken?: string;
};

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.startsWith('<')) return undefined;
  return trimmed;
}

function isEnabled(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export function getAmazonDeliveryConfig(env: NodeJS.ProcessEnv = process.env): AmazonDeliveryConfig {
  return {
    dryRun: isEnabled(env.AMAZON_DELIVERY_DRY_RUN, true),
    endpoint: clean(env.SP_API_ENDPOINT) ?? 'https://sellingpartnerapi-na.amazon.com',
    region: clean(env.SP_API_REGION) ?? 'us-east-1',
    marketplaceId: clean(env.SP_API_MARKETPLACE_ID) ?? 'ATVPDKIKX0DER',
    lwaTokenUrl: clean(env.SP_API_LWA_TOKEN_URL) ?? 'https://api.amazon.com/auth/o2/token',
    lwaClientId: clean(env.SP_API_LWA_CLIENT_ID),
    lwaClientSecret: clean(env.SP_API_LWA_CLIENT_SECRET),
    lwaRefreshToken: clean(env.SP_API_REFRESH_TOKEN),
    awsAccessKeyId: clean(env.SP_API_AWS_ACCESS_KEY_ID),
    awsSecretAccessKey: clean(env.SP_API_AWS_SECRET_ACCESS_KEY),
    awsSessionToken: clean(env.SP_API_AWS_SESSION_TOKEN),
  };
}

export function hasAmazonProductionCredentials(config: AmazonDeliveryConfig): boolean {
  return Boolean(
    config.lwaClientId &&
    config.lwaClientSecret &&
    config.lwaRefreshToken &&
    config.awsAccessKeyId &&
    config.awsSecretAccessKey,
  );
}

export function shouldUseAmazonDryRun(config: AmazonDeliveryConfig): boolean {
  return config.dryRun || !hasAmazonProductionCredentials(config);
}
