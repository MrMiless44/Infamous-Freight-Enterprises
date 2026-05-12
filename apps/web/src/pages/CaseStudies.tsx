/**
 * Public workflow examples page.
 */
import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, MessageSquare, Route, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const workflowExamples = [
  {
    title: 'Recurring regional lane',
    industry: 'Retail replenishment',
    summary: 'A shipper moving recurring regional freight needs the same pickup details, delivery windows, equipment notes, and contact path documented each time.',
    steps: [
      { label: 'Lane intake', detail: 'Origin, destination, pickup timing, delivery window, equipment, and contact details captured.', icon: Route },
      { label: 'Written confirmation', detail: 'Rate, payment terms, pickup instructions, and delivery expectations confirmed before booking.', icon: FileText },
      { label: 'Shipment follow-up', detail: 'Status updates, exceptions, and proof documents kept connected to the shipment record.', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Urgent small freight',
    industry: 'Cargo van or sprinter van',
    summary: 'A time-sensitive shipment needs quick lane review without asking for unnecessary sensitive information up front.',
    steps: [
      { label: 'Core lead first', detail: 'Origin, destination, equipment type, pickup timing, name, phone, and email collected first.', icon: MessageSquare },
      { label: 'Capacity review', detail: 'Dispatch reviews timing, freight size, and available equipment before confirming next steps.', icon: Truck },
      { label: 'Clear communication', detail: 'Shipment details and changes are documented from quote to delivery.', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Carrier load request',
    industry: 'Carrier operations',
    summary: 'A carrier requesting a load needs written terms and document review before dispatch decisions are made.',
    steps: [
      { label: 'Carrier details', detail: 'Carrier name, authority/contact information, equipment, and message are submitted for review.', icon: Truck },
      { label: 'Document review', detail: 'Required carrier documents are reviewed before dispatch and booking decisions.', icon: ClipboardCheck },
      { label: 'Rate confirmation', detail: 'Rate and payment terms are confirmed in writing before the carrier rolls.', icon: FileText },
    ],
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <Link to="/" aria-label="Back to homepage">
          <Button variant="ghost" className="mb-6 text-[#B88989] hover:text-[#F5E8E8]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#F5E8E8]">Freight Workflow Examples</h1>
          <p className="mt-4 text-lg text-[#B88989] max-w-2xl mx-auto">
            Practical examples of how quote intake, carrier review, written terms, tracking context, and delivery follow-up fit together.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: 'Quote', label: 'Lane and contact intake' },
            { value: 'Review', label: 'Shipment and documents' },
            { value: 'Confirm', label: 'Terms in writing' },
            { value: 'Follow up', label: 'Updates and delivery notes' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-infamous-border bg-infamous-card/50 p-6 text-center"
            >
              <div className="text-3xl font-bold text-red-500">{stat.value}</div>
              <div className="text-sm text-[#B88989] mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          {workflowExamples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-infamous-border bg-infamous-card/50 overflow-hidden"
            >
              <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-8 p-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-red-400 bg-red-600/10 px-2 py-0.5 rounded-full">Example</span>
                    <span className="text-xs text-[#B88989]/70">{example.industry}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#F5E8E8] mb-3">{example.title}</h2>
                  <p className="text-sm leading-7 text-[#B88989]">{example.summary}</p>
                </div>

                <div className="grid gap-4">
                  {example.steps.map((step, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-infamous-border bg-black/30 p-4"
                    >
                      <step.icon className="h-5 w-5 text-red-500 mb-2" />
                      <p className="text-base font-bold text-[#F5E8E8]">{step.label}</p>
                      <p className="mt-2 text-sm leading-6 text-[#B88989]">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-[#F5E8E8] mb-4">
            Ready to move freight?
          </h2>
          <div className="flex justify-center gap-4">
            <Link to="/request-quote">
              <Button className="bg-infamous-red text-[#F5E8E8] hover:bg-infamous-red-light">
                Request a Quote
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-infamous-border text-[#F5E8E8] hover:bg-infamous-panel">
                Contact Dispatch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
