import * as React from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'action' | 'success' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'default', className = '', type = 'button', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-infamous-dark';
  const byVariant: Record<ButtonVariant, string> = {
    default: 'bg-gradient-to-br from-infamous-red to-infamous-red-dark text-[#F5E8E8] border border-infamous-red-light/40 hover:shadow-[0_0_28px_rgba(255,26,26,0.6)] shadow-[0_0_18px_rgba(255,26,26,0.45)] focus-visible:ring-infamous-red',
    outline: 'border border-infamous-border text-[#F5E8E8] hover:bg-infamous-panel hover:border-infamous-border-light focus-visible:ring-infamous-red',
    ghost: 'text-[#F5E8E8] hover:bg-infamous-panel focus-visible:ring-infamous-red',
    action: 'bg-infamous-red/10 border border-infamous-red/20 text-infamous-red-light hover:bg-infamous-red/20 focus-visible:ring-infamous-red',
    success: 'bg-[#36D399]/10 border border-[#36D399]/20 text-[#36D399] hover:bg-[#36D399]/20 focus-visible:ring-[#36D399]',
    danger: 'bg-[#FF0033]/10 border border-[#FF0033]/20 text-[#FF0033] hover:bg-[#FF0033]/20 focus-visible:ring-[#FF0033]',
  };

  return <button type={type} className={`${base} ${byVariant[variant]} ${className}`.trim()} {...props} />;
}
