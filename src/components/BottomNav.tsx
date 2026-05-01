import { ChartPie, ListChecks, PlusCircle, SlidersHorizontal, WalletCards } from 'lucide-react';
import type { TabKey } from '../types';

const tabs: { key: TabKey; label: string; Icon: typeof ChartPie }[] = [
  { key: 'overview', label: 'Tổng quan', Icon: ChartPie },
  { key: 'entry', label: 'Ghi chi', Icon: PlusCircle },
  { key: 'transactions', label: 'Giao dịch', Icon: ListChecks },
  { key: 'budgets', label: 'Ngân sách', Icon: WalletCards },
  { key: 'menu', label: 'Menu', Icon: SlidersHorizontal },
];

interface BottomNavProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      <div className="glass mx-auto grid max-w-md grid-cols-5 rounded-[30px] p-2">
        {tabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex h-[58px] flex-col items-center justify-center gap-1 rounded-[22px] text-[11px] transition-all duration-200 ${
                active ? 'bg-white/55 text-ink shadow-soft' : 'text-ink/55'
              }`}
              aria-label={label}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
              <span className="max-w-full truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
