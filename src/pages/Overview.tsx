import { ArrowDownRight, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { EmptyState } from '../components/EmptyState';
import { GlassCard } from '../components/GlassCard';
import { formatCurrency } from '../lib/format';
import type { Category, Transaction } from '../types';

interface OverviewProps {
  summary: {
    income: number;
    expense: number;
    balance: number;
    savingRate: number;
    todayExpense: number;
    biggerSpender: { name: string; amount: number } | null;
  };
  categories: Category[];
  transactions: Transaction[];
}

export function Overview({ summary, categories, transactions }: OverviewProps) {
  const month = new Date().toISOString().slice(0, 7);
  const categoryTotals = categories
    .filter((category) => category.type === 'expense')
    .map((category) => ({
      category,
      total: transactions
        .filter((item) => item.type === 'expense' && item.transaction_date.startsWith(month) && item.category_id === category.id)
        .reduce((sum, item) => sum + Number(item.amount), 0),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(...categoryTotals.map((item) => item.total), 1);

  return (
    <div className="page-enter space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="Thu tháng này" value={formatCurrency(summary.income)} icon={<ArrowUpRight size={18} />} tone="text-emerald-700" imageSrc="/couple-photo.jpg" />
        <MetricCard title="Chi tháng này" value={formatCurrency(summary.expense)} icon={<ArrowDownRight size={18} />} tone="text-rose-600" />
      </div>

      <GlassCard strong className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink/72">Số dư còn lại</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">{formatCurrency(summary.balance)}</h2>
          </div>
          <div className="rounded-3xl bg-white/55 p-3 text-lagoon">
            <PiggyBank size={26} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-3xl bg-white/65 px-4 py-3">
          <span className="text-sm font-medium text-ink/72">Tỷ lệ tiết kiệm</span>
          <span className="text-lg font-semibold text-ink">{summary.savingRate}%</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="text-sm font-medium text-ink/70">Chi hôm nay</p>
          <p className="mt-2 text-xl font-semibold text-ink">{formatCurrency(summary.todayExpense)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm font-medium text-ink/70">Chi nhiều hơn</p>
          <p className="mt-2 text-xl font-semibold text-ink">{summary.biggerSpender?.name ?? 'Chưa có'}</p>
          <p className="mt-1 text-xs font-medium text-ink/62">{summary.biggerSpender ? formatCurrency(summary.biggerSpender.amount) : 'Tháng này'}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Chi tiêu theo danh mục</p>
            <p className="text-xs font-medium text-ink/62">Top danh mục trong tháng</p>
          </div>
          <TrendingUp size={20} className="text-lagoon" />
        </div>
        {categoryTotals.length === 0 ? (
          <EmptyState title="Chưa có chi tiêu" description="Giao dịch mới sẽ hiện thành biểu đồ tại đây." />
        ) : (
          <div className="space-y-4">
            {categoryTotals.slice(0, 5).map(({ category, total }) => (
              <div key={category.id} className="flex items-center gap-3">
                <CategoryIcon icon={category.icon} color={category.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-ink">{category.name}</span>
                    <span className="shrink-0 text-ink/70">{formatCurrency(total)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/65">
                    <div className="h-full rounded-full bg-gradient-to-r from-lagoon to-aqua" style={{ width: `${Math.max((total / maxTotal) * 100, 8)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function MetricCard({ title, value, icon, tone, imageSrc }: { title: string; value: string; icon: React.ReactNode; tone: string; imageSrc?: string }) {
  return (
    <GlassCard className="relative overflow-hidden p-4">
      {imageSrc && (
        <>
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.48] saturate-[1.08] contrast-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#fff8dc]/42 via-[#fff1b8]/24 to-[#d89614]/10" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fff8dc]/72 to-transparent" />
        </>
      )}
      <div className="relative z-10">
        <div className={`mb-3 inline-grid h-9 w-9 place-items-center rounded-2xl bg-white/75 ${tone}`}>{icon}</div>
        <div className={imageSrc ? 'inline-block rounded-2xl bg-white/58 px-2.5 py-1 backdrop-blur-[2px]' : ''}>
          <p className="text-sm font-semibold text-ink/82">{title}</p>
          <p className="mt-1 text-lg font-bold text-ink">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}
