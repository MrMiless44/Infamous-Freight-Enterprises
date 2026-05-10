import { useState, useEffect } from 'react';
import api from '@/api-client/client';
import {
  ClipboardList, Plus, ChevronRight, ArrowRight,
  Truck, MapPin, Package, DollarSign, Calendar,
  CheckCircle, XCircle, Clock, RefreshCw, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';

type QuoteStatus = 'NEW' | 'REVIEWING' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'CONVERTED';

interface QuoteRequest {
  id: string;
  quoteNumber: string;
  shipper: string;
  pickupLocation: string;
  deliveryLocation: string;
  commodity: string;
  freightType: string;
  weight: string;
  equipmentNeeded: string;
  pickupDate: string;
  deliveryDeadline: string;
  status: QuoteStatus;
  quotedAmount?: number;
  estimatedCarrierCost?: number;
  targetMargin?: number;
  convertedLoadId?: string;
  createdAt: string;
}

const statusMap: Record<string, QuoteStatus> = {
  pending: 'NEW',
  reviewing: 'REVIEWING',
  quoted: 'QUOTED',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  converted: 'CONVERTED',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatWeight = (lbs: number) => lbs.toLocaleString() + ' lbs';

const statusConfig: Record<QuoteStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  NEW:       { label: 'Quote Pending',  badge: 'badge-blue',   icon: <ClipboardList size={11} /> },
  REVIEWING: { label: 'Rate Pending',   badge: 'badge-yellow', icon: <Eye size={11} /> },
  QUOTED:    { label: 'Rate Provided',  badge: 'badge-orange', icon: <DollarSign size={11} /> },
  APPROVED:  { label: 'Booked',         badge: 'badge-green',  icon: <CheckCircle size={11} /> },
  REJECTED:  { label: 'Declined',       badge: 'badge-red',    icon: <XCircle size={11} /> },
  CONVERTED: { label: 'Shipment Created', badge: 'badge-green',  icon: <RefreshCw size={11} /> },
};

const filterTabs: { key: 'all' | QuoteStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'NEW', label: 'Quote Pending' },
  { key: 'REVIEWING', label: 'Rate Pending' },
  { key: 'QUOTED', label: 'Rate Provided' },
  { key: 'APPROVED', label: 'Booked' },
  { key: 'REJECTED', label: 'Declined' },
  { key: 'CONVERTED', label: 'Shipment Created' },
];

const QuoteRequestsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | QuoteStatus>('all');
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [converting, setConverting] = useState(false);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { quotes: apiQuotes } = await api.getQuotes();
      const mapped: QuoteRequest[] = apiQuotes.map((q: any) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        shipper: q.shipper,
        pickupLocation: q.origin,
        deliveryLocation: q.destination,
        commodity: q.freightType,
        freightType: q.freightType,
        weight: formatWeight(q.weightLbs),
        equipmentNeeded: q.equipment,
        pickupDate: formatDate(q.pickupDate),
        deliveryDeadline: formatDate(q.deliveryDeadline),
        status: statusMap[q.status] || 'NEW',
        quotedAmount: q.quotedAmount,
        estimatedCarrierCost: q.estimatedCarrierCost,
        targetMargin: q.targetMargin,
        convertedLoadId: q.convertedLoadId,
        createdAt: formatDate(q.createdAt),
      }));
      setQuotes(mapped);
    } catch (err) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const filtered = filter === 'all' ? quotes : quotes.filter((q) => q.status === filter);

  const counts = filterTabs.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.key] = tab.key === 'all'
      ? quotes.length
      : quotes.filter((q) => q.status === tab.key).length;
    return acc;
  }, {});

  const handleConvert = async () => {
    if (!selectedQuote || selectedQuote.status === 'CONVERTED') return;
    setConverting(true);
    try {
      await api.convertQuoteToLoad(selectedQuote.id);
      toast.success(`Quote ${selectedQuote.quoteNumber} converted to load.`);
      setSelectedQuote(null);
      await fetchQuotes();
    } catch (err) {
      toast.error('Failed to convert quote to load');
    } finally {
      setConverting(false);
    }
  };

  const grossMargin = selectedQuote?.quotedAmount && selectedQuote?.estimatedCarrierCost
    ? selectedQuote.quotedAmount - selectedQuote.estimatedCarrierCost
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quote Requests</h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Review, quote, and convert shipper requests to loads</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Quote
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Quotes', value: quotes.filter((q) => ['NEW','REVIEWING','QUOTED'].includes(q.status)).length, icon: <ClipboardList size={18} />, color: 'text-infamous-orange' },
          { label: 'Awaiting Approval', value: quotes.filter((q) => q.status === 'APPROVED').length, icon: <CheckCircle size={18} />, color: 'text-green-400' },
          { label: 'Converted to Loads', value: quotes.filter((q) => q.status === 'CONVERTED').length, icon: <RefreshCw size={18} />, color: 'text-blue-400' },
          { label: 'Rejected', value: quotes.filter((q) => q.status === 'REJECTED').length, icon: <XCircle size={18} />, color: 'text-red-400' },
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

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === tab.key ? 'bg-infamous-orange text-[#F5E8E8]' : 'bg-infamous-card text-[#B88989] hover:text-[#F5E8E8] border border-infamous-border'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && <span className="ml-1.5 opacity-70">({counts[tab.key]})</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote List */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-infamous-border">
                <th className="table-header">Quote #</th>
                <th className="table-header">Shipper</th>
                <th className="table-header">Route</th>
                <th className="table-header">Equipment</th>
                <th className="table-header">Pickup</th>
                <th className="table-header">Status</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => {
                const cfg = statusConfig[quote.status];
                return (
                  <tr
                    key={quote.id}
                    className="hover:bg-infamous-panel transition-colors cursor-pointer"
                    onClick={() => setSelectedQuote(quote)}
                  >
                    <td className="table-cell font-mono text-xs">{quote.quoteNumber}</td>
                    <td className="table-cell font-medium">{quote.shipper}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="truncate max-w-[80px]">{quote.pickupLocation.split(',')[0]}</span>
                        <ArrowRight size={10} className="text-[#B88989]/60 flex-shrink-0" />
                        <span className="truncate max-w-[80px]">{quote.deliveryLocation.split(',')[0]}</span>
                      </div>
                    </td>
                    <td className="table-cell text-xs text-[#B88989]/70">{quote.equipmentNeeded}</td>
                    <td className="table-cell text-xs text-[#B88989]/70">{quote.pickupDate}</td>
                    <td className="table-cell">
                      <span className={`badge ${cfg.badge} flex items-center gap-1 w-fit`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <ChevronRight size={14} className="text-[#B88989]/70" />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No quotes found" description="Try adjusting your search or filter criteria" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quote Detail Panel */}
        <div className="card">
          {selectedQuote ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quote Detail</h2>
                <button onClick={() => setSelectedQuote(null)} className="text-[#B88989]/70 hover:text-[#F5E8E8] text-xs">Close</button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-[#B88989]/70">{selectedQuote.quoteNumber}</span>
                  <span className={`badge ${statusConfig[selectedQuote.status].badge} flex items-center gap-1`}>
                    {statusConfig[selectedQuote.status].icon}
                    {statusConfig[selectedQuote.status].label}
                  </span>
                </div>
                <p className="font-bold text-base">{selectedQuote.shipper}</p>
                <p className="text-xs text-[#B88989]/70 mt-0.5">Submitted {selectedQuote.createdAt}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#B88989]/70 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#B88989]/70">Pickup</p>
                    <p>{selectedQuote.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-infamous-orange mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#B88989]/70">Delivery</p>
                    <p>{selectedQuote.deliveryLocation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-[#B88989]/70" />
                  <div>
                    <span className="text-xs text-[#B88989]/70">Commodity: </span>
                    <span>{selectedQuote.commodity} · {selectedQuote.weight}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#B88989]/70" />
                  <span>{selectedQuote.equipmentNeeded} · {selectedQuote.freightType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#B88989]/70" />
                  <div className="text-xs">
                    <span className="text-[#B88989]/70">Pickup: </span>{selectedQuote.pickupDate}
                    <span className="text-[#B88989]/70 ml-2">Deadline: </span>{selectedQuote.deliveryDeadline}
                  </div>
                </div>
              </div>

              {selectedQuote.quotedAmount && (
                <div className="border-t border-infamous-border pt-4 space-y-2">
                  <p className="text-xs text-[#B88989]/70 uppercase tracking-wider">Financials</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B88989]">Quoted to Shipper</span>
                      <span className="font-semibold">${selectedQuote.quotedAmount.toLocaleString()}</span>
                    </div>
                    {selectedQuote.estimatedCarrierCost && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#B88989]">Est. Carrier Cost</span>
                        <span className="text-blue-400">${selectedQuote.estimatedCarrierCost.toLocaleString()}</span>
                      </div>
                    )}
                    {grossMargin !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#B88989]">Gross Margin</span>
                        <span className="text-green-400 font-semibold">
                          ${grossMargin.toLocaleString()}
                          {selectedQuote.targetMargin && <span className="text-xs ml-1">({selectedQuote.targetMargin}%)</span>}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedQuote.convertedLoadId && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} /> Converted to <span className="font-mono font-bold ml-1">{selectedQuote.convertedLoadId}</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-infamous-border pt-4 space-y-2">
                {selectedQuote.status === 'NEW' && (
                  <button className="w-full btn-primary flex items-center justify-center gap-2" onClick={async () => {
                    try {
                      await api.updateQuote(selectedQuote.id, { status: 'reviewing' });
                      toast.success('Quote review started');
                      setSelectedQuote(null);
                      await fetchQuotes();
                    } catch (err) {
                      toast.error('Failed to start review');
                    }
                  }}>
                    <Eye size={15} /> Start Review
                  </button>
                )}
                {selectedQuote.status === 'REVIEWING' && (
                  <button className="w-full btn-primary flex items-center justify-center gap-2" onClick={async () => {
                    try {
                      await api.updateQuote(selectedQuote.id, { status: 'quoted' });
                      toast.success('Quote submitted');
                      setSelectedQuote(null);
                      await fetchQuotes();
                    } catch (err) {
                      toast.error('Failed to submit quote');
                    }
                  }}>
                    <DollarSign size={15} /> Submit Quote
                  </button>
                )}
                {selectedQuote.status === 'QUOTED' && (
                  <>
                    <button className="w-full btn-primary flex items-center justify-center gap-2" onClick={async () => {
                      try {
                        await api.updateQuote(selectedQuote.id, { status: 'approved' });
                        toast.success('Quote approved');
                        setSelectedQuote(null);
                        await fetchQuotes();
                      } catch (err) {
                        toast.error('Failed to approve quote');
                      }
                    }}>
                      <CheckCircle size={15} /> Approve Quote
                    </button>
                    <button className="w-full btn-secondary flex items-center justify-center gap-2 text-red-400" onClick={async () => {
                      try {
                        await api.updateQuote(selectedQuote.id, { status: 'rejected' });
                        toast.success('Quote rejected');
                        setSelectedQuote(null);
                        await fetchQuotes();
                      } catch (err) {
                        toast.error('Failed to reject quote');
                      }
                    }}>
                      <XCircle size={15} /> Reject
                    </button>
                  </>
                )}
                {selectedQuote.status === 'APPROVED' && (
                  <button
                    className="w-full btn-primary flex items-center justify-center gap-2"
                    onClick={handleConvert}
                    disabled={converting}
                  >
                    {converting ? (
                      <><Clock size={15} className="animate-spin" /> Converting...</>
                    ) : (
                      <><RefreshCw size={15} /> Convert to Load</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <ClipboardList size={32} className="text-[#B88989]/60 mx-auto mb-3" />
              <p className="text-sm text-[#B88989]/70">Select a quote to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestsPage;
