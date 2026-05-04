import { useState } from 'react';
import {
  DollarSign, FileText, Send, CheckCircle, AlertTriangle,
  Clock, TrendingUp, Download, ChevronRight, Truck
} from 'lucide-react';

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

const mockInvoices: AccountingInvoice[] = [
  { id: '1', number: 'INV-240427-001', shipper: 'Harborside Retail Group', loadRef: 'LD-4815', shipperAmount: 3500, carrierPay: 2800, grossMargin: 700, grossMarginPct: 20, status: 'paid', podAttached: true, issueDate: 'Apr 1', dueDate: 'May 1', daysAge: 0 },
  { id: '2', number: 'INV-240427-002', shipper: 'Global Trade Inc.', loadRef: 'LD-4816', shipperAmount: 2200, carrierPay: 1750, grossMargin: 450, grossMarginPct: 20.5, status: 'sent', podAttached: true, issueDate: 'Apr 16', dueDate: 'May 16', daysAge: 11 },
  { id: '3', number: 'INV-240427-003', shipper: 'Pacific Imports', loadRef: 'LD-4817', shipperAmount: 4800, carrierPay: 3700, grossMargin: 1100, grossMarginPct: 22.9, status: 'sent', podAttached: true, issueDate: 'Apr 17', dueDate: 'May 17', daysAge: 10 },
  { id: '4', number: 'INV-240415-004', shipper: 'Midwest Supplies', loadRef: 'LD-4809', shipperAmount: 2100, carrierPay: 1680, grossMargin: 420, grossMarginPct: 20, status: 'overdue', podAttached: true, issueDate: 'Apr 10', dueDate: 'Apr 25', daysAge: 2 },
  { id: '5', number: 'INV-240427-005', shipper: 'Eastern Distribution', loadRef: 'LD-4818', shipperAmount: 2700, carrierPay: 2100, grossMargin: 600, grossMarginPct: 22.2, status: 'draft', podAttached: false, issueDate: '—', dueDate: '—', daysAge: 0 },
  { id: '6', number: 'INV-240415-006', shipper: 'National Retail', loadRef: 'LD-4802', shipperAmount: 3200, carrierPay: 2500, grossMargin: 700, grossMarginPct: 21.9, status: 'overdue', podAttached: true, issueDate: 'Apr 8', dueDate: 'Apr 23', daysAge: 4 },
];

const mockCarrierPay: CarrierPayRecord[] = [
  { id: '1', carrier: 'Swift Logistics LLC', loadRef: 'LD-4821', amount: 2800, status: 'pending', dueDate: 'May 5' },
  { id: '2', carrier: 'Desert Haul Co.', loadRef: 'LD-4823', amount: 3700, status: 'processing', dueDate: 'May 3' },
  { id: '3', carrier: 'Midland Freight Inc.', loadRef: 'LD-4824', amount: 1900, status: 'pending', dueDate: 'May 6' },
  { id: '4', carrier: 'Pacific Freight Co.', loadRef: 'LD-4826', amount: 950, status: 'paid', dueDate: 'Apr 28' },
];

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

  const filteredInvoices = invoiceFilter === 'all'
    ? mockInvoices
    : mockInvoices.filter((i) => i.status === invoiceFilter);

  const totalShipperRevenue = mockInvoices.reduce((s, i) => s + i.shipperAmount, 0);
  const totalCarrierPay = mockInvoices.reduce((s, i) => s + i.carrierPay, 0);
  const totalGrossMargin = mockInvoices.reduce((s, i) => s + i.grossMargin, 0);
  const avgMarginPct = mockInvoices.length > 0
    ? Math.round(mockInvoices.reduce((s, i) => s + i.grossMarginPct, 0) / mockInvoices.length * 10) / 10
    : 0;

  const invoiceCounts = {
    draft: mockInvoices.filter((i) => i.status === 'draft').length,
    sent: mockInvoices.filter((i) => i.status === 'sent').length,
    overdue: mockInvoices.filter((i) => i.status === 'overdue').length,
    paid: mockInvoices.filter((i) => i.status === 'paid').length,
  };

  const carrierPayPending = mockCarrierPay.filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounting</h1>
          <p className="text-sm text-gray-500 mt-0.5">Invoices, payments, and margin tracking</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FileText size={16} /> Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
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
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Margin Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Shipper Revenue', value: `$${totalShipperRevenue.toLocaleString()}`, color: 'text-infamous-orange' },
          { label: 'Total Carrier Cost',    value: `$${totalCarrierPay.toLocaleString()}`,     color: 'text-blue-400' },
          { label: 'Avg Gross Margin %',    value: `${avgMarginPct}%`,                         color: 'text-green-400' },
        ].map((item, i) => (
          <div key={i} className="card">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
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
              tab === t.key ? 'border-infamous-orange text-infamous-orange' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {t.label}
            {t.key === 'invoices' && invoiceCounts.overdue > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{invoiceCounts.overdue}</span>
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
                    invoiceFilter === f ? 'bg-infamous-orange text-white' : 'bg-infamous-card text-gray-400 hover:text-white border border-infamous-border'
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
                    <tr key={inv.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="table-cell font-mono text-xs">{inv.number}</td>
                      <td className="table-cell font-medium">{inv.shipper}</td>
                      <td className="table-cell text-xs text-gray-500">{inv.loadRef}</td>
                      <td className="table-cell text-right font-semibold">${inv.shipperAmount.toLocaleString()}</td>
                      <td className="table-cell text-right text-gray-400">${inv.carrierPay.toLocaleString()}</td>
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
                      <td className="table-cell text-xs text-gray-500">
                        {inv.dueDate}
                        {inv.daysAge > 0 && (
                          <span className={`ml-1 ${inv.daysAge > 7 ? 'text-red-400' : 'text-yellow-400'}`}>
                            +{inv.daysAge}d
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-infamous-border text-gray-500 hover:text-white transition-colors">
                            <Download size={13} />
                          </button>
                          {inv.status === 'draft' && inv.podAttached && (
                            <button className="p-1.5 rounded-lg hover:bg-infamous-border text-gray-500 hover:text-infamous-orange transition-colors">
                              <Send size={13} />
                            </button>
                          )}
                          {inv.status !== 'paid' && (
                            <button className="p-1.5 rounded-lg hover:bg-infamous-border text-gray-500 hover:text-white transition-colors" title="View detail">
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-gray-500 text-sm">No invoices</td>
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
                {mockCarrierPay.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="table-cell font-medium">{pay.carrier}</td>
                    <td className="table-cell text-xs text-gray-500">{pay.loadRef}</td>
                    <td className="table-cell text-right font-semibold">${pay.amount.toLocaleString()}</td>
                    <td className="table-cell text-xs text-gray-500">{pay.dueDate}</td>
                    <td className="table-cell">
                      <span className={`badge ${carrierPayBadge[pay.status]} capitalize`}>{pay.status}</span>
                    </td>
                    <td className="table-cell">
                      {pay.status === 'pending' && (
                        <button className="px-3 py-1 rounded-lg bg-infamous-orange/10 text-infamous-orange text-xs font-medium hover:bg-infamous-orange hover:text-white transition-all">
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
