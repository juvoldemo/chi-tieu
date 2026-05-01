import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}

export function GlassCard({ children, className = '', strong = false }: GlassCardProps) {
  return <section className={`${strong ? 'glass-strong' : 'glass'} rounded-[28px] ${className}`}>{children}</section>;
}
