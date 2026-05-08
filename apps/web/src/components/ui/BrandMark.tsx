import { Route } from 'lucide-react';
import { BRAND } from '@/lib/brand';

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

const BrandMark: React.FC<BrandMarkProps> = ({ compact = false, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div
      className="w-8 h-8 rounded-lg bg-gradient-to-br from-infamous-orange via-infamous-amber to-infamous-steel flex items-center justify-center flex-shrink-0 shadow-lg shadow-infamous-orange/20"
      aria-hidden="true"
    >
      <Route size={18} className="text-infamous-darker" />
    </div>
    {!compact && (
      <div>
        <span className="font-display text-sm font-extrabold leading-none">{BRAND.shortName}</span>
        <p className="text-[10px] text-infamous-muted leading-none">{BRAND.secondaryName}</p>
      </div>
    )}
  </div>
);

export default BrandMark;
