/**
 * RECOMMENDATION: Product Hunt Launch Page
 * Optimized landing page for Product Hunt launch
 */
import { motion } from 'framer-motion';
import { ArrowUpRight, MessageSquare, Globe, Share2, Users, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';

export default function ProductHunt() {
  const productHuntShareText =
    'Just discovered @InfamousFreight - the TMS that actually understands trucking! #ProductHunt';
  const tweetShareUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: productHuntShareText,
    url: BRAND.siteUrl,
  }).toString()}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({
    url: BRAND.siteUrl,
  }).toString()}`;

  return (
    <div className="min-h-screen bg-black text-[#F5E8E8]">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 py-3 text-center">
        <p className="text-sm font-medium">
          🚀 Now live on Product Hunt! Support us with an upvote →
          <a 
            href="https://www.producthunt.com/posts/infamous-freight" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline ml-2 hover:text-black"
          >
            Vote Now
          </a>
        </p>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-infamous-card border border-infamous-border rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs text-[#B88989]">#1 Product of the Day</span>
            <span className="text-xs text-red-400">Freight & Logistics</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            The TMS That Actually
            <span className="text-red-500"> Understands Trucking</span>
          </h1>

          <p className="text-lg text-[#B88989] max-w-2xl mx-auto mb-8">
            Built by dispatchers, for dispatchers. AI-powered load management, 
            real-time tracking, and automated exception handling — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6">
              Start 14-Day Free Trial
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-infamous-border text-[#F5E8E8] hover:bg-infamous-panel text-lg px-8 py-6">
              <MessageSquare className="mr-2 h-5 w-5" />
              Book a Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-[#B88989]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>500+ fleets</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>99.2% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>4.8/5 rating</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Makers Section */}
      <div className="border-t border-infamous-border">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Meet the Makers</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: 'Miles', role: 'Founder & CEO', handle: '@MrMiless44' },
              { name: 'Dispatch Team', role: 'Industry Advisors', handle: '@infamousdispatch' },
            ].map((maker, i) => (
              <div key={i} className="flex items-center gap-3 bg-infamous-card border border-infamous-border rounded-xl p-4">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-[#F5E8E8] font-bold">
                  {maker.name[0]}
                </div>
                <div>
                  <p className="font-medium text-[#F5E8E8]">{maker.name}</p>
                  <p className="text-sm text-[#B88989]">{maker.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="border-t border-infamous-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">What Makes Us Different</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Exception Engine',
                desc: 'AI that watches your loads 24/7 and alerts you before problems happen.',
              },
              {
                title: 'Voice Booking',
                desc: 'Book loads hands-free while driving. Just say the origin and destination.',
              },
              {
                title: 'Dynamic Pricing',
                desc: 'Real-time rate optimization based on market conditions and route demand.',
              },
              {
                title: 'Driver Gamification',
                desc: 'XP, achievements, and leaderboards to boost driver engagement.',
              },
              {
                title: 'Load Auction',
                desc: 'Digital freight matching with real-time bidding to maximize revenue.',
              },
              {
                title: 'Samsara Integration',
                desc: 'Seamless ELD connectivity for automatic GPS and HOS tracking.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-infamous-border bg-infamous-card/50 p-6"
              >
                <h3 className="font-semibold text-[#F5E8E8] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#B88989]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Share CTA */}
      <div className="border-t border-infamous-border">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Help Us Spread the Word</h2>
          <p className="text-[#B88989] mb-6">Share Infamous Freight with your network</p>
          <div className="flex justify-center gap-4">
            <a 
              href={tweetShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-infamous-card border border-infamous-border rounded-lg px-4 py-2 hover:bg-infamous-panel transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm">Tweet</span>
            </a>
            <a 
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-infamous-card border border-infamous-border rounded-lg px-4 py-2 hover:bg-infamous-panel transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-infamous-border">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your fleet?</h2>
          <p className="text-[#B88989] mb-8">Join 500+ fleets already using Infamous Freight</p>
          <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6">
            Start Your Free Trial
          </Button>
          <p className="text-sm text-[#B88989]/70 mt-4">No credit card required. 14-day free trial.</p>
        </div>
      </div>
    </div>
  );
}
