import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, Method } from 'axios';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/app-store';

// Empty string means "same origin" — the Netlify /api/* proxy forwards requests
// to the Fly.io backend. Set VITE_API_URL to an absolute URL (e.g.
// https://api.infamousfreight.com) only when bypassing the proxy.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

function isRetryable(error: AxiosError): boolean {
  if (!error.response) return true;
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
}

function retryDelay(attempt: number, error: AxiosError): number {
  const retryAfter = error.response?.headers?.['retry-after'];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds) && seconds > 0 && seconds <= 60) return seconds * 1000;
  }
  return RETRY_BASE_MS * 2 ** attempt;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('infamous_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<{ message?: string }>) => {
        const config = error.config as AxiosRequestConfig & { _retryCount?: number };
        const attempt = config?._retryCount ?? 0;

        if (config && attempt < MAX_RETRIES && isRetryable(error)) {
          config._retryCount = attempt + 1;
          await sleep(retryDelay(attempt, error));
          return this.client.request(config);
        }

        const message = error.response?.data?.message || error.message || 'Something went wrong';

        if (error.response?.status === 401) {
          // Centralize logout so the React tree updates synchronously and
          // route guards (in AppLayout) handle navigation — avoid a hard
          // window.location reload that would discard in-progress drafts.
          useAppStore.getState().logout();
          toast.error('Session expired — please log in again');
        } else if (error.response?.status === 429) {
          toast.error('Rate limit exceeded — please slow down');
        } else if (error.response?.status === 500) {
          toast.error('Server error — our team has been notified');
        } else {
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Legacy convenience methods include planned endpoints from earlier product
  // slices. New code should prefer focused clients under src/lib that map to
  // implemented Express routes documented in docs/API-REFERENCE.md.

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    if (data.token) localStorage.setItem('infamous_token', data.token);
    return data;
  }

  async register(email: string, password: string, companyName: string, role?: string) {
    const { data } = await this.client.post('/auth/register', { email, password, companyName, role });
    if (data.token) localStorage.setItem('infamous_token', data.token);
    return data;
  }

  async me() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  async updateProfile(updates: { name?: string; phone?: string; avatar_url?: string }) {
    const { data } = await this.client.patch('/auth/me', updates);
    return data;
  }

  // Loads
  async getLoads(status?: string) {
    const { data } = await this.client.get('/loads', { params: status ? { status } : {} });
    return data;
  }

  async searchLoads(filters: Record<string, unknown>) {
    const { data } = await this.client.get('/loads/search', { params: filters });
    return data;
  }

  async bookLoad(loadId: string, driverId?: string) {
    const { data } = await this.client.post('/loads/book', { loadId, driverId });
    return data;
  }

  async getLoad(loadId: string) {
    const { data } = await this.client.get(`/loads/${loadId}`);
    return data;
  }

  async createLoad(loadData: Record<string, unknown>) {
    const { data } = await this.client.post('/loads', loadData);
    return data;
  }

  async updateLoad(loadId: string, updates: Record<string, unknown>) {
    const { data } = await this.client.patch(`/loads/${loadId}`, updates);
    return data;
  }

  async updateLoadStatus(loadId: string, status: string, notes?: string) {
    const { data } = await this.client.post(`/loads/${loadId}/status`, { status, notes });
    return data;
  }

  async getLoadTimeline(loadId: string) {
    const { data } = await this.client.get(`/loads/${loadId}/timeline`);
    return data;
  }

  // Companies
  async getCompanies(type?: string) {
    const { data } = await this.client.get('/companies', { params: type ? { type } : {} });
    return data;
  }

  async getCompany(companyId: string) {
    const { data } = await this.client.get(`/companies/${companyId}`);
    return data;
  }

  async createCompany(companyData: Record<string, unknown>) {
    const { data } = await this.client.post('/companies', companyData);
    return data;
  }

  async updateCompany(companyId: string, updates: Record<string, unknown>) {
    const { data } = await this.client.patch(`/companies/${companyId}`, updates);
    return data;
  }

  // Drivers
  async getDrivers() {
    const { data } = await this.client.get('/drivers');
    return data;
  }

  async getDriver(driverId: string) {
    const { data } = await this.client.get(`/drivers/${driverId}`);
    return data;
  }

  async updateDriverHOS(driverId: string) {
    const { data } = await this.client.get(`/eld/drivers/${driverId}/hos`);
    return data;
  }

  // Dispatch
  async getDispatchBoard() {
    const { data } = await this.client.get('/dispatch/board');
    return data;
  }

  async autoDispatch(loadId: string) {
    const { data } = await this.client.post('/dispatch/auto', { loadId });
    return data;
  }

  async getBackhauls(driverId: string) {
    const { data } = await this.client.get(`/dispatch/backhauls/${driverId}`);
    return data;
  }

  // Invoices
  async getInvoices(status?: string) {
    const { data } = await this.client.get('/invoices', { params: { status } });
    return data;
  }

  async getInvoice(invoiceId: string) {
    const { data } = await this.client.get(`/invoices/${invoiceId}`);
    return data;
  }

  async createInvoice(invoiceData: Record<string, unknown>) {
    const { data } = await this.client.post('/invoices', invoiceData);
    return data;
  }

  async updateInvoice(invoiceId: string, updates: Record<string, unknown>) {
    const { data } = await this.client.patch(`/invoices/${invoiceId}`, updates);
    return data;
  }

  // Payments
  async createCheckoutSession(invoiceId: string, successUrl?: string, cancelUrl?: string) {
    const { data } = await this.client.post('/payments/checkout', { invoiceId, successUrl, cancelUrl });
    return data;
  }

  async getInvoicePayments(invoiceId: string) {
    const { data } = await this.client.get(`/payments/invoice/${invoiceId}`);
    return data;
  }

  // Quotes / Pricing
  async getQuotes(status?: string) {
    const { data } = await this.client.get('/quotes', { params: status ? { status } : {} });
    return data;
  }

  async getQuote(quoteId: string) {
    const { data } = await this.client.get(`/quotes/${quoteId}`);
    return data;
  }

  async createQuote(quoteData: Record<string, unknown>) {
    const { data } = await this.client.post('/quotes', quoteData);
    return data;
  }

  async updateQuote(quoteId: string, updates: Record<string, unknown>) {
    const { data } = await this.client.patch(`/quotes/${quoteId}`, updates);
    return data;
  }

  async convertQuoteToLoad(quoteId: string) {
    const { data } = await this.client.post(`/quotes/${quoteId}/convert`);
    return data;
  }

  async getFreightEstimate(params: { equipment?: string; miles: number; weight?: number; margin?: number }) {
    const { data } = await this.client.get('/quotes/estimate', { params });
    return data;
  }

  // Documents
  async uploadDocument(file: File, loadId?: string, type?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (loadId) formData.append('loadId', loadId);
    if (type) formData.append('type', type);
    const { data } = await this.client.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  async getLoadDocuments(loadId: string) {
    const { data } = await this.client.get(`/documents/load/${loadId}`);
    return data;
  }

  async getDocumentMeta(docId: string) {
    const { data } = await this.client.get(`/documents/${docId}`);
    return data;
  }

  async downloadDocument(docId: string) {
    const response = await this.client.get(`/documents/${docId}/download`, { responseType: 'blob' });
    return response.data;
  }

  async deleteDocument(docId: string) {
    const { data } = await this.client.delete(`/documents/${docId}`);
    return data;
  }

  // GPS Tracking
  async recordPosition(position: { loadId?: string; driverId?: string; lat: number; lng: number; speedMph?: number; heading?: number; address?: string }) {
    const { data } = await this.client.post('/tracking/positions', position);
    return data;
  }

  async recordPositionBatch(positions: Array<{ loadId?: string; driverId?: string; lat: number; lng: number }>) {
    const { data } = await this.client.post('/tracking/positions/batch', { positions });
    return data;
  }

  async getLoadPositions(loadId: string, limit?: number) {
    const { data } = await this.client.get(`/tracking/load/${loadId}/positions`, { params: limit ? { limit } : {} });
    return data;
  }

  async getLoadRoute(loadId: string) {
    const { data } = await this.client.get(`/tracking/load/${loadId}/route`);
    return data;
  }

  async getDriverLatestPosition(driverId: string) {
    const { data } = await this.client.get(`/tracking/driver/${driverId}/latest`);
    return data;
  }

  // Notifications
  async getNotifications(params?: { unread?: boolean; limit?: number }) {
    const { data } = await this.client.get('/notifications', { params });
    return data;
  }

  async createNotification(notification: { userId: string; type: string; title: string; message: string; data?: Record<string, unknown>; channels?: string[] }) {
    const { data } = await this.client.post('/notifications', notification);
    return data;
  }

  async markNotificationRead(notificationId: string) {
    const { data } = await this.client.patch(`/notifications/${notificationId}/read`);
    return data;
  }

  async markAllNotificationsRead() {
    const { data } = await this.client.post('/notifications/read-all');
    return data;
  }

  async deleteNotification(notificationId: string) {
    const { data } = await this.client.delete(`/notifications/${notificationId}`);
    return data;
  }

  async registerDeviceToken(token: string, platform?: string) {
    const { data } = await this.client.post('/notifications/device-tokens', { token, platform });
    return data;
  }

  async removeDeviceToken(token: string) {
    const { data } = await this.client.delete('/notifications/device-tokens', { data: { token } });
    return data;
  }

  // Rate Analytics
  async getRateTrend(origin: string, dest: string, equipment: string) {
    const { data } = await this.client.get('/rate-analytics/trend', { params: { origin, destination: dest, equipment } });
    return data;
  }

  async compareRate(body: { originState: string; destState: string; equipmentType: string; brokerOffer: number }) {
    const { data } = await this.client.post('/rate-analytics/compare', body);
    return data;
  }

  // Broker Credit
  async getBrokerCredit(mcNumber: string) {
    const { data } = await this.client.get(`/broker-credit/${mcNumber}`);
    return data;
  }

  // Compliance
  async getComplianceDashboard() {
    const { data } = await this.client.get('/compliance/dashboard/default');
    return data;
  }

  async getComplianceAlerts() {
    const { data } = await this.client.get('/compliance/alerts/default');
    return data;
  }

  // CSA
  async getCSAScore(dotNumber: string) {
    const { data } = await this.client.get(`/csa/carrier/${dotNumber}`);
    return data;
  }

  // Factoring
  async getFactoringComparison(amount: number) {
    const { data } = await this.client.post('/factoring/compare', { amount });
    return data;
  }

  // Chat
  async getThreads() {
    const { data } = await this.client.get('/chat/threads');
    return data;
  }

  async getMessages(threadId: string) {
    const { data } = await this.client.get(`/chat/threads/${threadId}/messages`);
    return data;
  }

  async sendMessage(threadId: string, body: string) {
    const { data } = await this.client.post(`/chat/threads/${threadId}/messages`, { body });
    return data;
  }

  async createChatThread(threadData: { subject?: string; loadId?: string; memberIds?: string[] }) {
    const { data } = await this.client.post('/chat/threads', threadData);
    return data;
  }

  // Payroll
  async getDriverSettlements(driverId: string) {
    const { data } = await this.client.get(`/payroll/settlements/${driverId}`);
    return data;
  }

  async getDriverEarnings(driverId: string) {
    const { data } = await this.client.get(`/payroll/earnings/${driverId}`);
    return data;
  }

  // Rate Con
  async generateRateCon(loadData: Record<string, unknown>) {
    const { data } = await this.client.post('/ratecons/generate', loadData);
    return data;
  }

  // Generic request method
  async request<T = unknown>(
    method: Method,
    path: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.client.request({ method, url: path, data: body, ...config });
    return data;
  }
}

export const api = new ApiClient();
export default api;
