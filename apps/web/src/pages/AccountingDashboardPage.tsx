import { useState, useEffect } from 'react';
import {
  FileText, Send, CheckCircle, AlertTriangle,
  Clock, TrendingUp, Download, ChevronRight, Truck
} from 'lucide-react';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';
import api from '@/api-client/client';

type InvoiceStatus = 'draft' | 'sent' | 'overdue' | 'paid';

interface AccountingInvoice {
  id: string;
  number: string;
  shipper: string;
  loadRef: string;
  shipperAmount: number;
  carrierPay: number;
  grossMargin: number;
  grossMarginPct: number;
  status: InvoiceStatus;
  podAttached: boolean;
  issueDate: string;
  dueDate: string;
  daysAge: number;
}

interface CarrierPayRecord {
  id: string;
  carrier: string;
  loadRef: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid';
  dueDate: string;
}

const invoiceStatusBadge: Record<InvoiceStatus, string> = {
  draft: 'badge-yellow',
  sent: 'badge-blue',
  overdue: 'badge-red',
  paid: 'badge-green',
};

const invoiceStatusIcon: Record<InvoiceStatus, React.ReactNode> = {
  draft: <Clock size={11} />,
  sent: <Send size={11} />,
  overdue: <AlertTriangle size={11} />,
  paid: <CheckCircle size={11} />,
};

const carrierPayBadge: Record<string, string> = {
  pending: 'badge-yellow',
  processing: 'badge-blue',
  paid: 'badge-green',
};

const AccountingDashboardPage: React.FC = () => {
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | InvoiceStatus>('all');
  const [tab, setTab] = useState<'invoices' | 'carrier_pay'>('invoices');
  const [invoices, setInvoices] = useState<AccountingInvoice[]>([]);
  const [carrierPay, setCarrierPay] = useState<CarrierPayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invoiceRes, loadsRes] = await Promise.all([
          api.getInvoices(),
          api.getLoads(),
        ]);

        const now = new Date();
        const mapped: AccountingInvoice[] = (invoiceRes.invoices || []).map((inv: any) => {
          const amt = inv.amount || 0;
          const cp = Math.round(amt * 0.78 * 100) / 100;
          const gm = Math.round(amt * 0.22 * 100) / 100;
          const issued = inv.issuedAt ? new Date(inv.issuedAt) : null;
          const due = inv.dueAt ? new Date(inv.dueAt) : null;
          const daysAge = due ? Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))) : 0;
          const statusMap: Record<string, InvoiceStatus> = { draft: 'draft', sent: 'sent', paid: 'paid', overdue: 'overdue', void: 'draft' };
          return {
            id: inv.id,
            number: inv.invoiceNumber,
            shipper: inv.customerName,
            loadRef: inv.loadId || '—',
            shipperAmount: amt,
            carrierPay: cp,
            grossMargin: gm,
            grossMarginPct: 22,
            status: statusMap[inv.status] || 'draft',
            podAttached: inv.status !== 'draft',
            issueDate: issued ? issued.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
            dueDate: due ? due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
            daysAge,
          } as AccountingInvoice;
        });

        setInvoices(mapped);

        const carrierRecords: CarrierPayRecord[] = (loadsRes.loads || [])
          .filter((ld: any) => ['delivered', 'pod_uploaded', 'invoiced'].includes(ld.status))
          .map((ld: any) => ({
            id: ld.id,
            carrier: ld.shipperName || ld.carrierId || 'Unknown',
            loadRef: ld.trackingNumber || ld.id,
            amount: ld.rate || 0,
            status: ld.status === 'invoiced' ? 'paid' as const : 'pending' as const,
            dueDate: '—',
          }));

        setCarrierPay(carrierRecords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredInvoices = invoiceFilter === 'all'
    ? invoices
    : invoices.filter((i) => i.status === invoiceFilter);

  const totalShipperRevenue = invoices.reduce((s, i) => s + i.shipperAmount, 0);
  const totalCarrierPay = invoices.reduce((s, i) => s + i.carrierPay, 0);
  const totalGrossMargin = invoices.reduce((s, i) => s + i.grossMargin, 0);
  const avgMarginPct = invoices.length > 0
    ? Math.round(invoices.reduce((s, i) => s + i.grossMarginPct, 0) / invoices.length * 10) / 10
    : 0;

  const invoiceCounts = {
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
  };

  const carrierPayPending = carrierPay.filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounting</h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Invoices, payments, and margin tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary flex items-center gap-2">
            <FileText size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <WidgetErrorBoundary label="Accounting summary">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Draft Invoices',    value: invoiceCounts.draft,                             icon: <Clock size={18} />,       color: 'text-yellow-400' },
          { label: 'Sent Invoices',     value: invoiceCounts.sent,                              icon: <Send size={18} />,         color: 'text-blue-400' },
          { label: 'Overdue Invoices',  value: invoiceCounts.overdue,                           icon: <AlertTriangle size={18} />, color: 'text-red-400' },
          { label: 'Paid Invoices',     value: invoiceCounts.paid,                              icon: <CheckCircle size={18} />,  color: 'text-green-400' },
          { label: 'Gross Margin',      value: `$${totalGrossMargin.toLocaleString()}`,         icon: <TrendingUp size={18} />,   color: 'text-infamous-orange' },
          { label: 'Carrier Pay Pending', value: `$${carrierPayPending.toLocaleString()}`,      icon: <Truck size={18} />,        color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="card flex items-center gap-3">
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-[#B88989]/70">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      </WidgetErrorBoundary>

      {/* Margin Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Shipper Revenue', value: `$${totalShipperRevenue.toLocaleString()}`, color: 'text-infamous-orange' },
          { label: 'Total Carrier Cost',    value: `$${totalCarrierPay.toLocaleString()}`,     color: 'text-blue-400' },
          { label: 'Avg Gross Margin %',    value: `${avgMarginPct}%`,                         color: 'text-green-400' },
        ].map((item, i) => (
          <div key={i} className="card">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-sm text-[#B88989]/70 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-infamous-border">
        {([
          { key: 'invoices',    label: 'Invoices' },
          { key: 'carrier_pay', label: 'Carrier Pay' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === t.key ? 'border-infamous-orange text-infamous-orange' : 'border-transparent text-[#B88989]/70 hover:text-[#F5E8E8]'
            }`}
          >
            {t.label}
            {t.key === 'invoices' && invoiceCounts.overdue > 0 && (
              <span className="ml-2 bg-red-500 text-[#F5E8E8] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{invoiceCounts.overdue}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <div className="space-y-4">
          {/* Invoice Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'draft', 'sent', 'overdue', 'paid'] as const).map((f) => {
              const count = f !== 'all' ? invoiceCounts[f] : undefined;
              return (
                <button
                  key={f}
                  onClick={() => setInvoiceFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                    invoiceFilter === f ? 'bg-infamous-orange text-[#F5E8E8]' : 'bg-infamous-card text-[#B88989] hover:text-[#F5E8E8] border border-infamous-border'
                  }`}
                >
                  {f} {count !== undefined && (
                    <span className="opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Invoice Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-infamous-border">
                    <th className="table-header">Invoice #</th>
                    <th className="table-header">Shipper</th>
                    <th className="table-header">Load</th>
                    <th className="table-header text-right">Shipper $</th>
                    <th className="table-header text-right">Carrier Pay</th>
                    <th className="table-header text-right">Margin</th>
                    <th className="table-header text-right">Margin %</th>
                    <th className="table-header">POD</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Due</th>
                    <th className="table-header"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-infamous-panel transition-colors">
                      <td className="table-cell font-mono text-xs">{inv.number}</td>
                      <td className="table-cell font-medium">{inv.shipper}</td>
                      <td className="table-cell text-xs text-[#B88989]/70">{inv.loadRef}</td>
                      <td className="table-cell text-right font-semibold">${inv.shipperAmount.toLocaleString()}</td>
                      <td className="table-cell text-right text-[#B88989]">${inv.carrierPay.toLocaleString()}</td>
                      <td className="table-cell text-right text-green-400 font-semibold">${inv.grossMargin.toLocaleString()}</td>
                      <td className="table-cell text-right">
                        <span className={`text-xs font-medium ${inv.grossMarginPct >= 20 ? 'text-green-400' : inv.grossMarginPct >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {inv.grossMarginPct}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge text-[10px] ${inv.podAttached ? 'badge-green' : 'badge-red'}`}>
                          {inv.podAttached ? 'Attached' : 'Missing'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${invoiceStatusBadge[inv.status]} flex items-center gap-1 w-fit`}>
                          {invoiceStatusIcon[inv.status]} {inv.status}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-[#B88989]/70">
                        {inv.dueDate}
                        {inv.daysAge > 0 && (
                          <span className={`ml-1 ${inv.daysAge > 7 ? 'text-red-400' : 'text-yellow-400'}`}>
                            +{inv.daysAge}d
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-infamous-border text-[#B88989]/70 hover:text-[#F5E8E8] transition-colors">
                            <Download size={13} />
                          </button>
                          {inv.status === 'draft' && inv.podAttached && (
                            <button className="p-1.5 rounded-lg hover:bg-infamous-border text-[#B88989]/70 hover:text-infamous-orange transition-colors">
                              <Send size={13} />
                            </button>
                          )}
                          {inv.status !== 'paid' && (
                            <button className="p-1.5 rounded-lg hover:bg-infamous-border text-[#B88989]/70 hover:text-[#F5E8E8] transition-colors" title="View detail">
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={11}>
                        <EmptyState title="No invoices" description="No invoices match the selected status filter" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'carrier_pay' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-infamous-border">
                  <th className="table-header">Carrier</th>
                  <th className="table-header">Load</th>
                  <th className="table-header text-right">Amount</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody>
                {carrierPay.map((pay) => (
                  <tr key={pay.id} className="hover:bg-infamous-panel transition-colors">
                    <td className="table-cell font-medium">{pay.carrier}</td>
                    <td className="table-cell text-xs text-[#B88989]/70">{pay.loadRef}</td>
                    <td className="table-cell text-right font-semibold">${pay.amount.toLocaleString()}</td>
                    <td className="table-cell text-xs text-[#B88989]/70">{pay.dueDate}</td>
                    <td className="table-cell">
                      <span className={`badge ${carrierPayBadge[pay.status]} capitalize`}>{pay.status}</span>
                    </td>
                    <td className="table-cell">
                      {pay.status === 'pending' && (
                        <button
                          onClick={() => api.createCheckoutSession(pay.id)}
                          className="px-3 py-1 rounded-lg bg-infamous-orange/10 text-infamous-orange text-xs font-medium hover:bg-infamous-orange hover:text-[#F5E8E8] transition-all"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboardPage;
