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

interface FleetDriver {
  name: string;
  license: string;
  equipment: string;
}

interface TeamMember {
  name: string;
  email: string;
  role: string;
}

const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({});

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              <label className="block text-sm text-[#B88989] mb-1">Company Name</label>
              <input
                type="text"
                className="w-full bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
                placeholder="Iron Route Logistics LLC"
                value={formData.company?.name || ''}
                onChange={e => updateField('company', 'name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#B88989] mb-1">MC Number</label>
                <input
                  type="text"
                  className="w-full bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
                  placeholder="123456"
                  value={formData.company?.mcNumber || ''}
                  onChange={e => updateField('company', 'mcNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-[#B88989] mb-1">USDOT Number</label>
                <input
                  type="text"
                  className="w-full bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
                  placeholder="1234567"
                  value={formData.company?.dotNumber || ''}
                  onChange={e => updateField('company', 'dotNumber', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#B88989] mb-1">Address</label>
              <input
                type="text"
                className="w-full bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
                placeholder="123 Main St, Dallas, TX 75201"
                value={formData.company?.address || ''}
                onChange={e => updateField('company', 'address', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-[#B88989] mb-1">Insurance Certificate (COI)</label>
              <div className="border-2 border-dashed border-infamous-border rounded-lg p-6 text-center hover:border-infamous-red transition-colors cursor-pointer">
                <FileText className="mx-auto mb-2 text-[#B88989]/70" size={32} />
                <p className="text-sm text-[#B88989]">Drop a COI PDF here, or click to browse. Our team reviews it before activation.</p>
              </div>
            </div>
          </div>
        );

      case 'fleet':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#B88989] mb-1">Number of Trucks</label>
              <input
                type="number"
                className="w-full bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
                placeholder="12"
                value={formData.fleet?.truckCount || ''}
                onChange={e => updateField('fleet', 'truckCount', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm text-[#B88989] mb-1">Equipment Types</label>
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
                        ? 'bg-infamous-red/20 border-[#ff3d00] text-infamous-red-light'
                        : 'bg-infamous-panel border-infamous-border text-[#B88989] hover:border-infamous-border-light'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#B88989] mb-1">Add Drivers</label>
              <div className="space-y-2">
                {(formData.fleet?.drivers || []).map((driver: FleetDriver, i: number) => (
                  <div key={i} className="flex gap-2 bg-infamous-panel border border-infamous-border rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm text-[#F5E8E8]">{driver.name}</p>
                      <p className="text-xs text-[#B88989]/70">{driver.license} • {driver.equipment}</p>
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
                  className="w-full py-2 border border-dashed border-infamous-border rounded-lg text-sm text-[#B88989]/70 hover:border-infamous-red hover:text-infamous-red-light transition-all"
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
              <label className="block text-sm text-[#B88989] mb-1">Primary Lanes (top 3)</label>
              {['Lane 1', 'Lane 2', 'Lane 3'].map((label, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 bg-infamous-panel border border-infamous-border rounded-lg px-4 py-2 text-[#F5E8E8] text-sm focus:border-infamous-red focus:outline-none"
                    placeholder="Origin City, ST"
                    value={formData.lanes?.[`origin${i}`] || ''}
                    onChange={e => updateField('lanes', `origin${i}`, e.target.value)}
                  />
                  <span className="text-[#B88989]/70 self-center">→</span>
                  <input
                    type="text"
                    className="flex-1 bg-infamous-panel border border-infamous-border rounded-lg px-4 py-2 text-[#F5E8E8] text-sm focus:border-infamous-red focus:outline-none"
                    placeholder="Dest City, ST"
                    value={formData.lanes?.[`dest${i}`] || ''}
                    onChange={e => updateField('lanes', `dest${i}`, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm text-[#B88989] mb-1">Avoid These States</label>
              <input
                type="text"
                className="w-full bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
                placeholder="CA, NY, NJ (comma separated)"
                value={formData.lanes?.avoidStates || ''}
                onChange={e => updateField('lanes', 'avoidStates', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-[#B88989] mb-1">Minimum Rate/Mile</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
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
            <p className="text-sm text-[#B88989]">Connect your ELD so dispatch can see drivers' available hours in real time.</p>
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
                      ? 'border-[#ff3d00] bg-infamous-red/10'
                      : 'border-infamous-border bg-infamous-panel hover:border-infamous-border-light'
                  }`}
                >
                  <Radio size={24} style={{ color: provider.color }} className="mx-auto mb-2" />
                  <p className="text-sm text-[#F5E8E8] font-medium">{provider.name}</p>
                </button>
              ))}
            </div>
            {formData.eld?.provider && (
              <div className="bg-infamous-panel border border-infamous-border rounded-lg p-4">
                <p className="text-sm text-[#B88989] mb-2">You will be redirected to {formData.eld.provider} to authorize access.</p>
                <button className="w-full bg-infamous-red hover:bg-[#ff6d00] text-[#F5E8E8] font-semibold py-2 rounded-lg transition-all">
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
              <label className="block text-sm text-[#B88989] mb-1">Invite Team Members</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  className="flex-1 bg-infamous-panel border border-infamous-border rounded-lg px-4 py-3 text-[#F5E8E8] focus:border-infamous-red focus:outline-none"
                  placeholder="dispatcher@company.com"
                  value={formData.team?.inviteEmail || ''}
                  onChange={e => updateField('team', 'inviteEmail', e.target.value)}
                />
                <select
                  className="bg-infamous-panel border border-infamous-border rounded-lg px-3 py-3 text-[#F5E8E8] text-sm focus:border-infamous-red focus:outline-none"
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
                className="mt-2 w-full py-2 bg-infamous-panel border border-infamous-border rounded-lg text-sm text-[#B88989] hover:text-[#F5E8E8] hover:border-infamous-red transition-all"
              >
                Send Invite
              </button>
            </div>
            {(formData.team?.members || []).length > 0 && (
              <div className="space-y-2">
                {(formData.team?.members || []).map((member: TeamMember, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-infamous-panel border border-infamous-border rounded-lg p-3">
                    <div>
                      <p className="text-sm text-[#F5E8E8]">{member.email}</p>
                      <span className="text-xs text-infamous-red-light">{member.role}</span>
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
            <div className="bg-gradient-to-r from-infamous-red/20 to-infamous-ember/10 border border-[#ff3d00]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#F5E8E8]">Growth Plan</h3>
                <span className="text-2xl font-bold text-infamous-red-light">$99<span className="text-sm text-[#B88989]">/mo</span></span>
              </div>
              <ul className="space-y-2 text-sm text-[#F5E8E8]/80">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Unlimited loads & drivers</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Auto-dispatch AI</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Rate negotiation bot</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Voice booking</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Samsara/Motive/Geotab ELD sync</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-[#ff3d00]/20">
                <p className="text-xs text-[#B88989]">14-day free trial • No credit card required</p>
              </div>
            </div>
            <button
              onClick={markComplete}
              className="w-full bg-gradient-to-r from-infamous-red to-infamous-ember hover:from-infamous-ember hover:to-infamous-orange text-[#F5E8E8] font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#ff3d00]/20"
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
    <div className="min-h-screen bg-infamous-dark text-[#F5E8E8] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Infamous Freight</h1>
          <p className="text-[#B88989]">Six quick steps to get your fleet dispatching.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#B88989]">Setup Progress</span>
            <span className="text-sm font-semibold text-infamous-red-light">{progress}%</span>
          </div>
          <div className="h-2 bg-infamous-panel rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-infamous-red to-infamous-ember rounded-full transition-all duration-500"
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
                  ? 'bg-infamous-red/20 border border-[#ff3d00] text-infamous-red-light'
                  : completedSteps.has(s.id)
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-infamous-panel border border-infamous-border text-[#B88989]/70'
              }`}
            >
              {completedSteps.has(s.id) ? <CheckCircle size={16} /> : s.icon}
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-infamous-panel border border-infamous-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-infamous-red/10 p-2.5 rounded-lg text-infamous-red-light">
              {step.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{step.label}</h2>
              <p className="text-sm text-[#B88989]">{step.description}</p>
            </div>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          {step.id !== 'billing' && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-infamous-border">
              <button
                onClick={goBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-infamous-border text-[#B88989] hover:text-[#F5E8E8] hover:border-infamous-border-light transition-all disabled:opacity-30"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={markComplete}
                className="flex-1 flex items-center justify-center gap-2 bg-infamous-red hover:bg-[#ff6d00] text-[#F5E8E8] font-semibold py-3 rounded-xl transition-all"
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
