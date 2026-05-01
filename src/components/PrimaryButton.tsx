import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-2xl bg-gradient-to-r from-[#d89614] to-[#ffe08a] px-5 font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
