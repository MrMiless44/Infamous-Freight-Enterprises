import { useState, useEffect } from 'react';
import api from '@/api-client/client';
import {
  Building2, Plus, Search, ChevronRight, Mail, Phone, MapPin,
  Edit2, X, Check, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import WidgetErrorBoundary from '@/components/ui/WidgetErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';
import type { Company } from '@/types';

type CompanyFilter = 'all' | 'shipper' | 'broker' | 'carrier';

const filterTabs: { key: CompanyFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'shipper', label: 'Shippers' },
  { key: 'broker', label: 'Brokers' },
  { key: 'carrier', label: 'Carriers' },
];

const typeColors: Record<string, string> = {
  shipper: 'bg-blue-500/20 text-blue-400',
  broker: 'bg-purple-500/20 text-purple-400',
  carrier: 'bg-green-500/20 text-green-400',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  suspended: 'bg-red-500/20 text-red-400',
};

const CustomersPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CompanyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'shipper', contactName: '', contactEmail: '', contactPhone: '', address: '', city: '', state: '', zip: '' });
  const [saving, setSaving] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { companies: list } = await api.getCompanies(filter === 'all' ? undefined : filter);
      setCompanies(list);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [filter]);

  const filtered = searchQuery
    ? companies.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.contactName && c.contactName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.contactEmail && c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : companies;

  const counts = {
    all: companies.length,
    shipper: companies.filter((c) => c.type === 'shipper').length,
    broker: companies.filter((c) => c.type === 'broker').length,
    carrier: companies.filter((c) => c.type === 'carrier').length,
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) { toast.error('Company name is required'); return; }
    setSaving(true);
    try {
      await api.createCompany(formData);
      toast.success('Company created');
      setShowCreateForm(false);
      setFormData({ name: '', type: 'shipper', contactName: '', contactEmail: '', contactPhone: '', address: '', city: '', state: '', zip: '' });
      await fetchCompanies();
    } catch {
      toast.error('Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (company: Company, newStatus: string) => {
    try {
      await api.updateCompany(company.id, { status: newStatus });
      toast.success(`Company ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      setSelectedCompany(null);
      await fetchCompanies();
    } catch {
      toast.error('Failed to update company status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 size={24} className="text-infamous-red-light" />
            Customers & Companies
          </h1>
          <p className="text-sm text-[#B88989]/70 mt-0.5">Manage shippers, brokers, and carrier accounts</p>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Company
        </button>
      </div>

      <WidgetErrorBoundary label="Summary">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Companies', value: counts.all, icon: <Building2 size={18} />, color: 'text-infamous-orange' },
            { label: 'Shippers', value: counts.shipper, icon: <Users size={18} />, color: 'text-blue-400' },
            { label: 'Brokers', value: counts.broker, icon: <Users size={18} />, color: 'text-purple-400' },
            { label: 'Carriers', value: counts.carrier, icon: <Users size={18} />, color: 'text-green-400' },
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
      </WidgetErrorBoundary>

      <div className="flex items-center gap-3 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === tab.key ? 'bg-infamous-orange text-[#F5E8E8]' : 'bg-infamous-card text-[#B88989] hover:text-[#F5E8E8] border border-infamous-border'
            }`}
          >
            {tab.label}
            {filter === 'all' && <span className="ml-1.5 opacity-70">({counts[tab.key]})</span>}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto rounded-xl border border-infamous-border bg-infamous-panel px-3 py-1.5">
          <Search size={14} className="text-infamous-muted" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-[#F5E8E8] placeholder-[#B88989]/60 focus:outline-none w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-infamous-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-infamous-border">
                  <th className="table-header">Company</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Status</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => (
                  <tr
                    key={company.id}
                    className={`hover:bg-infamous-panel transition-colors cursor-pointer ${selectedCompany?.id === company.id ? 'bg-infamous-panel' : ''}`}
                    onClick={() => setSelectedCompany(company)}
                  >
                    <td className="table-cell">
                      <p className="font-medium text-sm">{company.name}</p>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${typeColors[company.type] || 'bg-gray-500/20 text-gray-400'}`}>
                        {company.type}
                      </span>
                    </td>
                    <td className="table-cell">
                      <p className="text-xs">{company.contactName || '—'}</p>
                      <p className="text-[10px] text-[#B88989]/60">{company.contactEmail || ''}</p>
                    </td>
                    <td className="table-cell text-xs text-[#B88989]/70">
                      {company.city && company.state ? `${company.city}, ${company.state}` : '—'}
                    </td>
                    <td className="table-cell">
                      <span className={`badge text-xs ${statusColors[company.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <ChevronRight size={14} className="text-[#B88989]/70" />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState title="No companies found" description="Add a company or adjust your search." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          {showCreateForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">New Company</h2>
                <button onClick={() => setShowCreateForm(false)} className="text-[#B88989]/70 hover:text-[#F5E8E8]"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#B88989]/70 block mb-1">Company Name *</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] focus:outline-none focus:ring-1 focus:ring-infamous-red/30" />
                </div>
                <div>
                  <label className="text-xs text-[#B88989]/70 block mb-1">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-lg border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] focus:outline-none focus:ring-1 focus:ring-infamous-red/30">
                    <option value="shipper">Shipper</option>
                    <option value="broker">Broker</option>
                    <option value="carrier">Carrier</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#B88989]/70 block mb-1">Contact Name</label>
                  <input value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className="w-full rounded-lg border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] focus:outline-none focus:ring-1 focus:ring-infamous-red/30" />
                </div>
                <div>
                  <label className="text-xs text-[#B88989]/70 block mb-1">Email</label>
                  <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full rounded-lg border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] focus:outline-none focus:ring-1 focus:ring-infamous-red/30" />
                </div>
                <div>
                  <label className="text-xs text-[#B88989]/70 block mb-1">Phone</label>
                  <input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full rounded-lg border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] focus:outline-none focus:ring-1 focus:ring-infamous-red/30" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs text-[#B88989]/70 block mb-1">City</label>
                    <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full rounded-lg border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] focus:outline-none focus:ring-1 focus:ring-infamous-red/30" />
                  </div>
                  <div>
                    <label className="text-xs text-[#B88989]/70 block mb-1">State</label>
                    <input maxLength={2} value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] focus:outline-none focus:ring-1 focus:ring-infamous-red/30" />
                  </div>
                </div>
                <button onClick={handleCreate} disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2">
                  {saving ? 'Creating...' : <><Check size={15} /> Create Company</>}
                </button>
              </div>
            </div>
          ) : selectedCompany ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Company Detail</h2>
                <button onClick={() => setSelectedCompany(null)} className="text-[#B88989]/70 hover:text-[#F5E8E8] text-xs">Close</button>
              </div>
              <div>
                <p className="font-bold text-base">{selectedCompany.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge text-xs ${typeColors[selectedCompany.type] || 'bg-gray-500/20 text-gray-400'}`}>{selectedCompany.type}</span>
                  <span className={`badge text-xs ${statusColors[selectedCompany.status] || 'bg-gray-500/20 text-gray-400'}`}>{selectedCompany.status}</span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {selectedCompany.contactName && (
                  <div className="flex items-center gap-2">
                    <Edit2 size={14} className="text-[#B88989]/70" />
                    <span>{selectedCompany.contactName}</span>
                  </div>
                )}
                {selectedCompany.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#B88989]/70" />
                    <span className="text-blue-400">{selectedCompany.contactEmail}</span>
                  </div>
                )}
                {selectedCompany.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#B88989]/70" />
                    <span>{selectedCompany.contactPhone}</span>
                  </div>
                )}
                {selectedCompany.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#B88989]/70" />
                    <span>
                      {[selectedCompany.address, selectedCompany.city, selectedCompany.state, selectedCompany.zip].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {selectedCompany.createdAt && (
                  <p className="text-xs text-[#B88989]/70 mt-2">
                    Created: {new Date(selectedCompany.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="border-t border-infamous-border pt-4 space-y-2">
                {selectedCompany.status === 'active' ? (
                  <button
                    onClick={() => handleStatusChange(selectedCompany, 'inactive')}
                    className="w-full btn-secondary flex items-center justify-center gap-2 text-red-400 text-sm"
                  >
                    <X size={14} /> Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(selectedCompany, 'active')}
                    className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <Check size={14} /> Activate
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Building2 size={32} className="text-[#B88989]/60 mx-auto mb-3" />
              <p className="text-sm text-[#B88989]/70">Select a company to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
