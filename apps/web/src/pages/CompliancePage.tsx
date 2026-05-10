import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, FileCheck, Clock, TrendingDown, Truck, Ban, ExternalLink, Activity } from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';
import api from '@/api-client/client';

interface DocExpiry {
  id: string;
  name: string;
  type: string;
  number: string;
  issuedBy: string;
  expiryDate: string;
  daysLeft: number;
  status: 'active' | 'expiring_soon' | 'expired';
}

interface BASICScore {
  category: string;
  percentile: number;
  alertStatus: 'no_alert' | 'alert' | 'intervention';
}

const docStatusBadge = {
  active: 'badge-green',
  expiring_soon: 'badge-yellow',
  expired: 'badge-red',
};

const CompliancePage: React.FC = () => {
  const [tab, setTab] = useState<'documents' | 'csa' | 'alerts'>('documents');
  const [docs, setDocs] = useState<DocExpiry[]>([]);
  const [basics, setBasics] = useState<BASICScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const carriersRes = await api.request<{ carriers: Array<{ name?: string; insuranceExpiry?: string; authorityStatus?: string; mcNumber?: string; dotNumber?: string }> }>('GET', '/carriers');
        const driversRes = await api.getDrivers() as { drivers: Array<{ name?: string; licenseNumber?: string; licenseState?: string }> };

        const now = new Date();
        const records: DocExpiry[] = [];
        let idCounter = 1;

        (carriersRes.carriers || []).forEach((carrier) => {
          if (carrier.insuranceExpiry) {
            const expiry = new Date(carrier.insuranceExpiry);
            const daysLeft = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            let status: DocExpiry['status'] = 'active';
            if (daysLeft < 0) status = 'expired';
            else if (daysLeft <= 30) status = 'expiring_soon';
            records.push({
              id: String(idCounter++),
              name: `Insurance — ${carrier.name || 'Unknown'}`,
              type: 'insurance',
              number: carrier.mcNumber || '—',
              issuedBy: '—',
              expiryDate: carrier.insuranceExpiry,
              daysLeft,
              status,
            });
          }
        });

        (driversRes.drivers || []).forEach((driver) => {
          if (driver.licenseNumber) {
            records.push({
              id: String(idCounter++),
              name: `CDL — ${driver.name || 'Unknown'}`,
              type: 'license',
              number: driver.licenseNumber,
              issuedBy: `${driver.licenseState || '—'} DMV`,
              expiryDate: '—',
              daysLeft: 0,
              status: 'active',
            });
          }
        });

        setDocs(records);
        setBasics([
          { category: 'Unsafe Driving', percentile: 0, alertStatus: 'no_alert' },
          { category: 'HOS Compliance', percentile: 0, alertStatus: 'no_alert' },
          { category: 'Driver Fitness', percentile: 0, alertStatus: 'no_alert' },
          { category: 'Substances/Alcohol', percentile: 0, alertStatus: 'no_alert' },
          { category: 'Vehicle Maintenance', percentile: 0, alertStatus: 'no_alert' },
          { category: 'Crash Indicator', percentile: 0, alertStatus: 'no_alert' },
        ]);
      } catch {
        setDocs([]);
        setBasics([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const criticalAlerts = docs.filter((d) => d.daysLeft <= 7);
  const expiredCount = docs.filter((d) => d.status === 'expired').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Compliance</h1>
            <p className="text-sm text-[#B88989]/70 mt-0.5">Loading compliance data...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-infamous-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance</h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Track document expiries, CSA scores, and renewal alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {expiredCount > 0 && (
            <div className="badge-red flex items-center gap-1">
              <Ban size={12} /> {expiredCount} expired — renew before dispatching
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Documents', value: docs.filter((d) => d.status === 'active').length, icon: <FileCheck size={18} />, color: 'text-green-400' },
          { label: 'Expiring Soon', value: docs.filter((d) => d.status === 'expiring_soon').length, icon: <Clock size={18} />, color: 'text-yellow-400' },
          { label: 'Expired', value: expiredCount, icon: <AlertTriangle size={18} />, color: 'text-red-400' },
          { label: 'BASIC Alerts', value: basics.filter((b) => b.alertStatus === 'alert').length, icon: <TrendingDown size={18} />, color: 'text-infamous-orange' },
        ].map((stat, i) => (
          <div key={i} className="card flex items-center gap-3">
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-[#B88989]/70">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-infamous-border">
        {(['documents', 'csa', 'alerts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-all ${
              tab === t ? 'border-infamous-orange text-infamous-orange' : 'border-transparent text-[#B88989]/70 hover:text-[#F5E8E8]'
            }`}
          >
            {t === 'csa' ? 'CSA Scores' : t}
            {t === 'alerts' && criticalAlerts.length > 0 && (
              <span className="ml-2 bg-red-500 text-[#F5E8E8] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{criticalAlerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'documents' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-infamous-border">
                <th className="table-header">Document</th>
                <th className="table-header">Type</th>
                <th className="table-header">Number</th>
                <th className="table-header">Issued By</th>
                <th className="table-header">Expiry</th>
                <th className="table-header">Days Left</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-infamous-panel transition-colors">
                  <td className="table-cell font-medium">{doc.name}</td>
                  <td className="table-cell text-xs text-[#B88989]/70 capitalize">{doc.type}</td>
                  <td className="table-cell font-mono text-xs">{doc.number}</td>
                  <td className="table-cell text-xs">{doc.issuedBy}</td>
                  <td className="table-cell text-xs">{doc.expiryDate}</td>
                  <td className="table-cell">
                    <span className={`text-xs font-medium ${doc.daysLeft < 0 ? 'text-red-400' : doc.daysLeft <= 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {doc.daysLeft < 0 ? `${Math.abs(doc.daysLeft)}d overdue` : `${doc.daysLeft}d`}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${docStatusBadge[doc.status]}`}>{doc.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'csa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-infamous-orange" /> BASIC Scores
            </h2>
            <div className="space-y-3">
              {basics.map((basic) => (
                <div key={basic.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{basic.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${basic.alertStatus === 'alert' ? 'text-yellow-400' : basic.alertStatus === 'intervention' ? 'text-red-400' : 'text-green-400'}`}>
                        {basic.percentile}%
                      </span>
                      {basic.alertStatus === 'alert' && <span className="badge-yellow text-[10px]">Alert</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-infamous-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        basic.percentile >= 80 ? 'bg-red-500' : basic.percentile >= 65 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${basic.percentile}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Overall Rating</h2>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-green-500 mb-4">
                <span className="text-2xl font-bold text-green-400">S</span>
              </div>
              <p className="text-lg font-semibold">Satisfactory</p>
              <p className="text-sm text-[#B88989]/70">Last updated: Apr 15, 2025</p>
              <button className="mt-4 text-sm text-infamous-orange hover:underline flex items-center gap-1 mx-auto">
                <ExternalLink size={12} /> View on FMCSA
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="space-y-3">
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className="card border-l-4 border-l-yellow-500 flex items-center gap-4">
              <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{alert.name} expires in {alert.daysLeft} days</p>
                <p className="text-sm text-[#B88989]/70">Policy: {alert.number} · Issued by: {alert.issuedBy}</p>
              </div>
              <button className="btn-secondary text-sm">Renew Now</button>
            </div>
          ))}
          {criticalAlerts.length === 0 && (
            <div className="card text-center py-12">
              <FileCheck size={32} className="text-green-400 mx-auto mb-3" />
              <p className="text-lg font-semibold">All Clear</p>
              <p className="text-sm text-[#B88989]/70">Every document is current.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
