import { Router } from 'express';
import { DataStore } from '../data-store';
import {
  HttpError,
  wrapAsync,
  hasLeadHoneypotValue,
  isValidEmail,
  isValidDateString,
} from '../shared/http';

export function createLeadRoutes(dataStore: DataStore): Router {
  const router = Router();

  router.post('/quote', wrapAsync(async (req, res) => {
    if (hasLeadHoneypotValue(req.body)) {
      throw new HttpError(400, 'lead_honeypot_rejected', 'Lead submission was rejected.');
    }

    const { name, email, originCity, destCity, freightType, weight, pickupDate } = req.body ?? {};

    const missing: string[] = [];
    if (!name || typeof name !== 'string') missing.push('name');
    if (!isValidEmail(email)) missing.push('email');
    if (!originCity || typeof originCity !== 'string') missing.push('originCity');
    if (!destCity || typeof destCity !== 'string') missing.push('destCity');
    if (!freightType || typeof freightType !== 'string') missing.push('freightType');
    if (weight === undefined || weight === null || isNaN(parseFloat(String(weight)))) missing.push('weight');
    if (!isValidDateString(pickupDate)) missing.push('pickupDate');

    if (missing.length > 0) {
      throw new HttpError(
        400,
        'quote_lead_missing_fields',
        `Missing required fields: ${missing.join(', ')}.`,
      );
    }

    const data = await dataStore.submitQuoteLead({ ...req.body, source: 'quote-form' });
    res.status(201).json({ data });
  }));

  router.post('/demo', wrapAsync(async (req, res) => {
    if (hasLeadHoneypotValue(req.body)) {
      throw new HttpError(400, 'lead_honeypot_rejected', 'Lead submission was rejected.');
    }

    const { name, email } = req.body ?? {};

    if (!isValidEmail(email)) {
      throw new HttpError(400, 'demo_lead_missing_email', 'email is required.');
    }

    const data = await dataStore.submitQuoteLead({
      ...req.body,
      name: name ?? '',
      originCity: '',
      destCity: '',
      freightType: '',
      weight: 0,
      pickupDate: '',
      source: 'demo-request',
    });
    res.status(201).json({ data });
  }));

  router.post('/discount', wrapAsync(async (req, res) => {
    if (hasLeadHoneypotValue(req.body)) {
      throw new HttpError(400, 'lead_honeypot_rejected', 'Lead submission was rejected.');
    }

    const { email } = req.body ?? {};

    if (!isValidEmail(email)) {
      throw new HttpError(400, 'discount_lead_missing_email', 'email is required.');
    }

    const data = await dataStore.submitQuoteLead({
      ...req.body,
      name: '',
      originCity: '',
      destCity: '',
      freightType: '',
      weight: 0,
      pickupDate: '',
      source: req.body?.source ?? 'exit-intent',
    });
    res.status(201).json({ data });
  }));

  return router;
}
