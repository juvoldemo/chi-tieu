import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { todayKey } from '../lib/format';
import type { Category, Transaction, TransactionInput, TransactionType, Wallet } from '../types';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';

interface TransactionFormProps {
  categories: Category[];
  wallets: Wallet[];
  members: string[];
  initial?: Transaction | null;
  onSubmit: (input: TransactionInput) => Promise<void>;
}

const fieldClass =
  'h-12 w-full min-w-0 rounded-2xl border border-white/70 bg-white/70 px-4 text-[15px] text-ink placeholder:text-ink/50 shadow-inner';
const dateFieldClass =
  'h-12 w-full min-w-0 rounded-2xl border border-white/70 bg-white/70 px-3 text-center text-[14px] text-ink shadow-inner';

const onlyDigits = (value: string) => value.replace(/\D/g, '');
const formatAmountInput = (value: string | number) => {
  const digits = onlyDigits(String(value));
  return digits ? Number(digits).toLocaleString('en-US') : '';
};

export function TransactionForm({ categories, wallets, members, initial, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const visibleCategories = useMemo(() => categories, [categories]);
  const [amount, setAmount] = useState(initial?.amount ? formatAmountInput(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? visibleCategories[0]?.id ?? '');
  const [walletId, setWalletId] = useState(initial?.wallet_id ?? wallets[0]?.id ?? '');
  const [memberName, setMemberName] = useState(initial?.member_name ?? members[0] ?? 'Chồng');
  const [transactionDate, setTransactionDate] = useState(initial?.transaction_date ?? todayKey());
  const [note, setNote] = useState(initial?.note ?? '');
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    setCategoryId(categories[0]?.id ?? '');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        type,
        amount: Number(onlyDigits(amount)),
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
        <div className="grid grid-cols-2 rounded-[22px] bg-white/55 p-1">
          {(['expense', 'income'] as TransactionType[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleTypeChange(item)}
              className={`h-11 rounded-[18px] text-sm font-semibold transition ${
                type === item ? 'bg-white/90 text-ink shadow-soft' : 'text-ink/68'
              }`}
            >
              {item === 'expense' ? 'Chi' : 'Thu'}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Số tiền</span>
          <input
            className={fieldClass}
            inputMode="numeric"
            min="0"
            required
            value={amount}
            onChange={(event) => setAmount(formatAmountInput(event.target.value))}
            placeholder="0 ₫"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Danh mục</span>
            <select className={fieldClass} required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Ví tiền</span>
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
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Người</span>
            <select className={fieldClass} value={memberName} onChange={(event) => setMemberName(event.target.value)}>
              {members.map((member) => (
                <option key={member}>{member}</option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Ngày</span>
            <input className={dateFieldClass} type="date" required value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Ghi chú</span>
          <textarea className={`${fieldClass} h-24 resize-none py-3`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: bữa tối, siêu thị..." />
        </label>

        <PrimaryButton type="submit" disabled={saving || !onlyDigits(amount) || !categoryId || !walletId} className="flex w-full items-center justify-center gap-2">
          <Save size={18} />
          {saving ? 'Đang lưu...' : initial ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
