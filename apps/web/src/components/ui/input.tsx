import * as React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border border-infamous-border bg-infamous-panel px-3 py-2 text-sm text-[#F5E8E8] placeholder:text-[#B88989]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red/30 focus:border-infamous-red transition-colors ${className}`.trim()}
      {...props}
    />
  );
}
