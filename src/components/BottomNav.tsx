import { ChartPie, ListChecks, PlusCircle, SlidersHorizontal, WalletCards } from 'lucide-react';
import type { TabKey } from '../types';

const tabs: { key: TabKey; label: string; Icon: typeof ChartPie }[] = [
  { key: 'overview', label: 'Tổng Quan', Icon: ChartPie },
  { key: 'transactions', label: 'Giao dịch', Icon: ListChecks },
  { key: 'entry', label: 'Ghi chi', Icon: PlusCircle },
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
          const isEntry = key === 'entry';
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={
                isEntry
                  ? `mx-auto grid h-[54px] w-[54px] place-items-center rounded-[24px] bg-gradient-to-br from-[#005BAA] to-[#00A3E0] text-white shadow-[0_10px_26px_rgba(0,91,170,.30)] transition-all duration-200 active:scale-95 ${
                      active ? 'scale-105 ring-4 ring-white/45' : ''
                    }`
                  : `flex h-[58px] flex-col items-center justify-center gap-1 rounded-[22px] text-[11px] transition-all duration-200 ${
                      active ? 'bg-white/80 text-ink shadow-soft' : 'text-ink/68'
                    }`
              }
              aria-label={label}
            >
              <Icon size={isEntry ? 30 : 21} strokeWidth={active || isEntry ? 2.4 : 1.8} />
              {!isEntry && <span className="max-w-full truncate">{label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
