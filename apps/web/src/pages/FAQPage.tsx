import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, HelpCircle, Mail, Phone } from 'lucide-react';
import { BRAND } from '@/lib/brand';

const faqCategories = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I get a freight quote?',
        answer:
          'Submit your shipment details on the Request a Quote page — pickup location, destination, freight type, timing, and contact information. Dispatch reviews the request and follows up with the next step, typically within hours.',
      },
      {
        question: 'What information do I need to request a quote?',
        answer:
          'At minimum: pickup and delivery locations, freight type or equipment needed, approximate weight or dimensions, preferred pickup date, and your contact information. The more detail you provide, the faster dispatch can respond with an accurate rate.',
      },
      {
        question: 'How quickly will I receive a quote?',
        answer:
          'Most quote requests receive a response within a few hours during business days. Expedited or time-sensitive requests are prioritized. You will receive a confirmation with a tracking reference when your request is submitted.',
      },
    ],
  },
  {
    title: 'Services',
    items: [
      {
        question: 'What types of freight do you handle?',
        answer:
          'Full truckload, LTL, flatbed, reefer, expedited, box truck (16–26 ft), cargo van, sprinter van, local metro, and regional multi-city freight. We also provide full freight dispatch support for owner-operators, small fleets, and brokerage operations.',
      },
      {
        question: 'Do you offer same-day or expedited freight?',
        answer:
          'Expedited options can be requested for time-sensitive freight. Availability depends on lane, timing, equipment, and carrier capacity. Submit your request with the urgency noted and dispatch will confirm what is available.',
      },
      {
        question: 'What areas does Infamous Freight service?',
        answer:
          'Local and regional freight can be requested across U.S. lanes. Availability depends on lane, equipment, timing, freight details, and carrier capacity.',
      },
      {
        question: 'Can you handle oversized or specialized freight?',
        answer:
          'Flatbed and specialized equipment requests can be submitted through the quote form. Include dimensions, weight, and any special handling requirements so dispatch can match the right carrier and equipment.',
      },
    ],
  },
  {
    title: 'Tracking & Visibility',
    items: [
      {
        question: 'How does shipment tracking work?',
        answer:
          'Every load gets a live tracking timeline from pickup to delivery. Enter your tracking number on the Track Shipment page for instant visibility — no login required. You receive status updates, ETA changes, and proof-of-delivery events as they happen.',
      },
      {
        question: 'Do I need an account to track a shipment?',
        answer:
          'No. Public shipment tracking is available to anyone with a valid tracking reference number. For deeper visibility into all your shipments, the customer portal provides a consolidated view.',
      },
      {
        question: 'What kind of updates will I receive?',
        answer:
          'Status updates include pickup confirmation, in-transit checkpoints, ETA changes, exception notes, delivery confirmation, and proof-of-delivery documents when available.',
      },
    ],
  },
  {
    title: 'Carriers & Drivers',
    items: [
      {
        question: 'What is the carrier vetting process?',
        answer:
          'Carrier documents and shipment requirements are reviewed before dispatch. Equipment, timing, communication expectations, and written confirmations are kept with the load workflow.',
      },
      {
        question: 'How do carriers and drivers get paid?',
        answer:
          'Carrier payment terms are confirmed in writing before dispatch. Carriers should review the written rate confirmation and payment terms for each load.',
      },
      {
        question: 'How do I apply to drive with Infamous Freight?',
        answer:
          'Visit the Apply to Drive page and submit your name, contact info, city, equipment type, and any notes. The onboarding team reviews applications and connects verified drivers with freight opportunities on matching lanes.',
      },
      {
        question: 'How can I view available loads?',
        answer:
          'The public Load Board shows available freight with lane details, equipment requirements, and real-time status. Verified carriers can also access assigned loads through the Carrier Portal.',
      },
    ],
  },
  {
    title: 'Billing & Pricing',
    items: [
      {
        question: 'How is freight pricing determined?',
        answer:
          'Rates depend on lane distance, equipment type, freight weight and dimensions, timeline urgency, and current carrier capacity. Rate details and payment terms are confirmed in writing before the shipment is booked.',
      },
      {
        question: 'Are there any hidden fees?',
        answer:
          'No. All rate details, accessorial charges, and payment terms are documented in the written rate confirmation before booking. If additional charges apply (detention, layover, redelivery), they are discussed upfront.',
      },
    ],
  },
  {
    title: 'Platform & Support',
    items: [
      {
        question: 'What is the customer portal?',
        answer:
          'The customer portal gives shippers access to their quote history, active shipments, tracking, documents, and support workflows in one place — no phone calls needed for routine status checks.',
      },
      {
        question: 'How do I contact support?',
        answer:
          `Reach dispatch and support through the Contact page, by email at ${BRAND.supportEmail}, or through the AI freight assistant available on every page. For urgent freight issues, include your tracking reference for faster routing.`,
      },
      {
        question: 'Is my shipment data secure?',
        answer:
          'Yes. The platform uses encrypted connections, role-based access controls, and documented data handling practices. Customer and shipment information is kept private and not shared outside of the operational workflow. Review the Privacy Policy for full details.',
      },
    ],
  },
];

const FaqItem: React.FC<{ id: string; question: string; answer: string }> = ({ id, question, answer }) => {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-panel`;
  return (
    <div className="border-b border-infamous-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-base font-semibold text-[#F5E8E8]">{question}</span>
        <ChevronDown
          aria-hidden="true"
          size={18}
          className={`shrink-0 text-infamous-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div id={panelId} aria-hidden={!open} className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-60 pb-5' : 'max-h-0'}`}>
        <p className="text-sm leading-7 text-[#B88989]">{answer}</p>
      </div>
    </div>
  );
};

const FAQPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-[#F5E8E8]">
      <div className="mx-auto max-w-4xl">
        <section className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-red-light">FAQ</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#F5E8E8]/80">
            Answers to common questions about freight quotes, services, tracking, carrier operations, and the Infamous Freight platform.
          </p>
        </section>

        <div className="mt-14 space-y-10">
          {faqCategories.map((category) => (
            <section key={category.title}>
              <h2 className="mb-4 text-xl font-bold text-[#F5E8E8]">{category.title}</h2>
              <div className="rounded-2xl border border-infamous-border bg-infamous-card px-6">
                {category.items.map((faq, index) => (
                  <FaqItem
                    key={faq.question}
                    id={`faq-${category.title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-16 rounded-3xl border border-infamous-border bg-infamous-card p-8 text-center">
          <HelpCircle className="mx-auto mb-4 text-infamous-red-light" size={32} />
          <h2 className="text-2xl font-bold">Still have questions?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#B88989]">
            Reach out to dispatch for freight questions, quote follow-ups, tracking help, or partnership inquiries.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-red px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90"
            >
              <Mail size={17} /> Contact dispatch
            </Link>
            <Link
              to="/request-quote"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-panel px-5 py-3 font-semibold text-[#F5E8E8] transition hover:border-infamous-red/50"
            >
              Request a quote <ArrowRight size={17} />
            </Link>
          </div>
          <p className="mt-6 text-sm text-infamous-muted">
            <Phone size={14} className="mr-1 inline" aria-hidden="true" />
            Or email <a href={`mailto:${BRAND.supportEmail}`} className="font-semibold text-infamous-red-light hover:underline">{BRAND.supportEmail}</a>
          </p>
        </section>
      </div>
    </main>
  );
};

export default FAQPage;
