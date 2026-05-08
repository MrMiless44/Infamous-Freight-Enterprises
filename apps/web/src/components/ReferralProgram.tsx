/**
 * RECOMMENDATION: Referral Program
 * $50 credit for referrer, 1 month free for referred
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check, Users, DollarSign, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';

export function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const referralLink = `${BRAND.siteUrl}/?ref=MILES50`;
  const twitterReferralText = 'Just started using @InfamousFreight - best TMS for trucking!';
  
  const stats = {
    referralsMade: 3,
    creditsEarned: 150,
    maxReferrals: 10,
    friendsReferred: [
      { name: 'James R.', status: 'active', credit: 50 },
      { name: 'Maria S.', status: 'pending', credit: 0 },
      { name: 'David K.', status: 'active', credit: 50 },
    ],
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'Email',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      action: () => window.open(`mailto:?subject=Check out Infamous Freight&body=Hey, I think you'd love this TMS: ${referralLink}`),
    },
    {
      name: 'SMS',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      action: () => window.open(`sms:?body=Check out Infamous Freight - the TMS built for truckers: ${referralLink}`),
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => {
        const params = new URLSearchParams({
          text: twitterReferralText,
          url: referralLink,
        });
        window.open(`https://twitter.com/intent/tweet?${params.toString()}`);
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600/10 mb-3">
          <Gift className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Refer & Earn</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Give $50, Get $50. Everyone wins.
        </p>
      </div>

      {/* How it Works */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center mx-auto mb-2">
            <Share2 className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xs text-zinc-400">Share your link</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center mx-auto mb-2">
            <Users className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xs text-zinc-400">Friend signs up</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center mx-auto mb-2">
            <DollarSign className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xs text-zinc-400">You both earn!</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="rounded-xl border border-zinc-800 bg-black/30 p-4 mb-6">
        <label className="text-xs text-zinc-400 mb-2 block">Your referral link</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 truncate"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800 px-3"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 mb-6">
        {shareOptions.map((option) => (
          <button
            key={option.name}
            onClick={option.action}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors"
          >
            {option.icon}
            {option.name}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">Referrals</span>
          <span className="text-white font-medium">{stats.referralsMade} / {stats.maxReferrals}</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all"
            style={{ width: `${(stats.referralsMade / stats.maxReferrals) * 100}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          {stats.maxReferrals - stats.referralsMade} spots remaining. ${stats.creditsEarned} earned so far.
        </p>
      </div>

      {/* Referred Friends */}
      {stats.friendsReferred.length > 0 && (
        <div className="mt-4 space-y-2">
          {stats.friendsReferred.map((friend, i) => (
            <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-zinc-800/50">
              <span className="text-zinc-300">{friend.name}</span>
              <span className={`text-xs ${
                friend.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'
              }`}>
                {friend.status === 'active' ? `$${friend.credit} credit earned` : 'Trial pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
