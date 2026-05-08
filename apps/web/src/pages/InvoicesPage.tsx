import { useMemo, useState } from 'react';
import { FileText, DollarSign, Clock, Send, CheckCircle, AlertTriangle, Download, TrendingUp, FileCheck2, Sparkles } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

interface Invoice {
  id: string;
  number: string;
  broker: string;
  loadRef: string;
  amount: number;
  status: 'draft' | 'sent' | 'overdue' | 'paid';
  issueDate: string;
  dueDate: string;
  age: number;
}

interface PodReadyLoad {
  loadRef: string;
  broker: string;
  lane: string;
  amount: number;
  podReceivedAt: string;
  ocrConfidence: number;
}

const initialPodReadyLoads: PodReadyLoad[] = [
  { loadRef: 'LD-4815', broker: 'RXO',       lane: 'Dallas, TX → Houston, TX',     amount: 700,  podReceivedAt: 'Today · 10:42 AM', ocrConfidence: 96 },
  { loadRef: 'LD-4828', broker: 'JB Hunt',   lane: 'Phoenix, AZ → Las Vegas, NV',  amount: 950,  podReceivedAt: 'Today · 9:18 AM',  ocrConfidence: 92 },
  { loadRef: 'LD-4819', broker: 'Schneider', lane: 'Memphis, TN → Indianapolis, IN', amount: 2400, podReceivedAt: 'Yesterday · 6:05 PM', ocrConfidence: 88 },
];

const mockInvoices: Invoice[] = [
  { id: '1', number: 'INV-240421-001', broker: 'RXO', loadRef: 'LD-4815', amount: 3200, status: 'paid', issueDate: 'Apr 15', dueDate: 'May 15', age: 0 },
  { id: '2', number: 'INV-240421-002', broker: 'TQL', loadRef: 'LD-4816', amount: 1850, status: 'sent', issueDate: 'Apr 16', dueDate: 'May 16', age: 4 },
  { id: '3', number: 'INV-240421-003', broker: 'Landstar', loadRef: 'LD-4817', amount: 4100, status: 'sent', issueDate: 'Apr 17', dueDate: 'May 17', age: 3 },
  { id: '4', number: 'INV-240418-004', broker: 'Schneider', loadRef: 'LD-4809', amount: 1950, status: 'overdue', issueDate: 'Apr 10', dueDate: 'May 10', age: 10 },
  { id: '5', number: 'INV-240421-005', broker: 'JB Hunt', loadRef: 'LD-4818', amount: 2400, status: 'draft', issueDate: '—', dueDate: '—', age: 0 },
  { id: '6', number: 'INV-240415-006', broker: 'RXO', loadRef: 'LD-4802', amount: 2800, status: 'paid', issueDate: 'Apr 1', dueDate: 'May 1', age: 0 },
];

const statusBadge: Record<string, string> = {
  draft: 'badge-yellow',
  sent: 'badge-blue',
  overdue: 'badge-red',
  paid: 'badge-green',
};

const statusIcon: Record<string, React.ReactNode> = {
  draft: <Clock size={12} />,
  sent: <Send size={12} />,
  overdue: <AlertTriangle size={12} />,
  paid: <CheckCircle size={12} />,
};

const InvoicesPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [extraInvoices, setExtraInvoices] = useState<Invoice[]>([]);
  const [podReadyLoads, setPodReadyLoads] = useState<PodReadyLoad[]>(initialPodReadyLoads);

  const allInvoices = useMemo(() => [...extraInvoices, ...mockInvoices], [extraInvoices]);
  const filtered = filter === 'all' ? allInvoices : allInvoices.filter((i) => i.status === filter);

  const totalOutstanding = allInvoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = allInvoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const draftFromPod = (load: PodReadyLoad) => {
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 30);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newInvoice: Invoice = {
      id: `pod-${load.loadRef}`,
      number: `INV-${load.loadRef.replace('LD-', '')}`,
      broker: load.broker,
      loadRef: load.loadRef,
      amount: load.amount,
      status: 'draft',
      issueDate: fmt(today),
      dueDate: fmt(due),
      age: 0,
    };
    setExtraInvoices((prev) => [newInvoice, ...prev]);
    setPodReadyLoads((prev) => prev.filter((p) => p.loadRef !== load.loadRef));
    setFilter('draft');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage billing and track payments</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FileText size={16} /> Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: `$${totalOutstanding.toLocaleString()}`, icon: <DollarSign size={18} />, color: 'text-infamous-orange' },
          { label: 'Overdue', value: `$${totalOverdue.toLocaleString()}`, icon: <AlertTriangle size={18} />, color: 'text-red-400' },
          { label: 'Paid This Month', value: '$8,450', icon: <CheckCircle size={18} />, color: 'text-green-400' },
          { label: 'Avg Days to Pay', value: '18 days', icon: <TrendingUp size={18} />, color: 'text-blue-400' },
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

      {/* POD-ready queue — auto-creates an invoice draft from a delivered POD */}
      {podReadyLoads.length > 0 && (
        <section
          aria-label="PODs ready to invoice"
          className="rounded-2xl border border-infamous-orange/30 bg-gradient-to-r from-infamous-orange/10 via-infamous-card to-infamous-card p-5"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-infamous-orange/15 text-infamous-orange">
                <FileCheck2 size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold">PODs ready to invoice</h2>
                <p className="text-xs text-gray-400">
                  {podReadyLoads.length} delivered load{podReadyLoads.length === 1 ? '' : 's'} with a clean POD on file. One click drafts the invoice with carrier rate and broker billing details pre-filled.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-infamous-orange/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-infamous-orange">
              <Sparkles size={12} /> OCR verified
            </span>
          </div>
          <ul className="space-y-2">
            {podReadyLoads.map((load) => (
              <li
                key={load.loadRef}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-infamous-border bg-[#111] p-3"
              >
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{load.loadRef}</span>
                    <span className="badge badge-green text-[10px]">POD received</span>
                    <span className="text-[10px] text-gray-500">{load.podReceivedAt}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{load.lane}</p>
                  <p className="text-xs text-gray-500">{load.broker} · OCR confidence {load.ocrConfidence}%</p>
                </div>
                <p className="text-sm font-semibold text-white">${load.amount.toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => draftFromPod(load)}
                  className="rounded-xl bg-infamous-orange px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6d00]"
                >
                  Create invoice draft
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'draft', 'sent', 'overdue', 'paid'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-infamous-orange text-white' : 'bg-infamous-card text-gray-400 hover:text-white border border-infamous-border'
            }`}
          >
            {f} {f !== 'all' && <span className="text-xs opacity-70">({allInvoices.filter((i) => i.status === f).length})</span>}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-infamous-border">
                <th className="table-header">Invoice #</th>
                <th className="table-header">Broker</th>
                <th className="table-header">Load</th>
                <th className="table-header text-right">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Issued</th>
                <th className="table-header">Due</th>
                <th className="table-header text-right">Age</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="table-cell font-mono text-xs">{inv.number}</td>
                  <td className="table-cell font-medium">{inv.broker}</td>
                  <td className="table-cell text-xs text-gray-500">{inv.loadRef}</td>
                  <td className="table-cell text-right font-semibold">${inv.amount.toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`badge ${statusBadge[inv.status]} flex items-center gap-1 w-fit`}>
                      {statusIcon[inv.status]} {inv.status}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-gray-500">{inv.issueDate}</td>
                  <td className="table-cell text-xs text-gray-500">{inv.dueDate}</td>
                  <td className="table-cell text-right">
                    {inv.age > 0 ? (
                      <span className={`text-xs font-medium ${inv.age > 7 ? 'text-red-400' : 'text-yellow-400'}`}>{inv.age}d</span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-infamous-border text-gray-500 hover:text-white transition-colors">
                        <Download size={14} />
                      </button>
                      {inv.status === 'draft' && (
                        <button className="p-1.5 rounded-lg hover:bg-infamous-border text-gray-500 hover:text-infamous-orange transition-colors">
                          <Send size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={<FileText size={40} />}
                      title="No invoices match this filter"
                      description="Try selecting a different status or create a new invoice."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
