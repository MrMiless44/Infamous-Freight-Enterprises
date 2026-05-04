export type PublicEventName =
  | 'quote_cta_click'
  | 'tracking_cta_click'
  | 'driver_cta_click'
  | 'login_cta_click'
  | 'partner_cta_click'
  | 'contact_cta_click'
  | 'form_submit_success'
  | 'form_submit_error';

export type PublicEventPayload = Record<string, string | number | boolean | undefined | null>;

const safeWindow = (): Window | undefined => (typeof window === 'undefined' ? undefined : window);

export const trackPublicEvent = (eventName: PublicEventName, payload: PublicEventPayload = {}) => {
  const currentWindow = safeWindow();

  if (!currentWindow) {
    return;
  }

  const event = {
    eventName,
    payload,
    path: currentWindow.location.pathname,
    timestamp: new Date().toISOString(),
  };

  currentWindow.dispatchEvent(new CustomEvent('infamousfreight:analytics', { detail: event }));

  const existing = JSON.parse(currentWindow.localStorage.getItem('infamous_public_events') ?? '[]') as unknown[];
  const next = [...existing.slice(-49), event];
  currentWindow.localStorage.setItem('infamous_public_events', JSON.stringify(next));
};
