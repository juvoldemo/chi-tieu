import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { todayKey } from '../lib/format';
import type { Category, Transaction, TransactionInput, TransactionType, Wallet } from '../types';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';

interface TransactionFormProps {
  categories: Category[];
  wallets: Wallet[];
  initial?: Transaction | null;
  onSubmit: (input: TransactionInput) => Promise<void>;
}

const fieldClass =
  'h-12 w-full rounded-2xl border border-white/35 bg-white/45 px-4 text-[15px] text-ink placeholder:text-ink/35 shadow-inner';

export function TransactionForm({ categories, wallets, initial, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const visibleCategories = useMemo(() => categories.filter((item) => item.type === type), [categories, type]);
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? visibleCategories[0]?.id ?? '');
  const [walletId, setWalletId] = useState(initial?.wallet_id ?? wallets[0]?.id ?? '');
  const [memberName, setMemberName] = useState<'Chồng' | 'Vợ'>(initial?.member_name ?? 'Chồng');
  const [transactionDate, setTransactionDate] = useState(initial?.transaction_date ?? todayKey());
  const [note, setNote] = useState(initial?.note ?? '');
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    const nextCategory = categories.find((item) => item.type === nextType);
    setCategoryId(nextCategory?.id ?? '');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        type,
        amount: Number(amount),
        category_id: categoryId,
        wallet_id: walletId,
        member_name: memberName,
        note,
        transaction_date: transactionDate,
      });
      if (!initial) {
        setAmount('');
        setNote('');
        setTransactionDate(todayKey());
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard strong className="p-4">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 rounded-[22px] bg-white/35 p-1">
          {(['expense', 'income'] as TransactionType[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleTypeChange(item)}
              className={`h-11 rounded-[18px] text-sm font-semibold transition ${
                type === item ? 'bg-white/70 text-ink shadow-soft' : 'text-ink/55'
              }`}
            >
              {item === 'expense' ? 'Chi' : 'Thu'}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Số tiền</span>
          <input className={fieldClass} inputMode="numeric" min="0" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0 ₫" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Danh mục</span>
            <select className={fieldClass} required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Ví tiền</span>
            <select className={fieldClass} required value={walletId} onChange={(event) => setWalletId(event.target.value)}>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Người</span>
            <select className={fieldClass} value={memberName} onChange={(event) => setMemberName(event.target.value as 'Chồng' | 'Vợ')}>
              <option>Chồng</option>
              <option>Vợ</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Ngày</span>
            <input className={fieldClass} type="date" required value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Ghi chú</span>
          <textarea className={`${fieldClass} h-24 resize-none py-3`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: bữa tối, siêu thị..." />
        </label>

        <PrimaryButton type="submit" disabled={saving || !amount || !categoryId || !walletId} className="flex w-full items-center justify-center gap-2">
          <Save size={18} />
          {saving ? 'Đang lưu...' : initial ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
