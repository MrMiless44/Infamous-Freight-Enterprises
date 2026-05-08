import { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileCheck, Clock, TrendingDown, Truck, Ban, ExternalLink, Activity } from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';

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

const mockDocs: DocExpiry[] = [
  { id: '1', name: 'Auto Liability', type: 'insurance', number: 'POL-2024-001', issuedBy: 'Progressive', expiryDate: '2025-05-15', daysLeft: 25, status: 'expiring_soon' },
  { id: '2', name: 'Cargo Insurance', type: 'insurance', number: 'POL-2024-002', issuedBy: 'Northland', expiryDate: '2025-08-22', daysLeft: 124, status: 'active' },
  { id: '3', name: 'MC Authority', type: 'authority', number: 'MC-123456', issuedBy: 'FMCSA', expiryDate: '2025-12-31', daysLeft: 255, status: 'active' },
  { id: '4', name: 'DOT Physical — Marcus T.', type: 'medical', number: 'MED-2024-001', issuedBy: 'Concentra', expiryDate: '2025-04-25', daysLeft: 5, status: 'expiring_soon' },
  { id: '5', name: 'CDL License — James R.', type: 'license', number: 'TX12345678', issuedBy: 'TX DMV', expiryDate: '2026-01-15', daysLeft: 270, status: 'active' },
  { id: '6', name: 'IFTA License', type: 'permit', number: 'IFTA-TX-2024', issuedBy: 'TX DOT', expiryDate: '2024-12-31', daysLeft: -100, status: 'expired' },
];

const mockBASICs: BASICScore[] = [
  { category: 'Unsafe Driving', percentile: 35, alertStatus: 'no_alert' },
  { category: 'HOS Compliance', percentile: 72, alertStatus: 'alert' },
  { category: 'Driver Fitness', percentile: 15, alertStatus: 'no_alert' },
  { category: 'Substances/Alcohol', percentile: 0, alertStatus: 'no_alert' },
  { category: 'Vehicle Maintenance', percentile: 58, alertStatus: 'alert' },
  { category: 'Crash Indicator', percentile: 45, alertStatus: 'no_alert' },
];

const docStatusBadge = {
  active: 'badge-green',
  expiring_soon: 'badge-yellow',
  expired: 'badge-red',
};

const CompliancePage: React.FC = () => {
  const [tab, setTab] = useState<'documents' | 'csa' | 'alerts'>('documents');
  const criticalAlerts = mockDocs.filter((d) => d.daysLeft <= 7);
  const expiredCount = mockDocs.filter((d) => d.status === 'expired').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track document expiries, CSA scores, and renewal alerts · sample data</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-infamous-card border border-infamous-border rounded-xl px-3 py-2">
            <Activity size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">Demo data</span>
          </div>
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
          { label: 'Active Documents', value: mockDocs.filter((d) => d.status === 'active').length, icon: <FileCheck size={18} />, color: 'text-green-400' },
          { label: 'Expiring Soon', value: mockDocs.filter((d) => d.status === 'expiring_soon').length, icon: <Clock size={18} />, color: 'text-yellow-400' },
          { label: 'Expired', value: expiredCount, icon: <AlertTriangle size={18} />, color: 'text-red-400' },
          { label: 'BASIC Alerts', value: mockBASICs.filter((b) => b.alertStatus === 'alert').length, icon: <TrendingDown size={18} />, color: 'text-infamous-orange' },
        ].map((stat, i) => (
          <div key={i} className="card flex items-center gap-3">
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
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
              tab === t ? 'border-infamous-orange text-infamous-orange' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {t === 'csa' ? 'CSA Scores' : t}
            {t === 'alerts' && criticalAlerts.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{criticalAlerts.length}</span>
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
              {mockDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="table-cell font-medium">{doc.name}</td>
                  <td className="table-cell text-xs text-gray-500 capitalize">{doc.type}</td>
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
              {mockBASICs.map((basic) => (
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
              <p className="text-sm text-gray-500">Last updated: Apr 15, 2025</p>
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
                <p className="text-sm text-gray-500">Policy: {alert.number} · Issued by: {alert.issuedBy}</p>
              </div>
              <button className="btn-secondary text-sm">Renew Now</button>
            </div>
          ))}
          {criticalAlerts.length === 0 && (
            <div className="card text-center py-12">
              <FileCheck size={32} className="text-green-400 mx-auto mb-3" />
              <p className="text-lg font-semibold">All Clear</p>
              <p className="text-sm text-gray-500">Every document is current.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
