export type SentryUploadInputs = {
  authToken?: string;
  org?: string;
  project?: string;
  disableUpload?: string;
};

const normalize = (value?: string): string => (typeof value === 'string' ? value.trim() : '');

const looksMaskedOrTemplateValue = (value: string): boolean =>
  value.startsWith('${') || value.includes('***');

const looksPlaceholderValue = (value: string, knownPlaceholders: readonly string[] = []): boolean => {
  const normalizedValue = value.toLowerCase();
  return knownPlaceholders.some((placeholder) => normalizedValue === placeholder.toLowerCase());
};

export const resolveSentryUploadConfig = (input: SentryUploadInputs) => {
  const normalizedSentryToken = normalize(input.authToken);
  const normalizedSentryOrg = normalize(input.org);
  const normalizedSentryProject = normalize(input.project);

  const hasSentryCredentials =
    Boolean(normalizedSentryToken) && Boolean(normalizedSentryOrg) && Boolean(normalizedSentryProject);

  const isLikelyPlaceholderSentryToken =
    looksMaskedOrTemplateValue(normalizedSentryToken) ||
    looksPlaceholderValue(normalizedSentryToken, ['changeme', 'your-sentry-auth-token']);
  const isLikelyPlaceholderSentryOrg =
    looksMaskedOrTemplateValue(normalizedSentryOrg) ||
    looksPlaceholderValue(normalizedSentryOrg, ['changeme', 'your-sentry-org']);
  const isLikelyPlaceholderSentryProject =
    looksMaskedOrTemplateValue(normalizedSentryProject) ||
    looksPlaceholderValue(normalizedSentryProject, ['changeme', 'your-sentry-project']);

  const disableSentryUpload =
    input.disableUpload === '1' || input.disableUpload?.toLowerCase() === 'true';

  const hasLikelyPlaceholderCredentials =
    isLikelyPlaceholderSentryToken || isLikelyPlaceholderSentryOrg || isLikelyPlaceholderSentryProject;

  return {
    normalizedSentryToken,
    normalizedSentryOrg,
    normalizedSentryProject,
    hasSentryCredentials,
    hasLikelyPlaceholderCredentials,
    enableSentryUpload: hasSentryCredentials && !hasLikelyPlaceholderCredentials && !disableSentryUpload,
  };
};
