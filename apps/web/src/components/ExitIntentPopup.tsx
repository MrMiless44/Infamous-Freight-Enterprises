/**
 * RECOMMENDATION: Exit-Intent Popup
 * Captures leaving visitors with a discount offer
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let shown = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !shown && !localStorage.getItem('exit-popup-shown')) {
        shown = true;
        setShow(true);
        localStorage.setItem('exit-popup-shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch('/api/leads/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'exit-intent' }),
    });

    setLoading(false);
    setSubmitted(true);
  };

  if (localStorage.getItem('exit-popup-dismissed')) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-popup-title"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="relative w-full max-w-md rounded-2xl border border-infamous-border bg-infamous-card p-8"
          >
            <button
              onClick={() => { setShow(false); localStorage.setItem('exit-popup-dismissed', 'true'); }}
              aria-label="Close discount offer"
              className="absolute right-4 top-4 text-[#B88989]/70 hover:text-[#F5E8E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {!submitted ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10 mb-4">
                    <Gift className="h-8 w-8 text-red-500" aria-hidden="true" />
                  </div>
                  <h2 id="exit-popup-title" className="text-2xl font-bold text-[#F5E8E8]">One more thing — 10% off your first 3 months</h2>
                  <p className="text-[#B88989] mt-2">
                    Plus a free onboarding call to get your fleet dispatching from day one.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label htmlFor="exit-popup-email" className="sr-only">Email address for discount code</label>
                  <Input
                    id="exit-popup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email address for discount code"
                    className="border-infamous-border bg-infamous-panel text-[#F5E8E8] text-center"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Email me the discount code'
                    )}
                  </Button>
                  <p className="text-xs text-[#B88989]/70 text-center">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-[#36D399] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#F5E8E8]">Discount Activated!</h3>
                <p className="text-[#B88989] mt-2">
                  Check your email for the 10% off code.
                </p>
                <Button
                  onClick={() => setShow(false)}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  Start Free Trial
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
