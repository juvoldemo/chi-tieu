import { useMemo, useState } from 'react';
import { CalendarDays, Pencil, Trash2, X } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { EmptyState } from '../components/EmptyState';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { TransactionForm } from '../components/TransactionForm';
import { formatCurrency, formatDayLabel } from '../lib/format';
import type { Category, Transaction, TransactionInput, Wallet } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  onUpdate: (id: string, input: TransactionInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type QuickFilter = 'today' | 'week' | 'month' | 'all';

export function Transactions({ transactions, categories, wallets, onUpdate, onDelete }: TransactionsProps) {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('month');
  const [member, setMember] = useState('all');
  const [category, setCategory] = useState('all');
  const [editing, setEditing] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    const month = today.slice(0, 7);

    return transactions.filter((item) => {
      const date = new Date(item.transaction_date);
      const byQuick =
        quickFilter === 'all' ||
        (quickFilter === 'today' && item.transaction_date === today) ||
        (quickFilter === 'week' && date >= weekStart) ||
        (quickFilter === 'month' && item.transaction_date.startsWith(month));
      const byMember = member === 'all' || item.member_name === member;
      const byCategory = category === 'all' || item.category_id === category;
      return byQuick && byMember && byCategory;
    });
  }, [category, member, quickFilter, transactions]);

  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, item) => {
    acc[item.transaction_date] = [...(acc[item.transaction_date] ?? []), item];
    return acc;
  }, {});

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa giao dịch này?')) return;
    await onDelete(id);
  };

  return (
    <div className="page-enter space-y-4">
      <div>
        <p className="text-sm text-ink/55">Lịch sử</p>
        <h1 className="text-2xl font-semibold text-ink">Giao dịch</h1>
      </div>

      <GlassCard className="space-y-3 p-3">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {[
            ['today', 'Hôm nay'],
            ['week', 'Tuần này'],
            ['month', 'Tháng này'],
            ['all', 'Tất cả'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setQuickFilter(key as QuickFilter)}
              className={`h-10 shrink-0 rounded-2xl px-4 text-sm font-medium transition ${quickFilter === key ? 'bg-white/70 text-ink shadow-soft' : 'bg-white/25 text-ink/58'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select className="h-11 rounded-2xl border border-white/35 bg-white/45 px-3 text-sm text-ink" value={member} onChange={(event) => setMember(event.target.value)}>
            <option value="all">Tất cả người</option>
            <option value="Chồng">Chồng</option>
            <option value="Vợ">Vợ</option>
          </select>
          <select className="h-11 rounded-2xl border border-white/35 bg-white/45 px-3 text-sm text-ink" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {filtered.length === 0 ? (
        <EmptyState title="Không có giao dịch" description="Thử đổi bộ lọc hoặc thêm giao dịch mới." />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <section key={date} className="space-y-2">
              <div className="flex items-center gap-2 px-1 text-sm font-semibold text-ink/65">
                <CalendarDays size={16} />
                <span>{formatDayLabel(date)}</span>
              </div>
              {items.map((item) => (
                <GlassCard key={item.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon icon={item.categories?.icon} color={item.categories?.color} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-semibold text-ink">{item.categories?.name ?? 'Danh mục'}</p>
                        <p className={`shrink-0 font-semibold ${item.type === 'income' ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {item.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(item.amount))}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-xs text-ink/52">
                        {item.member_name} · {item.wallets?.name ?? 'Ví'} {item.note ? `· ${item.note}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button className="grid h-9 w-9 place-items-center rounded-2xl bg-white/40 text-lagoon" onClick={() => setEditing(item)} aria-label="Sửa giao dịch">
                        <Pencil size={16} />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-2xl bg-white/40 text-rose-600" onClick={() => handleDelete(item.id)} aria-label="Xóa giao dịch">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </section>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/28 px-4 backdrop-blur-md">
          <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-[32px]">
            <div className="mb-3 flex justify-end">
              <button className="glass grid h-11 w-11 place-items-center rounded-full text-ink" onClick={() => setEditing(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            <TransactionForm
              categories={categories}
              wallets={wallets}
              initial={editing}
              onSubmit={async (input) => {
                await onUpdate(editing.id, input);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
