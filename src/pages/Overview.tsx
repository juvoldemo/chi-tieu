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
        <MetricCard title="Thu tháng này" value={formatCurrency(summary.income)} icon={<ArrowUpRight size={18} />} tone="text-emerald-700" />
        <MetricCard title="Chi tháng này" value={formatCurrency(summary.expense)} icon={<ArrowDownRight size={18} />} tone="text-rose-600" />
      </div>

      <GlassCard strong className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink/58">Số dư còn lại</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">{formatCurrency(summary.balance)}</h2>
          </div>
          <div className="rounded-3xl bg-white/55 p-3 text-lagoon">
            <PiggyBank size={26} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-3xl bg-white/35 px-4 py-3">
          <span className="text-sm text-ink/60">Tỷ lệ tiết kiệm</span>
          <span className="text-lg font-semibold text-ink">{summary.savingRate}%</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="text-sm text-ink/55">Chi hôm nay</p>
          <p className="mt-2 text-xl font-semibold text-ink">{formatCurrency(summary.todayExpense)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-ink/55">Chi nhiều hơn</p>
          <p className="mt-2 text-xl font-semibold text-ink">{summary.biggerSpender?.name ?? 'Chưa có'}</p>
          <p className="mt-1 text-xs text-ink/50">{summary.biggerSpender ? formatCurrency(summary.biggerSpender.amount) : 'Tháng này'}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Chi tiêu theo danh mục</p>
            <p className="text-xs text-ink/48">Top danh mục trong tháng</p>
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
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/40">
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

function MetricCard({ title, value, icon, tone }: { title: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <GlassCard className="p-4">
      <div className={`mb-3 inline-grid h-9 w-9 place-items-center rounded-2xl bg-white/55 ${tone}`}>{icon}</div>
      <p className="text-sm text-ink/55">{title}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </GlassCard>
  );
}
