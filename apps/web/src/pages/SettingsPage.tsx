import { useState } from 'react';
import { User, CreditCard, Radio, Bell, Shield, Users, FileText, Zap } from 'lucide-react';
import BillingSettingsPanel from '@/components/billing/BillingSettingsPanel';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'eld', label: 'ELD Integration', icon: Radio },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeSection === section.id
                  ? 'bg-infamous-orange/10 text-infamous-orange border border-infamous-orange/20'
                  : 'text-gray-400 hover:text-white hover:bg-infamous-card'
              }`}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold">Company Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                  <input type="text" className="input-field" defaultValue="Iron Route Logistics LLC" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">MC Number</label>
                  <input type="text" className="input-field" defaultValue="MC-123456" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">DOT Number</label>
                  <input type="text" className="input-field" defaultValue="1234567" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">EIN</label>
                  <input type="text" className="input-field" defaultValue="12-3456789" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Address</label>
                  <input type="text" className="input-field" defaultValue="123 Main St, Dallas, TX 75201" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
                  <input type="email" className="input-field" defaultValue="dispatch@acmetrucking.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input type="text" className="input-field" defaultValue="(214) 555-0100" />
                </div>
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          )}

          {activeSection === 'billing' && <BillingSettingsPanel />}

          {activeSection === 'eld' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Connected ELD Providers</h2>
              {[
                { name: 'Samsara', status: 'connected', color: '#4CAF50' },
                { name: 'Motive (KeepTruckin)', status: 'available', color: '#2196F3' },
                { name: 'Omnitracs', status: 'available', color: '#FF9800' },
                { name: 'Geotab', status: 'available', color: '#9C27B0' },
              ].map((provider) => (
                <div key={provider.name} className="flex items-center justify-between p-4 bg-infamous-dark rounded-xl">
                  <div className="flex items-center gap-3">
                    <Radio size={18} style={{ color: provider.color }} />
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  {provider.status === 'connected' ? (
                    <div className="flex items-center gap-2">
                      <span className="badge-green text-[10px]">Connected</span>
                      <button className="text-xs text-gray-500 hover:text-red-400">Disconnect</button>
                    </div>
                  ) : (
                    <button className="btn-secondary text-xs py-1.5 px-3">Connect</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'team' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Team Members</h2>
                <button className="btn-primary text-sm">+ Invite Member</button>
              </div>
              {[
                { name: 'Marcus Johnson', email: 'marcus@acme.com', role: 'Owner', status: 'active' },
                { name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Dispatcher', status: 'active' },
                { name: 'Mike Ross', email: 'mike@acme.com', role: 'Safety Manager', status: 'pending' },
              ].map((member) => (
                <div key={member.email} className="flex items-center justify-between p-3 bg-infamous-dark rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-infamous-border flex items-center justify-center text-sm font-bold">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{member.role}</span>
                    <span className={`badge text-[10px] ${member.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              {[
                { label: 'New load matches', desc: 'When a load matches your lanes', default: true },
                { label: 'Driver HOS alerts', desc: 'When drivers approach hour limits', default: true },
                { label: 'Invoice reminders', desc: 'Payment due and overdue alerts', default: true },
                { label: 'Compliance expiry', desc: 'Documents expiring soon', default: true },
                { label: 'Rate spikes', desc: 'When rates on your lanes move 10% or more', default: false },
                { label: 'Weekly summary', desc: 'Monday morning weekly report', default: true },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-gray-500">{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={pref.default} className="sr-only peer" />
                    <div className="w-11 h-6 bg-infamous-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-infamous-orange" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Two-Factor Authentication</label>
                <div className="flex items-center justify-between p-3 bg-infamous-dark rounded-xl">
                  <span className="text-sm">Authenticator App</span>
                  <button className="btn-secondary text-xs py-1.5 px-3">Enable</button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">API Keys</label>
                <div className="flex items-center gap-2 p-3 bg-infamous-dark rounded-xl">
                  <code className="text-xs text-gray-400 flex-1 font-mono truncate">if_live_51SI7HQJBKY4ohJDA...</code>
                  <button className="text-xs text-infamous-orange hover:underline">Regenerate</button>
                </div>
              </div>
              <button className="btn-primary">Update Security Settings</button>
            </div>
          )}

          {activeSection === 'documents' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Document Templates</h2>
              {[
                { name: 'Rate Confirmation', desc: 'Default rate con template', lastUsed: '2 hours ago' },
                { name: 'Carrier Packet', desc: 'For new broker onboarding', lastUsed: '3 days ago' },
                { name: 'BOL Template', desc: 'Bill of Lading format', lastUsed: '1 day ago' },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 bg-infamous-dark rounded-xl">
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.desc} · Last used: {doc.lastUsed}</p>
                  </div>
                  <button className="text-sm text-infamous-orange hover:underline">Edit</button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Connected Services</h2>
              {[
                { name: 'QuickBooks Online', category: 'Accounting', status: 'connected' },
                { name: 'Xero', category: 'Accounting', status: 'available' },
                { name: 'RTS Financial', category: 'Factoring', status: 'available' },
                { name: 'Stripe', category: 'Payments', status: 'connected' },
                { name: 'SendGrid', category: 'Email', status: 'connected' },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 bg-infamous-dark rounded-xl">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-xs text-gray-500">{integration.category}</p>
                    </div>
                  </div>
                  {integration.status === 'connected' ? (
                    <span className="badge-green text-[10px]">Connected</span>
                  ) : (
                    <button className="btn-secondary text-xs py-1.5 px-3">Connect</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
