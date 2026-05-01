import { Inbox } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <GlassCard className="flex flex-col items-center px-5 py-8 text-center">
      <div className="mb-3 rounded-3xl bg-[#005BAA]/10 p-4 text-lagoon">
        <Inbox size={28} />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm font-medium leading-6 text-ink/72">{description}</p>
    </GlassCard>
  );
}
