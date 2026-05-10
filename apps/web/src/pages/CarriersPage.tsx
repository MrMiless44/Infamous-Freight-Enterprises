import { useState } from 'react';
import {
  Truck, ShieldCheck, Clock, AlertTriangle, XCircle, FileText,
  CheckCircle, ChevronRight, Plus, Search, Phone, Mail
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

type CarrierStatus = 'pending' | 'approved' | 'needs_documents' | 'expiring_insurance' | 'rejected';

interface Carrier {
  id: string;
  companyName: string;
  mcNumber: string;
  dotNumber: string;
  contactName: string;
  email: string;
  phone: string;
  equipmentType: string;
  insuranceExpiry: string;
  daysUntilExpiry: number;
  w9Status: 'verified' | 'pending' | 'missing';
  agreementStatus: 'signed' | 'pending' | 'missing';
  approvalStatus: CarrierStatus;
  activeLoads: number;
}

const mockCarriers: Carrier[] = [
  {
    id: '1',
    companyName: 'Swift Logistics LLC',
    mcNumber: 'MC-123456',
    dotNumber: 'DOT-789012',
    contactName: 'John Smith',
    email: 'john@swiftlogistics.com',
    phone: '(555) 101-2020',
    equipmentType: 'Dry Van',
    insuranceExpiry: '2025-12-15',
    daysUntilExpiry: 232,
    w9Status: 'verified',
    agreementStatus: 'signed',
    approvalStatus: 'approved',
    activeLoads: 3,
  },
  {
    id: '2',
    companyName: 'Desert Haul Co.',
    mcNumber: 'MC-234567',
    dotNumber: 'DOT-890123',
    contactName: 'Maria Garcia',
    email: 'maria@deserthaul.com',
    phone: '(555) 202-3030',
    equipmentType: 'Reefer',
    insuranceExpiry: '2025-05-20',
    daysUntilExpiry: 23,
    w9Status: 'verified',
    agreementStatus: 'signed',
    approvalStatus: 'expiring_insurance',
    activeLoads: 1,
  },
  {
    id: '3',
    companyName: 'Midland Freight Inc.',
    mcNumber: 'MC-345678',
    dotNumber: 'DOT-901234',
    contactName: 'Robert Lee',
    email: 'robert@midlandfreight.com',
    phone: '(555) 303-4040',
    equipmentType: 'Flatbed',
    insuranceExpiry: '2025-09-10',
    daysUntilExpiry: 136,
    w9Status: 'pending',
    agreementStatus: 'missing',
    approvalStatus: 'needs_documents',
    activeLoads: 0,
  },
  {
    id: '4',
    companyName: 'Pacific Freight Co.',
    mcNumber: 'MC-456789',
    dotNumber: 'DOT-012345',
    contactName: 'Susan Chen',
    email: 'susan@pacificfreight.com',
    phone: '(555) 404-5050',
    equipmentType: 'Dry Van',
    insuranceExpiry: '—',
    daysUntilExpiry: 0,
    w9Status: 'missing',
    agreementStatus: 'missing',
    approvalStatus: 'pending',
    activeLoads: 0,
  },
  {
    id: '5',
    companyName: 'Northeast Express LLC',
    mcNumber: 'MC-567890',
    dotNumber: 'DOT-123456',
    contactName: 'David Kim',
    email: 'david@northeastexpress.com',
    phone: '(555) 505-6060',
    equipmentType: 'Reefer',
    insuranceExpiry: '—',
    daysUntilExpiry: 0,
    w9Status: 'pending',
    agreementStatus: 'pending',
    approvalStatus: 'rejected',
    activeLoads: 0,
  },
];

const statusConfig: Record<CarrierStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  approved:           { label: 'Approved',           badge: 'badge-green',  icon: <CheckCircle size={12} /> },
  pending:            { label: 'Pending',             badge: 'badge-yellow', icon: <Clock size={12} /> },
  needs_documents:    { label: 'Needs Documents',     badge: 'badge-blue',   icon: <FileText size={12} /> },
  expiring_insurance: { label: 'Expiring Insurance',  badge: 'badge-yellow', icon: <AlertTriangle size={12} /> },
  rejected:           { label: 'Rejected',            badge: 'badge-red',    icon: <XCircle size={12} /> },
};

const filterTabs: { key: 'all' | CarrierStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'needs_documents', label: 'Needs Documents' },
  { key: 'expiring_insurance', label: 'Expiring Insurance' },
  { key: 'rejected', label: 'Rejected' },
];

const docBadge: Record<string, string> = {
  verified: 'badge-green',
  signed: 'badge-green',
  pending: 'badge-yellow',
  missing: 'badge-red',
};

const CarriersPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | CarrierStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);

  const filtered = mockCarriers.filter((c) => {
    const matchFilter = filter === 'all' || c.approvalStatus === filter;
    const matchSearch = !search ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.mcNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = filterTabs.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.key] = tab.key === 'all'
      ? mockCarriers.length
      : mockCarriers.filter((c) => c.approvalStatus === tab.key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carriers</h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Manage carrier onboarding, approval, and compliance</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Carrier
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Pending Review', value: counts.pending, icon: <Clock size={18} />, color: 'text-yellow-400' },
          { label: 'Approved', value: counts.approved, icon: <CheckCircle size={18} />, color: 'text-green-400' },
          { label: 'Needs Documents', value: counts.needs_documents, icon: <FileText size={18} />, color: 'text-blue-400' },
          { label: 'Expiring Insurance', value: counts.expiring_insurance, icon: <AlertTriangle size={18} />, color: 'text-yellow-400' },
          { label: 'Rejected', value: counts.rejected, icon: <XCircle size={18} />, color: 'text-red-400' },
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

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B88989]/70" />
          <input
            className="input-field pl-9 py-2"
            placeholder="Search by name, MC#, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
              {counts[tab.key] > 0 && (
                <span className="ml-1.5 opacity-70">({counts[tab.key]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carrier List */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-infamous-border">
                <th className="table-header">Carrier</th>
                <th className="table-header">MC / DOT</th>
                <th className="table-header">Equipment</th>
                <th className="table-header">Documents</th>
                <th className="table-header">Status</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((carrier) => {
                const cfg = statusConfig[carrier.approvalStatus];
                return (
                  <tr
                    key={carrier.id}
                    className="hover:bg-infamous-panel transition-colors cursor-pointer"
                    onClick={() => setSelectedCarrier(carrier)}
                  >
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-[#F5E8E8]">{carrier.companyName}</p>
                        <p className="text-xs text-[#B88989]/70">{carrier.contactName}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-xs">
                        <p className="font-mono">{carrier.mcNumber}</p>
                        <p className="text-[#B88989]/70">{carrier.dotNumber}</p>
                      </div>
                    </td>
                    <td className="table-cell text-xs">{carrier.equipmentType}</td>
                    <td className="table-cell">
                      <div className="flex gap-1 flex-wrap">
                        <span className={`badge text-[10px] ${docBadge[carrier.w9Status]}`}>W-9</span>
                        <span className={`badge text-[10px] ${docBadge[carrier.agreementStatus]}`}>Agmt</span>
                      </div>
                    </td>
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
                  <td colSpan={6}>
                    <EmptyState
                      icon={<Truck size={40} />}
                      title="No carriers found"
                      description="Try adjusting your search or filter to find carriers."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail / Approval Panel */}
        <div className="card">
          {selectedCarrier ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Carrier Detail</h2>
                <button onClick={() => setSelectedCarrier(null)} className="text-[#B88989]/70 hover:text-[#F5E8E8] text-xs">Close</button>
              </div>

              <div>
                <p className="font-bold text-base">{selectedCarrier.companyName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${statusConfig[selectedCarrier.approvalStatus].badge} flex items-center gap-1`}>
                    {statusConfig[selectedCarrier.approvalStatus].icon}
                    {statusConfig[selectedCarrier.approvalStatus].label}
                  </span>
                  {selectedCarrier.activeLoads > 0 && (
                    <span className="badge badge-blue">{selectedCarrier.activeLoads} active loads</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#B88989]">
                  <Phone size={14} /> {selectedCarrier.phone}
                </div>
                <div className="flex items-center gap-2 text-[#B88989]">
                  <Mail size={14} /> {selectedCarrier.email}
                </div>
                <div className="flex items-center gap-2 text-[#B88989]">
                  <Truck size={14} /> {selectedCarrier.equipmentType}
                </div>
              </div>

              <div className="border-t border-infamous-border pt-4 space-y-2">
                <p className="text-xs text-[#B88989]/70 uppercase tracking-wider">Documents</p>
                {[
                  { label: 'W-9', status: selectedCarrier.w9Status },
                  { label: 'Operating Agreement', status: selectedCarrier.agreementStatus },
                  { label: 'Insurance', status: selectedCarrier.daysUntilExpiry > 0 ? (selectedCarrier.daysUntilExpiry < 30 ? 'pending' : 'verified') : 'missing' },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-center justify-between">
                    <span className="text-sm">{doc.label}</span>
                    <span className={`badge text-[10px] ${docBadge[doc.status] ?? 'badge-yellow'}`}>{doc.status}</span>
                  </div>
                ))}
                {selectedCarrier.daysUntilExpiry > 0 && selectedCarrier.daysUntilExpiry < 30 && (
                  <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                    <AlertTriangle size={12} /> Insurance expires in {selectedCarrier.daysUntilExpiry} days
                  </p>
                )}
              </div>

              {selectedCarrier.approvalStatus === 'pending' || selectedCarrier.approvalStatus === 'needs_documents' ? (
                <div className="border-t border-infamous-border pt-4 space-y-2">
                  <button className="w-full btn-primary flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> Approve Carrier
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center gap-2 text-red-400 hover:text-red-300">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-10">
              <Truck size={32} className="text-[#B88989]/60 mx-auto mb-3" />
              <p className="text-sm text-[#B88989]/70">Select a carrier to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarriersPage;
