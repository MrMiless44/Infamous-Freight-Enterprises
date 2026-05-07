import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Flame,
  MapPin,
  Search,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import { demoLoadBoardLoads, type LoadBoardLoad } from '@/data/mvpFreightData';
import { trackPublicEvent } from '@/lib/analytics';

const regions: LoadBoardLoad['originRegion'][] = [
  'Northeast',
  'Southeast',
  'Midwest',
  'South',
  'West',
  'Northwest',
];

const equipmentOptions: LoadBoardLoad['equipment'][] = [
  'Dry van',
  'Reefer',
  'Flatbed',
  'Power only',
  'Box truck',
  'Sprinter van',
];

const pickupWindows: LoadBoardLoad['pickupWindow'][] = [
  'Today',
  'Tomorrow',
  'This week',
  'Next week',
];

const formatMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const PublicLoadBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [originRegion, setOriginRegion] = useState<'All' | LoadBoardLoad['originRegion']>('All');
  const [destRegion, setDestRegion] = useState<'All' | LoadBoardLoad['destRegion']>('All');
  const [equipment, setEquipment] = useState<'All' | LoadBoardLoad['equipment']>('All');
  const [pickupWindow, setPickupWindow] = useState<'All' | LoadBoardLoad['pickupWindow']>('All');
  const [minRpm, setMinRpm] = useState('');
  const [minPay, setMinPay] = useState('');
  const [quickPayOnly, setQuickPayOnly] = useState(false);

  useEffect(() => {
    trackPublicEvent('load_board_view', { source: 'public_load_board' });
  }, []);

  const filtered = useMemo(() => {
    return demoLoadBoardLoads.filter((load) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${load.id} ${load.origin} ${load.destination} ${load.equipment} ${load.freightType}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (originRegion !== 'All' && load.originRegion !== originRegion) return false;
      if (destRegion !== 'All' && load.destRegion !== destRegion) return false;
      if (equipment !== 'All' && load.equipment !== equipment) return false;
      if (pickupWindow !== 'All' && load.pickupWindow !== pickupWindow) return false;
      if (minRpm && load.ratePerMile < parseFloat(minRpm)) return false;
      if (minPay && load.totalPay < parseFloat(minPay)) return false;
      if (quickPayOnly && !load.quickPay) return false;
      return true;
    });
  }, [search, originRegion, destRegion, equipment, pickupWindow, minRpm, minPay, quickPayOnly]);

  const totals = useMemo(() => {
    const count = filtered.length;
    const totalMiles = filtered.reduce((sum, l) => sum + l.miles, 0);
    const totalPay = filtered.reduce((sum, l) => sum + l.totalPay, 0);
    const avgRpm = totalMiles > 0 ? totalPay / totalMiles : 0;
    return { count, totalMiles, totalPay, avgRpm };
  }, [filtered]);

  const onFilterChange = (field: string, value: string | boolean) => {
    trackPublicEvent('load_board_filter', { field, value: String(value) });
  };

  const onBookClick = (load: LoadBoardLoad) => {
    trackPublicEvent('load_board_book_click', {
      load_id: load.id,
      lane: `${load.origin} -> ${load.destination}`,
      total_pay: load.totalPay,
      rate_per_mile: load.ratePerMile,
    });
    navigate('/carrier-portal');
  };

  return (
    <main className="bg-[#090909] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,61,0,0.18),transparent_42%),linear-gradient(180deg,#11100f_0%,#090909_72%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-6 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-infamous-orange/35 bg-infamous-orange/10 px-4 py-2 text-sm font-semibold text-infamous-orange">
            <Truck size={16} /> Carrier load board
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Available freight from Infamous Freight.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-300">
            Verified shipper. Rate confirmation in writing before you roll. QuickPay on every load
            once you're approved. Browse open lanes and request the ones that fit your truck.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              to="/drive"
              onClick={() => trackPublicEvent('driver_cta_click', { source: 'load_board_hero' })}
              className="inline-flex items-center gap-2 rounded-lg bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:bg-infamous-orange-light"
            >
              Carrier sign up <ArrowRight size={16} />
            </Link>
            <Link
              to="/carrier-portal"
              onClick={() =>
                trackPublicEvent('portal_cta_click', { portal: 'carrier', source: 'load_board_hero' })
              }
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
            >
              Carrier portal <ShieldCheck size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-label="Load board filters"
        className="border-b border-white/10 bg-[#0b0b0b]"
      >
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <Filter size={14} aria-hidden="true" /> Filters
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
            <div className="relative">
              <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <label htmlFor="lb-search" className="sr-only">
                Search loads
              </label>
              <input
                id="lb-search"
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  onFilterChange('search', event.target.value);
                }}
                placeholder="Search lane, freight, or load ID"
                className="w-full rounded-lg border border-white/10 bg-[#111] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-infamous-orange focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="lb-origin" className="sr-only">
                Origin region
              </label>
              <select
                id="lb-origin"
                value={originRegion}
                onChange={(event) => {
                  const value = event.target.value as typeof originRegion;
                  setOriginRegion(value);
                  onFilterChange('origin_region', value);
                }}
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-infamous-orange focus:outline-none"
              >
                <option value="All">Origin · all regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    From {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lb-dest" className="sr-only">
                Destination region
              </label>
              <select
                id="lb-dest"
                value={destRegion}
                onChange={(event) => {
                  const value = event.target.value as typeof destRegion;
                  setDestRegion(value);
                  onFilterChange('dest_region', value);
                }}
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-infamous-orange focus:outline-none"
              >
                <option value="All">Destination · all regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    To {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lb-equipment" className="sr-only">
                Equipment
              </label>
              <select
                id="lb-equipment"
                value={equipment}
                onChange={(event) => {
                  const value = event.target.value as typeof equipment;
                  setEquipment(value);
                  onFilterChange('equipment', value);
                }}
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-infamous-orange focus:outline-none"
              >
                <option value="All">All equipment</option>
                {equipmentOptions.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lb-pickup" className="sr-only">
                Pickup window
              </label>
              <select
                id="lb-pickup"
                value={pickupWindow}
                onChange={(event) => {
                  const value = event.target.value as typeof pickupWindow;
                  setPickupWindow(value);
                  onFilterChange('pickup_window', value);
                }}
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-infamous-orange focus:outline-none"
              >
                <option value="All">Any pickup</option>
                {pickupWindows.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
            <div>
              <label htmlFor="lb-min-rpm" className="sr-only">
                Minimum rate per mile
              </label>
              <div className="relative">
                <DollarSign size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="lb-min-rpm"
                  type="number"
                  step="0.05"
                  min="0"
                  value={minRpm}
                  onChange={(event) => {
                    setMinRpm(event.target.value);
                    onFilterChange('min_rpm', event.target.value);
                  }}
                  placeholder="Min $/mi"
                  className="w-full rounded-lg border border-white/10 bg-[#111] py-2.5 pl-8 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-infamous-orange focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lb-min-pay" className="sr-only">
                Minimum total pay
              </label>
              <div className="relative">
                <DollarSign size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="lb-min-pay"
                  type="number"
                  step="50"
                  min="0"
                  value={minPay}
                  onChange={(event) => {
                    setMinPay(event.target.value);
                    onFilterChange('min_pay', event.target.value);
                  }}
                  placeholder="Min total pay"
                  className="w-full rounded-lg border border-white/10 bg-[#111] py-2.5 pl-8 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-infamous-orange focus:outline-none"
                />
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={quickPayOnly}
                onChange={(event) => {
                  setQuickPayOnly(event.target.checked);
                  onFilterChange('quick_pay_only', event.target.checked);
                }}
                className="h-4 w-4 accent-infamous-orange"
              />
              <Zap size={14} className="text-infamous-orange" aria-hidden="true" /> QuickPay loads only
            </label>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setOriginRegion('All');
                setDestRegion('All');
                setEquipment('All');
                setPickupWindow('All');
                setMinRpm('');
                setMinPay('');
                setQuickPayOnly(false);
                onFilterChange('reset', true);
              }}
              className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/30 hover:text-white"
            >
              Reset filters
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-6">
        <div
          aria-label="Load board summary"
          className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-[#101010] p-4 sm:grid-cols-4"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Loads matching</p>
            <p className="mt-1 text-2xl font-black">{totals.count}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Total miles</p>
            <p className="mt-1 text-2xl font-black">{totals.totalMiles.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Total pay</p>
            <p className="mt-1 text-2xl font-black">{formatMoney(totals.totalPay)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Average $/mi</p>
            <p className="mt-1 text-2xl font-black text-infamous-orange">
              {totals.avgRpm > 0 ? `$${totals.avgRpm.toFixed(2)}` : '—'}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#101010] p-10 text-center">
            <p className="text-lg font-bold text-white">No loads match those filters right now.</p>
            <p className="mt-2 text-sm text-zinc-400">
              Reset filters or check back shortly — new freight is posted throughout the day.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {filtered.map((load) => (
              <li key={load.id}>
                <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#101010] p-5">
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500">{load.id}</span>
                      <span className="rounded-full bg-infamous-orange/10 px-2.5 py-0.5 text-xs font-semibold text-infamous-orange">
                        {load.equipment}
                      </span>
                      {load.isHot ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-300">
                          <Flame size={12} /> Hot
                        </span>
                      ) : null}
                      {load.quickPay ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          <Zap size={12} /> QuickPay
                        </span>
                      ) : null}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                      <Clock size={12} aria-hidden="true" /> Posted {load.postedAgo} ago
                    </span>
                  </header>

                  <div className="mt-3">
                    <p className="flex items-start gap-2 text-base font-bold text-white">
                      <MapPin size={16} className="mt-0.5 text-infamous-orange" aria-hidden="true" />
                      <span>
                        {load.origin} <span className="text-zinc-500">→</span> {load.destination}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {load.freightType} · {load.weightLbs.toLocaleString()} lb · {load.miles.toLocaleString()} mi
                    </p>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">Pickup</dt>
                      <dd className="mt-0.5 text-white">{load.pickupAt}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">Delivery</dt>
                      <dd className="mt-0.5 text-white">{load.deliveryAt}</dd>
                    </div>
                  </dl>

                  {load.notes ? (
                    <p className="mt-3 rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs text-zinc-400">
                      {load.notes}
                    </p>
                  ) : null}

                  <footer className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-2xl font-black text-white">{formatMoney(load.totalPay)}</p>
                      <p className="text-xs text-zinc-500">${load.ratePerMile.toFixed(2)}/mi all-in</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onBookClick(load)}
                      aria-label={`Book load ${load.id}, ${load.origin} to ${load.destination}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-infamous-orange px-4 py-2.5 text-sm font-bold text-white transition hover:bg-infamous-orange-light focus:outline-none focus:ring-2 focus:ring-infamous-orange focus:ring-offset-2 focus:ring-offset-[#101010]"
                    >
                      Book this load <ArrowRight size={14} />
                    </button>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:grid-cols-3 lg:px-6">
          {[
            {
              title: 'Verified shipper, every load',
              detail:
                'No double brokering. Infamous Freight is the broker of record on every load posted here.',
              icon: <ShieldCheck size={20} />,
            },
            {
              title: 'Rate confirmation in writing',
              detail:
                'You see the line-haul, accessorials, and detention policy before you accept.',
              icon: <CheckCircle2 size={20} />,
            },
            {
              title: 'QuickPay on POD',
              detail:
                'Approved carriers get standard pay free, 48-hour QuickPay 2.5%, same-day 3.5%, instant 4%.',
              icon: <Zap size={20} />,
            },
          ].map((card) => (
            <article key={card.title} className="rounded-2xl border border-white/10 bg-[#101010] p-5">
              <div className="mb-3 inline-flex rounded-lg bg-infamous-orange/10 p-2.5 text-infamous-orange">
                {card.icon}
              </div>
              <h3 className="text-base font-bold text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{card.detail}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-12 lg:px-6">
          <p className="text-xs text-zinc-500">
            Loads shown are representative of recent Infamous Freight postings. Rates, pickup
            windows, and load details are confirmed by dispatch on a per-load rate confirmation
            before pickup. New to Infamous? Start with the carrier signup to unlock booking.
          </p>
        </div>
      </section>
    </main>
  );
};

export default PublicLoadBoardPage;
