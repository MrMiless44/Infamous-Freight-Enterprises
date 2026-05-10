import { describe, expect, it } from 'vitest';
import { resolveSentryUploadConfig } from './sentryUploadConfig';

describe('resolveSentryUploadConfig', () => {
  it('enables upload for valid credentials', () => {
    const result = resolveSentryUploadConfig({
      authToken: ' token ',
      org: ' org ',
      project: ' project ',
    });

    expect(result.enableSentryUpload).toBe(true);
    expect(result.normalizedSentryToken).toBe('token');
    expect(result.normalizedSentryOrg).toBe('org');
    expect(result.normalizedSentryProject).toBe('project');
  });

  it('disables upload for placeholder token', () => {
    const result = resolveSentryUploadConfig({
      authToken: 'your-sentry-auth-token',
      org: 'infmous',
      project: 'infamous-freight',
    });

    expect(result.hasLikelyPlaceholderCredentials).toBe(true);
    expect(result.enableSentryUpload).toBe(false);
  });

  it('disables upload when explicitly disabled (case-insensitive)', () => {
    const result = resolveSentryUploadConfig({
      authToken: 'token',
      org: 'infmous',
      project: 'infamous-freight',
      disableUpload: 'TRUE',
    });

    expect(result.enableSentryUpload).toBe(false);
  });

  it('disables upload for masked/template org or project values', () => {
    const withMaskedOrg = resolveSentryUploadConfig({
      authToken: 'token',
      org: '***',
      project: 'infamous-freight',
    });
    const withTemplateProject = resolveSentryUploadConfig({
      authToken: 'token',
      org: 'infmous',
      project: '${SENTRY_PROJECT}',
    });

    expect(withMaskedOrg.enableSentryUpload).toBe(false);
    expect(withTemplateProject.enableSentryUpload).toBe(false);
  });

  it('disables upload when any credential is missing after trim', () => {
    const result = resolveSentryUploadConfig({
      authToken: ' token ',
      org: '   ',
      project: 'project',
    });

    expect(result.hasSentryCredentials).toBe(false);
    expect(result.enableSentryUpload).toBe(false);
  });

});
