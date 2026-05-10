import { create } from 'zustand';
import type { SubscriptionStatus } from '@/lib/paywall';

export type AppPage =
  | 'dashboard' | 'loads' | 'dispatch' | 'drivers' | 'invoices'
  | 'messages' | 'analytics' | 'compliance' | 'settings' | 'driver-app';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  carrierId: string;
  avatar?: string;
  subscriptionStatus?: SubscriptionStatus;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Navigation
  currentPage: AppPage;
  sidebarOpen: boolean;
  setPage: (page: AppPage) => void;
  toggleSidebar: () => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;

  // Modals
  activeModal: string | null;
  modalData: unknown;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;

  // Filters
  dateRange: '7d' | '30d' | '90d';
  setDateRange: (range: '7d' | '30d' | '90d') => void;

  // Realtime
  socketConnected: boolean;
  setSocketConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem('infamous_token');
    set({ user: null, isAuthenticated: false });
  },

  // Navigation
  currentPage: 'dashboard',
  sidebarOpen: true,
  setPage: (currentPage) => set({ currentPage }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Notifications
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => set((s) => {
    const notification: Notification = { ...n, id: `notif_${Date.now()}`, createdAt: new Date() };
    return {
      notifications: [notification, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    };
  }),
  markRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  // Modals
  activeModal: null,
  modalData: null,
  openModal: (activeModal, modalData) => set({ activeModal, modalData }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Filters
  dateRange: '7d',
  setDateRange: (dateRange) => set({ dateRange }),

  // Realtime
  socketConnected: false,
  setSocketConnected: (socketConnected) => set({ socketConnected }),
}));
