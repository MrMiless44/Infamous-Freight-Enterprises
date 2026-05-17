export type PublicEventName =
  | 'quote_cta_click'
  | 'tracking_cta_click'
  | 'pricing_cta_click'
  | 'portal_cta_click'
  | 'tracking_search'
  | 'driver_cta_click'
  | 'login_cta_click'
  | 'partner_cta_click'
  | 'contact_cta_click'
  | 'form_submit_success'
  | 'form_submit_error'
  | 'load_board_view'
  | 'load_board_filter'
  | 'load_board_book_click'
  | 'load_board_book_submit_success'
  | 'load_board_book_submit_error';

export type FunnelEventName =
  | 'funnel_landing_visit'
  | 'funnel_quote_request'
  | 'funnel_demo_request'
  | 'funnel_signup'
  | 'funnel_billing_start'
  | 'funnel_first_load'
  | 'funnel_first_dispatch'
  | 'funnel_first_pod';

export type PublicEventPayload = Record<string, string | number | boolean | undefined | null>;

type TrackedEvent = {
  eventName: PublicEventName | FunnelEventName;
  payload: PublicEventPayload;
  path: string;
  timestamp: string;
};

const safeWindow = (): Window | undefined => (typeof window === 'undefined' ? undefined : window);

const readStoredEvents = (currentWindow: Window, key: string): unknown[] => {
  try {
    const rawValue = currentWindow.localStorage.getItem(key);

    if (!rawValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const writeStoredEvents = (currentWindow: Window, key: string, events: unknown[]) => {
  try {
    currentWindow.localStorage.setItem(key, JSON.stringify(events));
  } catch {
    // Analytics storage must never block the freight app from rendering.
  }
};

const dispatchAnalyticsEvent = (currentWindow: Window, type: string, event: TrackedEvent) => {
  try {
    currentWindow.dispatchEvent(new CustomEvent(type, { detail: event }));
  } catch {
    // Browser extensions, privacy modes, or unsupported APIs should not break the app shell.
  }
};

export const trackPublicEvent = (eventName: PublicEventName, payload: PublicEventPayload = {}) => {
  const currentWindow = safeWindow();

  if (!currentWindow) {
    return;
  }

  const event: TrackedEvent = {
    eventName,
    payload,
    path: currentWindow.location.pathname,
    timestamp: new Date().toISOString(),
  };

  dispatchAnalyticsEvent(currentWindow, 'infamousfreight:analytics', event);

  const existing = readStoredEvents(currentWindow, 'infamous_public_events');
  const next = [...existing.slice(-49), event];
  writeStoredEvents(currentWindow, 'infamous_public_events', next);
};

export const trackFunnelEvent = (eventName: FunnelEventName, payload: PublicEventPayload = {}) => {
  const currentWindow = safeWindow();

  if (!currentWindow) {
    return;
  }

  const event: TrackedEvent = {
    eventName,
    payload,
    path: currentWindow.location.pathname,
    timestamp: new Date().toISOString(),
  };

  dispatchAnalyticsEvent(currentWindow, 'infamousfreight:funnel', event);

  const existing = readStoredEvents(currentWindow, 'infamous_funnel_events');
  const next = [...existing.slice(-99), event];
  writeStoredEvents(currentWindow, 'infamous_funnel_events', next);
};
