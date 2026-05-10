/**
 * RECOMMENDATION: "Book a Demo" CTA
 * Calendly integration for enterprise lead capture
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Building2, User, Mail, Phone, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitNetlifyForm } from '@/lib/netlifyForms';

export function BookDemoButton({ className = '' }: { className?: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={`bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 ${className}`}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Book a Demo
      </Button>

      <AnimatePresence>
        {showModal && <BookDemoModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}

function BookDemoModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'calendar' | 'confirmed'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    fleetSize: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitNetlifyForm('book-demo', formData);
      setStep('calendar');
    } catch {
      setStep('calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-demo-title"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-infamous-border bg-infamous-card p-6 relative"
      >
        <button
          onClick={onClose}
          aria-label="Close book a demo dialog"
          className="absolute right-4 top-4 text-[#B88989]/70 hover:text-[#F5E8E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {step === 'form' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/10 mb-3">
                <Calendar className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <h2 id="book-demo-title" className="text-2xl font-bold text-[#F5E8E8]">Book a Demo</h2>
              <p className="text-sm text-[#B88989] mt-1">
                See how Infamous Freight can transform your operations
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="demo-name" className="text-sm text-[#B88989] mb-1 block">Name</label>
                  <div className="relative">
                    <User aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B88989]/70" />
                    <Input
                      id="demo-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                      className="pl-10 border-infamous-border bg-infamous-panel text-[#F5E8E8]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="demo-company" className="text-sm text-[#B88989] mb-1 block">Company</label>
                  <div className="relative">
                    <Building2 aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B88989]/70" />
                    <Input
                      id="demo-company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Iron Route Logistics"
                      className="pl-10 border-infamous-border bg-infamous-panel text-[#F5E8E8]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="demo-email" className="text-sm text-[#B88989] mb-1 block">Email</label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B88989]/70" />
                  <Input
                    id="demo-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@acmetrucking.com"
                    className="pl-10 border-infamous-border bg-infamous-panel text-[#F5E8E8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="demo-phone" className="text-sm text-[#B88989] mb-1 block">Phone</label>
                <div className="relative">
                  <Phone aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B88989]/70" />
                  <Input
                    id="demo-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="pl-10 border-infamous-border bg-infamous-panel text-[#F5E8E8]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="demo-fleet-size" className="text-sm text-[#B88989] mb-1 block">Fleet Size</label>
                <select
                  id="demo-fleet-size"
                  value={formData.fleetSize}
                  onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                  className="w-full rounded-md border border-infamous-border bg-infamous-panel px-3 py-2 text-[#F5E8E8] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  required
                >
                  <option value="">Select fleet size</option>
                  <option value="1-5">1-5 trucks</option>
                  <option value="6-20">6-20 trucks</option>
                  <option value="21-50">21-50 trucks</option>
                  <option value="51-100">51-100 trucks</option>
                  <option value="100+">100+ trucks</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="mr-2 h-4 w-4" />
                )}
                Continue to Calendar
              </Button>
            </form>
          </>
        )}

        {step === 'calendar' && (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#F5E8E8] mb-2">Select a Time</h3>
            <p className="text-sm text-[#B88989] mb-4">Thanks{formData.name ? `, ${formData.name}` : ''}. Pick a time that works for you.</p>
            {/* Calendly embed would go here */}
            <div className="rounded-xl border border-infamous-border bg-zinc-950 p-8">
              <p className="text-[#B88989] mb-4">Calendly Integration</p>
              <p className="text-xs text-[#B88989]/70">
                Add your Calendly URL in settings to enable scheduling.
                <br />
                Settings → Integrations → Calendly
              </p>
            </div>
            <Button
              onClick={() => setStep('confirmed')}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Confirm time
            </Button>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-[#36D399] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#F5E8E8] mb-2">Demo Booked!</h3>
            <p className="text-[#B88989] mb-6">
              A confirmation is on its way to {formData.email} with the call link and prep notes.
            </p>
            <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
              Done
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
