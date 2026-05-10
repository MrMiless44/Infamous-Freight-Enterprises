import { useEffect, useState } from 'react';
import { FileText, DollarSign, Clock, Send, CheckCircle, AlertTriangle, Download, TrendingUp, FileCheck2, Sparkles } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import api from '@/api-client/client';

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [podReadyLoads, setPodReadyLoads] = useState<PodReadyLoad[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [invRes, loadsRes] = await Promise.all([
        api.getInvoices(),
        api.getLoads('pod_uploaded'),
      ]);
      const now = new Date();
      const fmt = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      };
      setInvoices(
        invRes.invoices.map((inv: any) => ({
          id: inv.id,
          number: inv.invoiceNumber,
          broker: inv.customerName,
          loadRef: inv.loadId || '—',
          amount: inv.amount,
          status: inv.status as Invoice['status'],
          issueDate: inv.issuedAt ? fmt(inv.issuedAt) : '—',
          dueDate: inv.dueAt ? fmt(inv.dueAt) : '—',
          age: inv.status !== 'paid' && inv.dueAt
            ? Math.max(0, Math.floor((now.getTime() - new Date(inv.dueAt).getTime()) / 86400000))
            : 0,
        }))
      );
      setPodReadyLoads(
        loadsRes.loads
          .filter((l: any) => l.status === 'pod_uploaded')
          .map((l: any) => ({
            loadRef: l.id,
            broker: l.broker,
            lane: l.lane,
            amount: l.amount,
            podReceivedAt: l.podReceivedAt,
            ocrConfidence: l.ocrConfidence,
          }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter);

  const totalOutstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const draftFromPod = async (load: PodReadyLoad) => {
    await api.createInvoice({ loadId: load.loadRef, customerName: load.broker, amount: load.amount, status: 'draft' });
    setFilter('draft');
    await fetchData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Manage billing and track payments</p>
        </div>
        <button onClick={async () => { await api.createInvoice({}); await fetchData(); }} className="btn-primary flex items-center gap-2">
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
              <p className="text-xs text-[#B88989]/70">{stat.label}</p>
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
                <p className="text-xs text-[#B88989]">
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
                className="flex flex-wrap items-center gap-3 rounded-xl border border-infamous-border bg-infamous-panel p-3"
              >
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-[#B88989]/70">{load.loadRef}</span>
                    <span className="badge badge-green text-[10px]">POD received</span>
                    <span className="text-[10px] text-[#B88989]/70">{load.podReceivedAt}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{load.lane}</p>
                  <p className="text-xs text-[#B88989]/70">{load.broker} · OCR confidence {load.ocrConfidence}%</p>
                </div>
                <p className="text-sm font-semibold text-[#F5E8E8]">${load.amount.toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => draftFromPod(load)}
                  className="rounded-xl bg-infamous-orange px-4 py-2 text-xs font-semibold text-[#F5E8E8] hover:bg-[#ff6d00]"
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
              filter === f ? 'bg-infamous-orange text-[#F5E8E8]' : 'bg-infamous-card text-[#B88989] hover:text-[#F5E8E8] border border-infamous-border'
            }`}
          >
            {f} {f !== 'all' && <span className="text-xs opacity-70">({invoices.filter((i) => i.status === f).length})</span>}
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
                <tr key={inv.id} className="hover:bg-infamous-panel transition-colors">
                  <td className="table-cell font-mono text-xs">{inv.number}</td>
                  <td className="table-cell font-medium">{inv.broker}</td>
                  <td className="table-cell text-xs text-[#B88989]/70">{inv.loadRef}</td>
                  <td className="table-cell text-right font-semibold">${inv.amount.toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`badge ${statusBadge[inv.status]} flex items-center gap-1 w-fit`}>
                      {statusIcon[inv.status]} {inv.status}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-[#B88989]/70">{inv.issueDate}</td>
                  <td className="table-cell text-xs text-[#B88989]/70">{inv.dueDate}</td>
                  <td className="table-cell text-right">
                    {inv.age > 0 ? (
                      <span className={`text-xs font-medium ${inv.age > 7 ? 'text-red-400' : 'text-yellow-400'}`}>{inv.age}d</span>
                    ) : (
                      <span className="text-xs text-[#B88989]/60">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-infamous-border text-[#B88989]/70 hover:text-[#F5E8E8] transition-colors">
                        <Download size={14} />
                      </button>
                      {inv.status === 'draft' && (
                        <button className="p-1.5 rounded-lg hover:bg-infamous-border text-[#B88989]/70 hover:text-infamous-orange transition-colors">
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
