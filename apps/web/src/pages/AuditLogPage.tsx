import { useState, useEffect } from 'react';
import api from '@/api-client/client';
import {
  Activity, Bell, ShieldCheck, Truck, CreditCard, Radio,
  Filter, RefreshCw, Clock, ChevronDown, AlertTriangle, CheckCircle,
  Mail, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';

type ActivityTab = 'activity' | 'notifications';
type ActivityCategory = 'all' | 'status' | 'notification' | 'compliance' | 'dispatch' | 'payment';

interface ActivityEvent {
  id: string;
  category: string;
  action: string;
  entity: string;
  entityId: string;
  actor: string;
  details: string;
  timestamp: string;
}

interface AdminNotification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotifStats {
  total: number;
  readCount: number;
  unreadCount: number;
  uniqueUsers: number;
  uniqueTypes: number;
}

interface TypeBreakdown {
  type: string;
  count: number;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  status:       { label: 'Status',      icon: <Truck size={14} />,       color: 'text-blue-400' },
  notification: { label: 'Notification', icon: <Bell size={14} />,       color: 'text-yellow-400' },
  compliance:   { label: 'Compliance',  icon: <ShieldCheck size={14} />, color: 'text-orange-400' },
  dispatch:     { label: 'Dispatch',    icon: <Radio size={14} />,       color: 'text-purple-400' },
  payment:      { label: 'Payment',     icon: <CreditCard size={14} />,  color: 'text-green-400' },
};

const categoryTabs: { key: ActivityCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'status', label: 'Status' },
  { key: 'dispatch', label: 'Dispatch' },
  { key: 'payment', label: 'Payment' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'notification', label: 'Notifications' },
];

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const AuditLogPage: React.FC = () => {
  const [tab, setTab] = useState<ActivityTab>('activity');
  const [category, setCategory] = useState<ActivityCategory>('all');
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifStats, setNotifStats] = useState<NotifStats | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (category !== 'all') params.set('category', category);
      const data = await api.request('GET', `/admin/activity?${params}`);
      const resp = data as { events: ActivityEvent[]; counts: Record<string, number> };
      setEvents(resp.events);
      setCounts(resp.counts);
    } catch {
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const data = await api.request('GET', '/admin/notifications?limit=100');
      const resp = data as { notifications: AdminNotification[]; stats: NotifStats; typeBreakdown: TypeBreakdown[] };
      setNotifications(resp.notifications);
      setNotifStats(resp.stats);
      setTypeBreakdown(resp.typeBreakdown);
    } catch {
      toast.error('Failed to load notification data');
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'activity') fetchActivity();
    else fetchNotifications();
  }, [tab, category]);

  const totalEvents = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={24} className="text-infamous-red-light" />
            Audit Log & Notifications
          </h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Activity feed, notification deliverability, and system events</p>
        </div>
        <button
          onClick={() => tab === 'activity' ? fetchActivity() : fetchNotifications()}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('activity')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'activity' ? 'bg-infamous-red text-[#F5E8E8]' : 'bg-infamous-card text-[#B88989] hover:text-[#F5E8E8] border border-infamous-border'
          }`}
        >
          <Activity size={15} /> Activity Log
        </button>
        <button
          onClick={() => setTab('notifications')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'notifications' ? 'bg-infamous-red text-[#F5E8E8]' : 'bg-infamous-card text-[#B88989] hover:text-[#F5E8E8] border border-infamous-border'
          }`}
        >
          <Bell size={15} /> Notification Admin
        </button>
      </div>

      {tab === 'activity' ? (
        <>
          {/* Summary Cards */}
          <WidgetErrorBoundary label="Activity summary">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="card flex flex-col items-center justify-center py-3">
                <p className="text-xl font-bold">{totalEvents}</p>
                <p className="text-[10px] text-[#B88989]/70">Total Events</p>
              </div>
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <div key={key} className="card flex flex-col items-center justify-center py-3">
                  <p className={`text-xl font-bold ${cfg.color}`}>{counts[key] || 0}</p>
                  <p className="text-[10px] text-[#B88989]/70 flex items-center gap-1">{cfg.icon} {cfg.label}</p>
                </div>
              ))}
            </div>
          </WidgetErrorBoundary>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categoryTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setCategory(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  category === t.key ? 'bg-infamous-orange text-[#F5E8E8]' : 'bg-infamous-card text-[#B88989] hover:text-[#F5E8E8] border border-infamous-border'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Event Timeline */}
          <div className="card p-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-infamous-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <EmptyState title="No events found" description="Activity events will appear here as the system is used." />
            ) : (
              <div className="divide-y divide-infamous-border">
                {events.map((event) => {
                  const cfg = categoryConfig[event.category] || { label: event.category, icon: <Activity size={14} />, color: 'text-[#B88989]' };
                  return (
                    <div key={event.id} className="flex items-start gap-3 px-5 py-3 hover:bg-infamous-panel/50 transition-colors">
                      <div className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-[#B88989]/70 mt-0.5">
                          {event.entity}
                          {event.details && <span className="ml-2 text-[#B88989]/50">· {event.details}</span>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-[#B88989]/60 flex items-center gap-1">
                          <Clock size={10} /> {relativeTime(event.timestamp)}
                        </p>
                        <p className="text-[10px] text-[#B88989]/50 mt-0.5">{event.actor}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Notification Stats */}
          <WidgetErrorBoundary label="Notification stats">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {notifStats && [
                { label: 'Total Sent', value: notifStats.total, icon: <Mail size={16} />, color: 'text-blue-400' },
                { label: 'Read', value: notifStats.readCount, icon: <CheckCircle size={16} />, color: 'text-green-400' },
                { label: 'Unread', value: notifStats.unreadCount, icon: <AlertTriangle size={16} />, color: 'text-yellow-400' },
                { label: 'Users Reached', value: notifStats.uniqueUsers, icon: <MessageSquare size={16} />, color: 'text-purple-400' },
                { label: 'Notification Types', value: notifStats.uniqueTypes, icon: <Filter size={16} />, color: 'text-infamous-orange' },
              ].map((stat, i) => (
                <div key={i} className="card flex items-center gap-3">
                  <span className={stat.color}>{stat.icon}</span>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-[10px] text-[#B88989]/70">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </WidgetErrorBoundary>

          {/* Type Breakdown */}
          {typeBreakdown.length > 0 && (
            <WidgetErrorBoundary label="Type breakdown">
              <div className="card">
                <h3 className="text-sm font-semibold mb-3">Notification Type Breakdown</h3>
                <div className="space-y-2">
                  {typeBreakdown.map((tb) => {
                    const pct = notifStats ? Math.round((tb.count / notifStats.total) * 100) : 0;
                    return (
                      <div key={tb.type} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#B88989]/70 w-32 truncate">{tb.type}</span>
                        <div className="flex-1 h-2 bg-infamous-panel rounded-full overflow-hidden">
                          <div className="h-full bg-infamous-red rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[#B88989]/70 w-16 text-right">{tb.count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </WidgetErrorBoundary>
          )}

          {/* Notification List */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-infamous-border">
              <h3 className="text-sm font-semibold">Recent Notifications (All Users)</h3>
            </div>
            {notifLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-infamous-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState title="No notifications" description="Notifications will appear here as the system sends them." />
            ) : (
              <div className="divide-y divide-infamous-border">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-infamous-panel/50 transition-colors">
                    <Bell size={14} className={`mt-0.5 ${n.read ? 'text-[#B88989]/40' : 'text-yellow-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-[#B88989]/70 mt-0.5 truncate">{n.message}</p>
                      <p className="text-[10px] text-[#B88989]/50 mt-1">
                        To: {n.userName || n.userEmail || n.userId}
                        <span className="ml-2">· Type: {n.type}</span>
                        <span className="ml-2">· {n.read ? 'Read' : 'Unread'}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-[#B88989]/60 shrink-0">{relativeTime(n.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogPage;
