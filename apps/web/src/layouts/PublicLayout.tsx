import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Infinity, Mail, Menu, PackageSearch, Phone, X } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { trackPublicEvent } from '@/lib/analytics';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Request Quote', href: '/request-quote' },
  { label: 'Track Shipment', href: '/track-shipment' },
  { label: 'Carriers', href: '/carrier-portal' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

const footerGroups = [
  {
    title: 'Freight',
    links: [
      { label: 'Get a Quote', href: '/request-quote' },
      { label: 'Track Shipment', href: '/track-shipment' },
      { label: 'Load Board', href: '/load-board' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'Full Truckload', href: '/services/full-truckload' },
      { label: 'Flatbed', href: '/services/flatbed' },
      { label: 'Expedited', href: '/services/expedited' },
      { label: 'Amazon Delivery', href: '/services/amazon-delivery' },
    ],
  },
  {
    title: 'Network',
    links: [
      { label: 'Shipper Portal', href: '/customer-portal' },
      { label: 'Carrier Portal', href: '/carrier-portal' },
      { label: 'Drive With Us', href: '/drive' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
];

const PublicLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-infamous-dark pb-20 text-[#F5E8E8] lg:pb-0">
      <header className="sticky top-0 z-50 border-b border-infamous-border bg-infamous-darker/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Infamous Freight home">
            <Infinity aria-hidden="true" size={28} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.8))' }} />
            <span className="hidden sm:block">
              <span className="block font-display text-lg font-black leading-none text-[#F5E8E8]">{BRAND.displayName}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-infamous-muted">{BRAND.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Public site navigation">
            {navLinks.map((item) => {
              const active = pathname === item.href
                || (item.href === '/services' && pathname.startsWith('/services'))
                || (item.href === '/carrier-portal' && pathname.startsWith('/carrier'));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-infamous-red/10 text-infamous-red-light'
                      : 'text-[#B88989] hover:bg-white/5 hover:text-[#F5E8E8]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-[#B88989] transition hover:text-[#F5E8E8]"
            >
              Login
            </Link>
            <Link
              to="/request-quote"
              onClick={() => trackPublicEvent('quote_cta_click', { location: 'desktop_header', cta: 'get_quote' })}
              className="inline-flex items-center gap-2 btn-primary text-sm glow-high"
            >
              Get a Quote <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#B88989] hover:text-[#F5E8E8] hover:bg-white/5 transition"
              aria-controls="public-mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="public-mobile-navigation" className="lg:hidden border-t border-infamous-border bg-infamous-darker px-5 py-4 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#B88989] transition hover:bg-white/5 hover:text-[#F5E8E8]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#B88989] transition hover:text-[#F5E8E8]"
            >
              Login
            </Link>
          </nav>
        )}
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-infamous-border bg-infamous-darker/95 px-3 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden"
        aria-label="Quick freight actions"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <Link
            to="/request-quote"
            onClick={() => trackPublicEvent('quote_cta_click', { location: 'mobile_sticky_bar', cta: 'quote' })}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-lg bg-infamous-red px-2 text-xs font-bold text-[#F5E8E8]"
          >
            <ArrowRight aria-hidden="true" size={15} /> Quote
          </Link>
          <Link
            to="/track-shipment"
            onClick={() => trackPublicEvent('tracking_cta_click', { location: 'mobile_sticky_bar', cta: 'track' })}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-infamous-border bg-infamous-card px-2 text-xs font-bold text-[#F5E8E8]"
          >
            <PackageSearch aria-hidden="true" size={15} /> Track
          </Link>
          <a
            href={BRAND.dispatchPhoneHref}
            onClick={() => trackPublicEvent('contact_cta_click', { location: 'mobile_sticky_bar', cta: 'call' })}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-infamous-border bg-infamous-card px-2 text-xs font-bold text-[#F5E8E8]"
          >
            <Phone aria-hidden="true" size={15} /> Call
          </a>
        </div>
      </nav>

      <footer className="border-t border-infamous-border bg-infamous-darker px-5 py-14 text-sm text-[#B88989] lg:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3 text-[#F5E8E8]" aria-label="Infamous Freight home">
              <Infinity aria-hidden="true" size={32} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 10px rgba(255, 59, 48, 0.8))' }} />
              <span className="font-display text-lg font-black">{BRAND.displayName}</span>
            </Link>
            <p className="mt-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-infamous-muted">{BRAND.tagline}</p>
            <p className="mt-3 max-w-md leading-6">
              Freight services with clear quote intake, documented handoffs, tracking context, and delivery follow-up.
            </p>
            <div className="mt-4 space-y-1.5">
              <a href={BRAND.dispatchPhoneHref} className="flex items-center gap-2 text-sm hover:text-infamous-red-light transition">
                <Phone aria-hidden="true" size={14} className="text-infamous-red-light" /> {BRAND.dispatchPhone}
              </a>
              <a href={`mailto:${BRAND.supportEmail}`} className="flex items-center gap-2 text-sm hover:text-infamous-red-light transition">
                <Mail aria-hidden="true" size={14} className="text-infamous-red-light" /> {BRAND.supportEmail}
              </a>
            </div>
            <p className="mt-6 text-xs text-infamous-muted">© {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#F5E8E8]/80">{group.title}</h2>
                <div className="space-y-2.5">
                  {group.links.map((link) => (
                    <Link key={link.href} to={link.href} className="block hover:text-infamous-red-light transition">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
