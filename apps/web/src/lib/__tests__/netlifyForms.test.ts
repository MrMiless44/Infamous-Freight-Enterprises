import { describe, expect, it, vi } from 'vitest';
import { encodeNetlifyForm, submitNetlifyForm } from '@/lib/netlifyForms';

describe('Netlify form submissions', () => {
  it('encodes submitted fields for Netlify form processing', () => {
    const encoded = encodeNetlifyForm({
      'form-name': 'contact',
      email: 'ops@example.com',
      message: 'Need a quote for a dry van lane',
    });

    expect(encoded).toContain('form-name=contact');
    expect(encoded).toContain('email=ops%40example.com');
    expect(encoded).toContain('message=Need+a+quote+for+a+dry+van+lane');
  });

  it('rejects invalid email addresses before posting', async () => {
    await expect(submitNetlifyForm('contact', { email: 'bad-address' })).rejects.toThrow('Enter a valid email address.');
  });

  it('rejects honeypot submissions before posting', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitNetlifyForm('contact', { email: 'lead@example.com', 'bot-field': 'spam' }))
      .rejects.toThrow('Submission blocked by spam protection.');
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('rejects delivery dates that are before pickup dates', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(submitNetlifyForm('quote-request', {
      email: 'ops@example.com',
      phone: '2145551212',
      pickupDate: '2026-06-10',
      deliveryDate: '2026-06-09',
    })).rejects.toThrow('Delivery date must be on or after the pickup date.');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
