import { Infinity } from 'lucide-react';
import { BRAND } from '@/lib/brand';

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: { box: 'w-8 h-8', icon: 18, shadow: '0 0 18px rgba(255, 26, 26, 0.5)' },
  md: { box: 'w-10 h-10', icon: 24, shadow: '0 0 22px rgba(255, 26, 26, 0.6)' },
  lg: { box: 'w-14 h-14', icon: 34, shadow: '0 0 30px rgba(255, 26, 26, 0.7)' },
};

const BrandMark: React.FC<BrandMarkProps> = ({ compact = false, className = '', size = 'sm' }) => {
  const s = sizeMap[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.box} rounded-xl flex items-center justify-center flex-shrink-0`}
        style={{ boxShadow: s.shadow }}
        aria-hidden="true"
      >
        <Infinity size={s.icon} className="text-infamous-red-light" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.8))' }} />
      </div>
      {!compact && (
        <div>
          <span className="font-display text-sm font-extrabold leading-none text-[#F5E8E8]">{BRAND.shortName}</span>
          <p className="text-[10px] text-infamous-muted leading-none">{BRAND.secondaryName}</p>
        </div>
      )}
    </div>
  );
};

export default BrandMark;
