import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { BRAND } from '@/lib/brand';

const legalContent = {
  '/terms': {
    eyebrow: 'Terms',
    title: 'Terms of service',
    intro:
      'These terms outline the basic rules for using Infamous Freight public pages, portals, quote tools, and freight operations workflows.',
    sections: [
      ['Use of the platform', 'Users are responsible for providing accurate shipment, contact, company, driver, carrier, and payment information.'],
      ['Quotes and availability', 'Quotes, capacity, routes, equipment, and pickup windows are subject to dispatch review and operational confirmation.'],
      ['No misuse', 'Users may not submit false freight, carrier, driver, insurance, identity, or payment information.'],
      ['Operational updates', 'Shipment status, ETA, and proof-of-delivery tools are provided to improve visibility and may depend on carrier and driver updates.'],
    ],
  },
  '/privacy': {
    eyebrow: 'Privacy',
    title: 'Privacy policy',
    intro:
      'This policy explains the categories of information Infamous Freight may collect through public forms, portals, and operational workflows.',
    sections: [
      ['Information collected', 'We may collect contact details, company information, shipment details, driver onboarding information, and support messages.'],
      ['How information is used', 'Information is used to respond to quotes, support freight operations, verify drivers or carriers, and improve service quality.'],
      ['Service providers', 'Operational data may be processed through hosting, database, form, authentication, analytics, or communication providers.'],
      ['Contact', 'Questions about privacy can be sent through the contact page.'],
    ],
  },
  '/carrier-agreement': {
    eyebrow: 'Carrier agreement',
    title: 'Carrier operating expectations',
    intro:
      'This page summarizes expectations for carriers and drivers using the Infamous Freight network. Final agreements may include additional terms.',
    sections: [
      ['Verification', 'Carriers and drivers may be required to verify identity, authority, insurance, payment details, and equipment before receiving load access.'],
      ['Load execution', 'Assigned carriers are expected to follow pickup, delivery, tracking, communication, and proof-of-delivery requirements.'],
      ['Fraud prevention', 'False authority, double-brokering, hidden reassignment, or inaccurate documentation may result in removal from the network.'],
      ['Payment', 'Payment timing depends on completed delivery, required documentation, and any applicable agreement terms.'],
    ],
  },
  '/shipper-agreement': {
    eyebrow: 'Shipper agreement',
    title: 'Shipper service expectations',
    intro:
      'This page summarizes expectations for shippers requesting quotes, booking freight, and tracking shipments through Infamous Freight.',
    sections: [
      ['Accurate freight details', 'Shippers should provide complete origin, destination, freight type, equipment, weight, dimensions, timing, and accessorial details.'],
      ['Quote confirmation', 'Submitted quote requests are not final bookings until dispatch confirms pricing, capacity, equipment, and pickup details.'],
      ['Access and loading', 'Pickup and delivery locations should be prepared for the equipment requested and the freight being moved.'],
      ['Documentation', 'Shipment records, PODs, invoices, and support notes may be used to complete billing and service follow-up.'],
    ],
  },
};

type LegalPath = keyof typeof legalContent;

const LegalPage: React.FC = () => {
  const { pathname } = useLocation();
  const page = legalContent[(pathname in legalContent ? pathname : '/terms') as LegalPath];

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="mb-4 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
            <FileText size={24} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">{page.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-300">{page.intro}</p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Legal business name: {BRAND.legalName}
          </p>
        </header>

        <section className="space-y-4">
          {page.sections.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-infamous-border bg-infamous-card p-6">
              <div className="mb-3 flex items-center gap-3 text-infamous-orange">
                <ShieldCheck size={18} />
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>
              <p className="text-sm leading-7 text-gray-400">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-infamous-border bg-[#0f0f0f] p-6">
          <h2 className="text-xl font-bold">Need help?</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">This page is an operational summary and should be reviewed with legal counsel before relying on it as a final contract.</p>
          <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white">
            Contact Infamous Freight <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
};

export default LegalPage;
