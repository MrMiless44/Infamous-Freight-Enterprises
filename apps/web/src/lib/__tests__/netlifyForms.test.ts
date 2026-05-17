import { describe, expect, it, vi } from 'vitest';
import { encodeNetlifyForm, submitNetlifyForm } from '../netlifyForms';

describe('netlify form helper', () => {
  it('adds encoded form metadata and submitted values', () => {
    const encoded = encodeNetlifyForm({
      'form-name': 'contact',
      email: 'ops@example.com',
      message: 'Need a quote for a dry van lane',
    });

    expect(encoded).toContain('form-name=contact');
    expect(encoded).toContain('email=ops%40example.com');
    expect(encoded).toContain('message=Need+a+quote+for+a+dry+van+lane');
  });

  it('rejects invalid email addresses before posting lead data', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(submitNetlifyForm('contact', {
      email: 'not-an-email',
      phone: '2145551212',
      message: 'Need dispatch follow-up',
    })).rejects.toThrow('Enter a valid email address.');

    expect(fetchMock).not.toHaveBeenCalled();
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
