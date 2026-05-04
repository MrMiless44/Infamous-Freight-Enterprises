import React, { useState } from 'react';
import {
  Truck,
  Users,
  MapPin,
  Shield,
  Radio,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Building2,
  FileText,
  CreditCard
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const STEPS: OnboardingStep[] = [
  { id: 'company', label: 'Company', icon: <Building2 size={20} />, description: 'MC#, DOT, insurance' },
  { id: 'fleet', label: 'Fleet', icon: <Truck size={20} />, description: 'Drivers & equipment' },
  { id: 'lanes', label: 'Lanes', icon: <MapPin size={20} />, description: 'Preferred routes' },
  { id: 'eld', label: 'ELD', icon: <Radio size={20} />, description: 'Connect ELD' },
  { id: 'team', label: 'Team', icon: <Users size={20} />, description: 'Invite dispatchers' },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={20} />, description: 'Payment setup' },
];

const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, any>>({});

  const step = STEPS[currentStep];
  const progress = Math.round(((completedSteps.size) / STEPS.length) * 100);

  const markComplete = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const updateField = (stepId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], [field]: value },
    }));
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'company':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Company Name</label>
              <input
                type="text"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                placeholder="Iron Route Logistics LLC"
                value={formData.company?.name || ''}
                onChange={e => updateField('company', 'name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">MC Number</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                  placeholder="123456"
                  value={formData.company?.mcNumber || ''}
                  onChange={e => updateField('company', 'mcNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">USDOT Number</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                  placeholder="1234567"
                  value={formData.company?.dotNumber || ''}
                  onChange={e => updateField('company', 'dotNumber', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Address</label>
              <input
                type="text"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                placeholder="123 Main St, Dallas, TX 75201"
                value={formData.company?.address || ''}
                onChange={e => updateField('company', 'address', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Insurance Certificate (COI)</label>
              <div className="border-2 border-dashed border-[#333] rounded-lg p-6 text-center hover:border-[#ff3d00] transition-colors cursor-pointer">
                <FileText className="mx-auto mb-2 text-gray-500" size={32} />
                <p className="text-sm text-gray-400">Drop a COI PDF here, or click to browse. Our team reviews it before activation.</p>
              </div>
            </div>
          </div>
        );

      case 'fleet':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Number of Trucks</label>
              <input
                type="number"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                placeholder="12"
                value={formData.fleet?.truckCount || ''}
                onChange={e => updateField('fleet', 'truckCount', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Equipment Types</label>
              <div className="grid grid-cols-2 gap-2">
                {['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Power Only', 'Box Truck'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const current = formData.fleet?.equipmentTypes || [];
                      const updated = current.includes(type)
                        ? current.filter((t: string) => t !== type)
                        : [...current, type];
                      updateField('fleet', 'equipmentTypes', updated);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                      (formData.fleet?.equipmentTypes || []).includes(type)
                        ? 'bg-[#ff3d00]/20 border-[#ff3d00] text-[#ff3d00]'
                        : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-[#555]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Add Drivers</label>
              <div className="space-y-2">
                {(formData.fleet?.drivers || []).map((driver: any, i: number) => (
                  <div key={i} className="flex gap-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm text-white">{driver.name}</p>
                      <p className="text-xs text-gray-500">{driver.license} • {driver.equipment}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const current = formData.fleet?.drivers || [];
                    updateField('fleet', 'drivers', [
                      ...current,
                      { name: `Driver ${current.length + 1}`, license: 'CDL-A', equipment: 'Dry Van' }
                    ]);
                  }}
                  className="w-full py-2 border border-dashed border-[#333] rounded-lg text-sm text-gray-500 hover:border-[#ff3d00] hover:text-[#ff3d00] transition-all"
                >
                  + Add Driver
                </button>
              </div>
            </div>
          </div>
        );

      case 'lanes':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Primary Lanes (top 3)</label>
              {['Lane 1', 'Lane 2', 'Lane 3'].map((label, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white text-sm focus:border-[#ff3d00] focus:outline-none"
                    placeholder="Origin City, ST"
                    value={formData.lanes?.[`origin${i}`] || ''}
                    onChange={e => updateField('lanes', `origin${i}`, e.target.value)}
                  />
                  <span className="text-gray-500 self-center">→</span>
                  <input
                    type="text"
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white text-sm focus:border-[#ff3d00] focus:outline-none"
                    placeholder="Dest City, ST"
                    value={formData.lanes?.[`dest${i}`] || ''}
                    onChange={e => updateField('lanes', `dest${i}`, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avoid These States</label>
              <input
                type="text"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                placeholder="CA, NY, NJ (comma separated)"
                value={formData.lanes?.avoidStates || ''}
                onChange={e => updateField('lanes', 'avoidStates', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Minimum Rate/Mile</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                placeholder="2.50"
                value={formData.lanes?.minRatePerMile || ''}
                onChange={e => updateField('lanes', 'minRatePerMile', parseFloat(e.target.value))}
              />
            </div>
          </div>
        );

      case 'eld':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Connect your ELD so dispatch can see drivers' available hours in real time.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Samsara', color: '#4CAF50' },
                { name: 'Motive (KeepTruckin)', color: '#2196F3' },
                { name: 'Omnitracs', color: '#FF9800' },
                { name: 'Geotab', color: '#9C27B0' },
              ].map(provider => (
                <button
                  key={provider.name}
                  onClick={() => updateField('eld', 'provider', provider.name)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.eld?.provider === provider.name
                      ? 'border-[#ff3d00] bg-[#ff3d00]/10'
                      : 'border-[#333] bg-[#1a1a1a] hover:border-[#555]'
                  }`}
                >
                  <Radio size={24} style={{ color: provider.color }} className="mx-auto mb-2" />
                  <p className="text-sm text-white font-medium">{provider.name}</p>
                </button>
              ))}
            </div>
            {formData.eld?.provider && (
              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">You will be redirected to {formData.eld.provider} to authorize access.</p>
                <button className="w-full bg-[#ff3d00] hover:bg-[#ff6d00] text-white font-semibold py-2 rounded-lg transition-all">
                  Connect {formData.eld.provider}
                </button>
              </div>
            )}
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Invite Team Members</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#ff3d00] focus:outline-none"
                  placeholder="dispatcher@company.com"
                  value={formData.team?.inviteEmail || ''}
                  onChange={e => updateField('team', 'inviteEmail', e.target.value)}
                />
                <select
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-3 text-white text-sm focus:border-[#ff3d00] focus:outline-none"
                  value={formData.team?.inviteRole || 'dispatcher'}
                  onChange={e => updateField('team', 'inviteRole', e.target.value)}
                >
                  <option value="dispatcher">Dispatcher</option>
                  <option value="safety">Safety Manager</option>
                  <option value="accountant">Accountant</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const email = formData.team?.inviteEmail;
                  if (!email) return;
                  const current = formData.team?.members || [];
                  updateField('team', 'members', [...current, { email, role: formData.team?.inviteRole || 'dispatcher' }]);
                  updateField('team', 'inviteEmail', '');
                }}
                className="mt-2 w-full py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-400 hover:text-white hover:border-[#ff3d00] transition-all"
              >
                Send Invite
              </button>
            </div>
            {(formData.team?.members || []).length > 0 && (
              <div className="space-y-2">
                {(formData.team?.members || []).map((member: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
                    <div>
                      <p className="text-sm text-white">{member.email}</p>
                      <span className="text-xs text-[#ff3d00]">{member.role}</span>
                    </div>
                    <span className="text-xs text-yellow-500">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#ff3d00]/20 to-[#ff6d00]/10 border border-[#ff3d00]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Growth Plan</h3>
                <span className="text-2xl font-bold text-[#ff3d00]">$99<span className="text-sm text-gray-400">/mo</span></span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Unlimited loads & drivers</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Auto-dispatch AI</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Rate negotiation bot</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Voice booking</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Samsara/Motive/Geotab ELD sync</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-[#ff3d00]/20">
                <p className="text-xs text-gray-400">14-day free trial • No credit card required</p>
              </div>
            </div>
            <button
              onClick={markComplete}
              className="w-full bg-gradient-to-r from-[#ff3d00] to-[#ff6d00] hover:from-[#ff6d00] hover:to-[#ff8d00] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#ff3d00]/20"
            >
              Start 14-day free trial
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Infamous Freight</h1>
          <p className="text-gray-400">Six quick steps to get your fleet dispatching.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Setup Progress</span>
            <span className="text-sm font-semibold text-[#ff3d00]">{progress}%</span>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff3d00] to-[#ff6d00] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                i === currentStep
                  ? 'bg-[#ff3d00]/20 border border-[#ff3d00] text-[#ff3d00]'
                  : completedSteps.has(s.id)
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-[#1a1a1a] border border-[#333] text-gray-500'
              }`}
            >
              {completedSteps.has(s.id) ? <CheckCircle size={16} /> : s.icon}
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#ff3d00]/10 p-2.5 rounded-lg text-[#ff3d00]">
              {step.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{step.label}</h2>
              <p className="text-sm text-gray-400">{step.description}</p>
            </div>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          {step.id !== 'billing' && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-[#222]">
              <button
                onClick={goBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#333] text-gray-400 hover:text-white hover:border-[#555] transition-all disabled:opacity-30"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={markComplete}
                className="flex-1 flex items-center justify-center gap-2 bg-[#ff3d00] hover:bg-[#ff6d00] text-white font-semibold py-3 rounded-xl transition-all"
              >
                {currentStep === STEPS.length - 2 ? 'Finish Setup' : 'Continue'}
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
