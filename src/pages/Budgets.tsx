import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { EmptyState } from '../components/EmptyState';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { currentMonthKey, formatCurrency } from '../lib/format';
import type { Budget, BudgetInput, Category, Transaction } from '../types';

interface BudgetsProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  onSave: (input: BudgetInput) => Promise<void>;
}

export function Budgets({ budgets, categories, transactions, onSave }: BudgetsProps) {
  const [month, setMonth] = useState(currentMonthKey());
  const expenseCategories = categories.filter((item) => item.type === 'expense');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const visibleBudgets = budgets.filter((item) => item.month === month);

  const spentFor = (categoryIdValue: string) =>
    transactions
      .filter((item) => item.type === 'expense' && item.category_id === categoryIdValue && item.transaction_date.startsWith(month))
      .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="page-enter space-y-4">
      <div>
        <p className="text-sm font-medium text-ink/70">Kiểm soát</p>
        <h1 className="text-2xl font-semibold text-ink">Ngân sách</h1>
      </div>

      <GlassCard strong className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <input className="h-12 rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-ink" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          <select className="h-12 rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-ink" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {expenseCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <input
          className="h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-ink"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Số tiền ngân sách"
        />
        <PrimaryButton
          className="flex w-full items-center justify-center gap-2"
          disabled={!categoryId || !amount}
          onClick={async () => {
            await onSave({ category_id: categoryId, month, amount: Number(amount) });
            setAmount('');
          }}
        >
          <Plus size={18} />
          Lưu ngân sách
        </PrimaryButton>
      </GlassCard>

      {visibleBudgets.length === 0 ? (
        <EmptyState title="Chưa có ngân sách" description="Tạo ngân sách theo danh mục để theo dõi tiến độ tháng này." />
      ) : (
        <div className="space-y-3">
          {visibleBudgets.map((budget) => {
            const spent = spentFor(budget.category_id);
            const percent = budget.amount > 0 ? Math.round((spent / Number(budget.amount)) * 100) : 0;
            const tone = percent >= 100 ? 'from-rose-500 to-orange-400' : percent >= 80 ? 'from-amber-400 to-orange-300' : 'from-lagoon to-aqua';
            return (
              <GlassCard key={budget.id} className="p-4">
                <div className="flex items-center gap-3">
                  <CategoryIcon icon={budget.categories?.icon} color={budget.categories?.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-ink">{budget.categories?.name ?? 'Danh mục'}</p>
                      <p className="text-sm font-semibold text-ink/70">{percent}%</p>
                    </div>
                    <p className="mt-1 text-xs font-medium text-ink/65">
                      {formatCurrency(spent)} / {formatCurrency(Number(budget.amount))}
                    </p>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/65">
                      <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                    {percent >= 80 && <p className={`mt-2 text-xs font-medium ${percent >= 100 ? 'text-rose-700' : 'text-amber-700'}`}>{percent >= 100 ? 'Đã vượt ngân sách' : 'Sắp chạm giới hạn 80%'}</p>}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
