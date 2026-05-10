import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Infinity, Menu, X } from 'lucide-react';
import { BRAND } from '@/lib/brand';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Shippers', href: '/customer-portal' },
  { label: 'Carriers', href: '/carrier-portal' },
  { label: 'Tracking', href: '/track-shipment' },
  { label: 'About', href: '/about' },
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
    <div className="min-h-screen bg-infamous-dark text-[#F5E8E8]">
      <header className="sticky top-0 z-50 border-b border-infamous-border bg-infamous-darker/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Infamous Freight home">
            <Infinity size={28} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.8))' }} />
            <span className="hidden sm:block">
              <span className="block font-display text-lg font-black leading-none text-[#F5E8E8]">{BRAND.displayName}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-infamous-muted">{BRAND.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Public site navigation">
            {navLinks.map((item) => {
              const active = pathname === item.href
                || (item.href === '/services' && pathname.startsWith('/services'))
                || (item.href === '/customer-portal' && pathname.startsWith('/customer'))
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
              className="inline-flex items-center gap-2 btn-primary text-sm glow-high"
            >
              Get a Quote <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#B88989] hover:text-[#F5E8E8] hover:bg-white/5 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-infamous-border bg-infamous-darker px-5 py-4 space-y-1" aria-label="Mobile navigation">
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

      <footer className="border-t border-infamous-border bg-infamous-darker px-5 py-14 text-sm text-[#B88989] lg:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3 text-[#F5E8E8]" aria-label="Infamous Freight home">
              <Infinity size={32} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 10px rgba(255, 59, 48, 0.8))' }} />
              <span className="font-display text-lg font-black">{BRAND.displayName}</span>
            </Link>
            <p className="mt-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-infamous-muted">{BRAND.tagline}</p>
            <p className="mt-3 max-w-md leading-6">
              Freight management platform with verified carriers, real-time tracking, and end-to-end shipment visibility.
            </p>
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
