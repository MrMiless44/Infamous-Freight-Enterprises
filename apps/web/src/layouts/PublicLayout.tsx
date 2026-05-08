import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Quote', href: '/request-quote' },
  { label: 'Track', href: '/track-shipment' },
  { label: 'Load Board', href: '/load-board' },
  { label: 'Drivers', href: '/drive' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Partners', href: '/partners' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const footerGroups = [
  {
    title: 'Freight',
    links: [
      { label: 'Request quote', href: '/request-quote' },
      { label: 'Track shipment', href: '/track-shipment' },
      { label: 'Load board', href: '/load-board' },
      { label: 'Freight assistant', href: '/freight-assistant' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'All services', href: '/services' },
      { label: 'Box truck', href: '/services/box-truck' },
      { label: 'Cargo van', href: '/services/cargo-van' },
      { label: 'Sprinter van', href: '/services/sprinter-van' },
      { label: 'Local freight', href: '/services/local-freight' },
      { label: 'Regional freight', href: '/services/regional-freight' },
      { label: 'Freight dispatch', href: '/services/freight-dispatch' },
    ],
  },
  {
    title: 'Network',
    links: [
      { label: 'Apply to drive', href: '/drive' },
      { label: 'Partners', href: '/partners' },
      { label: 'Carrier portal', href: '/carrier-portal' },
      { label: 'Customer portal', href: '/customer-portal' },
      { label: 'Resources', href: '/resources' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Carrier agreement', href: '/carrier-agreement' },
      { label: 'Shipper agreement', href: '/shipper-agreement' },
    ],
  },
];

const PublicLayout: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <header className="sticky top-0 z-50 border-b border-infamous-border bg-[#090909]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Infamous Freight home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-infamous-orange text-white">
              <Truck size={20} />
            </span>
            <span>
              <span className="block text-lg font-black leading-none">Infamous Freight</span>
              <span className="text-xs uppercase tracking-[0.18em] text-gray-500">AI Freight Command Center</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-300" aria-label="Public site navigation">
            {navLinks.map((item) => {
              const active = pathname === item.href || (item.href === '/services' && pathname.startsWith('/services/'));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-lg px-3 py-2 font-semibold transition ${
                    active
                      ? 'bg-infamous-orange/10 text-infamous-orange'
                      : 'hover:bg-infamous-card hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/customer-portal"
              className="rounded-xl border border-infamous-border bg-infamous-card px-4 py-2 text-sm font-semibold text-white transition hover:border-infamous-orange/50"
            >
              Portal
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-infamous-orange px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              Login <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="border-t border-infamous-border bg-[#090909] px-6 py-10 text-sm text-gray-400">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3 text-white" aria-label="Infamous Freight home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-infamous-orange text-white">
                <Truck size={20} />
              </span>
              <span className="text-lg font-black">Infamous Freight</span>
            </Link>
            <p className="mt-4 max-w-md leading-6">
              Built for verified freight operations: quote intake, dispatch, tracking, proof of delivery, driver onboarding, and partner workflows.
            </p>
            <p className="mt-4">© {new Date().getFullYear()} Infamous Freight.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">{group.title}</h2>
                <div className="space-y-2">
                  {group.links.map((link) => (
                    <Link key={link.href} to={link.href} className="block hover:text-infamous-orange">
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
