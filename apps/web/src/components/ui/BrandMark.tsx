import { Truck } from 'lucide-react';
import { BRAND } from '@/lib/brand';

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

const BrandMark: React.FC<BrandMarkProps> = ({ compact = false, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div
      className="w-8 h-8 rounded-lg bg-gradient-to-br from-infamous-orange to-infamous-orange-light flex items-center justify-center flex-shrink-0 shadow-lg shadow-infamous-orange/20"
      aria-hidden="true"
    >
      <Truck size={18} className="text-white" />
    </div>
    {!compact && (
      <div>
        <span className="text-sm font-extrabold tracking-tight leading-none">{BRAND.shortName}</span>
        <p className="text-[10px] text-gray-500 leading-none">{BRAND.secondaryName}</p>
      </div>
    )}
  </div>
);

export default BrandMark;
