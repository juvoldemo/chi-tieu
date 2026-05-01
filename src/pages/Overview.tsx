import { ArrowDownRight, ArrowUpRight, BarChart3, PiggyBank, TrendingUp } from 'lucide-react';
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
  month: string;
}

export function Overview({ summary, categories, transactions, month }: OverviewProps) {
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
  const dailyExpenses = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const total = transactions
      .filter((item) => item.type === 'expense' && item.transaction_date === key)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      key,
      label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date),
      day: index === 6 ? 'Hôm nay' : new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date),
      total,
    };
  });
  const maxDailyExpense = Math.max(...dailyExpenses.map((item) => item.total), 1);

  return (
    <div className="page-enter space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="Thu tháng này" value={formatCurrency(summary.income)} icon={<ArrowUpRight size={18} />} tone="text-emerald-700" />
        <MetricCard title="Chi tháng này" value={formatCurrency(summary.expense)} icon={<ArrowDownRight size={18} />} tone="text-rose-600" />
      </div>

      <GlassCard strong className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink/72">Số dư còn lại</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">{formatCurrency(summary.balance)}</h2>
          </div>
          <div className="rounded-3xl bg-white/70 p-3 text-lagoon">
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
            <p className="text-sm font-semibold text-ink">Chi tiêu 7 ngày</p>
            <p className="text-xs font-medium text-ink/62">Tổng tiền chi theo từng ngày</p>
          </div>
          <BarChart3 size={20} className="text-lagoon" />
        </div>
        <div className="flex h-44 items-end gap-2">
          {dailyExpenses.map((item) => {
            const height = item.total > 0 ? Math.max((item.total / maxDailyExpense) * 100, 10) : 4;
            return (
              <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-2xl bg-white/45 p-1.5">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-lagoon to-aqua shadow-soft transition-all"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${formatCurrency(item.total)}`}
                  />
                </div>
                <div className="min-h-10 text-center">
                  <p className="text-[11px] font-semibold leading-4 text-ink">{item.day}</p>
                  <p className="text-[10px] font-medium leading-4 text-ink/60">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/55 px-3 py-2">
            <p className="text-xs font-medium text-ink/62">Cao nhất</p>
            <p className="text-sm font-bold text-ink">{formatCurrency(maxDailyExpense === 1 ? 0 : maxDailyExpense)}</p>
          </div>
          <div className="rounded-2xl bg-white/55 px-3 py-2">
            <p className="text-xs font-medium text-ink/62">7 ngày</p>
            <p className="text-sm font-bold text-ink">{formatCurrency(dailyExpenses.reduce((sum, item) => sum + item.total, 0))}</p>
          </div>
        </div>
      </GlassCard>

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

function MetricCard({ title, value, icon, tone }: { title: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <GlassCard className="p-4">
      <div>
        <div className={`mb-3 inline-grid h-9 w-9 place-items-center rounded-2xl bg-white/75 ${tone}`}>{icon}</div>
        <p className="text-sm font-semibold text-ink/82">{title}</p>
        <p className="mt-1 text-lg font-bold text-ink">{value}</p>
      </div>
    </GlassCard>
  );
}
