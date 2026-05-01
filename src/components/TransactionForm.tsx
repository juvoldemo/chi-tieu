import { useEffect, useMemo, useState } from 'react';
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
  'control-surface h-12 w-full min-w-0 rounded-2xl px-4 text-[15px] text-ink placeholder:text-ink/50';
const dateDisplayClass =
  'control-surface flex h-12 w-full min-w-0 items-center justify-center rounded-2xl px-3 text-center text-[15px] font-medium text-ink';

const onlyDigits = (value: string) => value.replace(/\D/g, '');
const formatAmountInput = (value: string | number) => {
  const digits = onlyDigits(String(value));
  return digits ? Number(digits).toLocaleString('en-US') : '';
};
const formatDateInput = (value: string) => {
  const [year, month, day] = value.split('-');
  return day && month && year ? `${day}/${month}/${year}` : '';
};
const sortMembers = (items: string[]) =>
  [...items].sort((a, b) => {
    const order = ['vợ', 'chồng'];
    const aIndex = order.indexOf(a.trim().toLocaleLowerCase('vi-VN'));
    const bIndex = order.indexOf(b.trim().toLocaleLowerCase('vi-VN'));
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
const sortWallets = (items: Wallet[]) =>
  [...items].sort((a, b) => {
    const aIsBank = a.name.trim().toLocaleLowerCase('vi-VN') === 'ngân hàng';
    const bIsBank = b.name.trim().toLocaleLowerCase('vi-VN') === 'ngân hàng';
    return Number(bIsBank) - Number(aIsBank);
  });

export function TransactionForm({ categories, wallets, members, initial, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const visibleCategories = useMemo(() => categories.filter((category) => category.type === type), [categories, type]);
  const visibleWallets = useMemo(() => sortWallets(wallets), [wallets]);
  const visibleMembers = useMemo(() => sortMembers(members), [members]);
  const [amount, setAmount] = useState(initial?.amount ? formatAmountInput(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? visibleCategories[0]?.id ?? '');
  const [walletId, setWalletId] = useState(initial?.wallet_id ?? visibleWallets[0]?.id ?? '');
  const [memberName, setMemberName] = useState(initial?.member_name ?? visibleMembers[0] ?? 'Vợ');
  const [transactionDate, setTransactionDate] = useState(initial?.transaction_date ?? todayKey());
  const [note, setNote] = useState(initial?.note ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visibleCategories.length) {
      setCategoryId('');
      return;
    }

    if (!visibleCategories.some((category) => category.id === categoryId)) {
      setCategoryId(visibleCategories[0].id);
    }
  }, [categoryId, visibleCategories]);

  useEffect(() => {
    if (type === 'income') {
      setWalletId('');
      return;
    }

    if (!visibleWallets.length) {
      setWalletId('');
      return;
    }

    if (!visibleWallets.some((wallet) => wallet.id === walletId)) {
      setWalletId(visibleWallets[0].id);
    }
  }, [type, visibleWallets, walletId]);

  useEffect(() => {
    if (visibleMembers.length && !visibleMembers.includes(memberName)) {
      setMemberName(visibleMembers[0]);
    }
  }, [memberName, visibleMembers]);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        type,
        amount: Number(onlyDigits(amount)),
        category_id: categoryId,
        wallet_id: type === 'income' ? null : walletId,
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
        <div className="control-surface grid grid-cols-2 rounded-[22px] p-1">
          {(['expense', 'income'] as TransactionType[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleTypeChange(item)}
              className={`h-11 rounded-[18px] text-sm font-semibold transition ${
                type === item ? 'control-active text-ink shadow-soft' : 'text-ink/68'
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

        <div className={`grid gap-3 ${type === 'expense' ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
          {type === 'expense' && (
            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Ví tiền</span>
              <select className={fieldClass} required value={walletId} onChange={(event) => setWalletId(event.target.value)}>
                {visibleWallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Người</span>
            <select className={fieldClass} value={memberName} onChange={(event) => setMemberName(event.target.value)}>
              {visibleMembers.map((member) => (
                <option key={member}>{member}</option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Ngày</span>
            <span className="relative block min-w-0">
              <span className={dateDisplayClass}>{formatDateInput(transactionDate)}</span>
              <input
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                type="date"
                required
                value={transactionDate}
                aria-label="Ngày"
                onChange={(event) => setTransactionDate(event.target.value)}
              />
            </span>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Ghi chú</span>
          <textarea className={`${fieldClass} h-24 resize-none py-3`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: bữa tối, siêu thị..." />
        </label>

        <PrimaryButton type="submit" disabled={saving || !onlyDigits(amount) || !categoryId || (type === 'expense' && !walletId)} className="flex w-full items-center justify-center gap-2">
          <Save size={18} />
          {saving ? 'Đang lưu...' : initial ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
