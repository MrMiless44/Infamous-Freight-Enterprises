/**
 * RECOMMENDATION: Case Study Page
 * Social proof to convert enterprise visitors
 */
import { motion } from 'framer-motion';
import { TrendingUp, Clock, DollarSign, Truck, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookDemoButton } from '@/components/BookDemo';
import { Link } from 'react-router-dom';

const caseStudies = [
  {
    company: 'Midwest Transport Solutions',
    location: 'Des Moines, IA',
    fleetSize: 34,
    industry: 'Refrigerated Freight',
    image: '/case-studies/midwest.jpg',
    metrics: [
      { label: 'On-Time Delivery', value: '97.8%', improvement: '+12%', icon: Clock },
      { label: 'Deadhead Miles', value: '8%', improvement: '-35%', icon: Truck },
      { label: 'Revenue/Month', value: '$284K', improvement: '+23%', icon: DollarSign },
      { label: 'Dispatch Efficiency', value: '4.2x', improvement: '+4.2x', icon: TrendingUp },
    ],
    quote: "Infamous Freight transformed our dispatch operations. We went from managing everything in spreadsheets to a fully automated system. The Exception Engine alone saves us 15 hours a week.",
    author: 'Sarah Mitchell',
    role: 'Operations Director',
    rating: 5,
  },
  {
    company: 'Capitol City Logistics',
    location: 'Austin, TX',
    fleetSize: 67,
    industry: 'Flatbed & Heavy Haul',
    image: '/case-studies/capitol.jpg',
    metrics: [
      { label: 'On-Time Delivery', value: '99.1%', improvement: '+8%', icon: Clock },
      { label: 'Fuel Costs', value: '$1.42/mi', improvement: '-18%', icon: DollarSign },
      { label: 'Driver Retention', value: '94%', improvement: '+22%', icon: Truck },
      { label: 'Load Volume', value: '+156%', improvement: '+156%', icon: TrendingUp },
    ],
    quote: "The gamification features changed everything. Our drivers are actually competing to get the best safety scores. Turnover dropped by 40% in the first quarter.",
    author: 'Marcus Johnson',
    role: 'Fleet Manager',
    rating: 5,
  },
  {
    company: 'Northern Star Carriers',
    location: 'Minneapolis, MN',
    fleetSize: 12,
    industry: 'LTL & Last Mile',
    image: '/case-studies/northern.jpg',
    metrics: [
      { label: 'Customer Satisfaction', value: '4.9/5', improvement: '+0.8', icon: Star },
      { label: 'Response Time', value: '<2min', improvement: '-85%', icon: Clock },
      { label: 'Monthly Growth', value: '28%', improvement: '+28%', icon: TrendingUp },
      { label: 'Cost Savings', value: '$4,200', improvement: '/mo', icon: DollarSign },
    ],
    quote: "As a small fleet, we couldn't afford expensive TMS software. Infamous Freight's Starter plan gave us enterprise features at a fraction of the cost. Best investment we've made.",
    author: 'Erik Lindqvist',
    role: 'Owner & Dispatcher',
    rating: 5,
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
          <h1 className="text-4xl md:text-5xl font-bold text-[#F5E8E8]">Customer Success Stories</h1>
          <p className="mt-4 text-lg text-[#B88989] max-w-2xl mx-auto">
            See how fleets of all sizes use Infamous Freight to grow revenue, reduce costs, and keep drivers happy.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: '500+', label: 'Fleets Served' },
            { value: '25K+', label: 'Trucks Managed' },
            { value: '99.2%', label: 'Avg Uptime' },
            { value: '4.8/5', label: 'Customer Rating' },
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

        {/* Case Studies */}
        <div className="space-y-12">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-infamous-border bg-infamous-card/50 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Left: Company Info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-red-400 bg-red-600/10 px-2 py-0.5 rounded-full">
                      {study.fleetSize} Trucks
                    </span>
                    <span className="text-xs text-[#B88989]/70">{study.industry}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#F5E8E8] mb-2">{study.company}</h2>
                  <p className="text-sm text-[#B88989] mb-6">{study.location}</p>

                  {/* Quote */}
                  <blockquote className="border-l-2 border-red-600 pl-4 mb-6">
                    <p className="text-[#F5E8E8]/80 italic">"{study.quote}"</p>
                    <footer className="mt-3">
                      <p className="text-sm text-[#F5E8E8] font-medium">{study.author}</p>
                      <p className="text-xs text-[#B88989]/70">{study.role}</p>
                    </footer>
                  </blockquote>

                  <div className="flex gap-1">
                    {[...Array(study.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {study.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-infamous-border bg-black/30 p-4"
                    >
                      <metric.icon className="h-5 w-5 text-red-500 mb-2" />
                      <p className="text-2xl font-bold text-[#F5E8E8]">{metric.value}</p>
                      <p className="text-xs text-[#36D399] mt-1">{metric.improvement}</p>
                      <p className="text-xs text-[#B88989]/70 mt-0.5">{metric.label}</p>
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
            Ready to transform your fleet?
          </h2>
          <div className="flex justify-center gap-4">
            <BookDemoButton />
            <Link to="/pricing">
              <Button variant="outline" className="border-infamous-border text-[#F5E8E8] hover:bg-infamous-panel">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
