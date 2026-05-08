/**
 * RECOMMENDATION: GDPR Compliance Page
 * Legal requirement for handling EU user data
 */
import { Shield, Lock, Eye, Trash2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function GDPR() {
  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <Link to="/" aria-label="Back to homepage">
          <Button variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy & Data Protection</h1>
        <p className="text-zinc-400 mb-8">Last updated: April 20, 2026</p>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Your Data Rights (GDPR)</h2>
            </div>
            <p className="text-zinc-400 mb-4">
              Under the General Data Protection Regulation (GDPR), you have the following rights regarding your personal data:
            </p>
            <ul className="space-y-3">
              {[
                'Right to Access - Request a copy of all data we hold about you',
                'Right to Rectification - Correct inaccurate or incomplete data',
                'Right to Erasure ("Right to be Forgotten") - Request deletion of your data',
                'Right to Restrict Processing - Limit how we use your data',
                'Right to Data Portability - Export your data in a standard format',
                'Right to Object - Opt out of certain data uses',
                'Right to Withdraw Consent - Revoke previously given consent',
              ].map((right, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300">
                  <span className="text-red-500 mt-1">•</span>
                  {right}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Data We Collect</h2>
            </div>
            <div className="space-y-4 text-zinc-400">
              <div>
                <h3 className="text-white font-medium mb-1">Account Information</h3>
                <p>Name, email, company name, phone number</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Fleet Data</h3>
                <p>Vehicle information, driver details, load records, GPS locations</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Usage Data</h3>
                <p>Feature usage, login times, IP addresses, browser information</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Payment Information</h3>
                <p>Processed securely by Stripe - we never store card numbers</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">How We Use Your Data</h2>
            </div>
            <ul className="space-y-2 text-zinc-400">
              <li>• To provide and maintain our services</li>
              <li>• To process payments and manage subscriptions</li>
              <li>• To send service notifications and updates</li>
              <li>• To improve our product based on usage patterns</li>
              <li>• To comply with legal obligations</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Data Retention & Deletion</h2>
            </div>
            <p className="text-zinc-400 mb-4">
              We retain your data for as long as your account is active. After account closure:
            </p>
            <ul className="space-y-2 text-zinc-400">
              <li>• Account data: Deleted within 30 days</li>
              <li>• Billing records: Retained for 7 years (legal requirement)</li>
              <li>• Analytics data: Anonymized after 90 days</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Exercise Your Rights</h2>
            </div>
            <p className="text-zinc-400 mb-4">
              To exercise any of your GDPR rights, contact our Data Protection Officer:
            </p>
            <div className="space-y-2 text-zinc-300">
              <p>Email: privacy@infamousfreight.com</p>
              <p>Response time: Within 72 hours</p>
              <p>Verification: We may need to verify your identity before processing requests</p>
            </div>
          </section>

          {/* Data Export CTA */}
          <div className="text-center p-6">
            <Button className="bg-red-600 hover:bg-red-700">
              Request My Data Export
            </Button>
            <p className="text-xs text-zinc-500 mt-2">
              We'll prepare a complete export of your data within 48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
