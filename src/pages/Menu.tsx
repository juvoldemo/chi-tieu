import { useState } from 'react';
import type { ReactNode } from 'react';
import { Download, Plus, Settings, Tags, Users, Wallet } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { currentMonthKey, toCsv } from '../lib/format';
import type { Category, Transaction, Wallet as WalletType } from '../types';

interface MenuProps {
  categories: Category[];
  wallets: WalletType[];
  transactions: Transaction[];
  onAddCategory: (input: Pick<Category, 'name' | 'type' | 'icon' | 'color'>) => Promise<void>;
  onAddWallet: (input: Pick<WalletType, 'name' | 'balance'>) => Promise<void>;
}

export function Menu({ categories, wallets, transactions, onAddCategory, onAddWallet }: MenuProps) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');

  const exportCsv = () => {
    const rows = transactions.map((item) => ({
      date: item.transaction_date,
      type: item.type,
      amount: item.amount,
      category: item.categories?.name,
      wallet: item.wallets?.name,
      member: item.member_name,
      note: item.note,
    }));
    const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chi-tieu-${currentMonthKey()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-enter space-y-4">
      <div>
        <p className="text-sm font-medium text-ink/70">Thiết lập</p>
        <h1 className="text-2xl font-semibold text-ink">Menu</h1>
      </div>

      <GlassCard className="divide-y divide-white/25 overflow-hidden">
        <MenuRow icon={<Tags size={19} />} title="Quản lý danh mục" subtitle={`${categories.length} danh mục mặc định`} />
        <MenuRow icon={<Wallet size={19} />} title="Quản lý ví tiền" subtitle={wallets.map((item) => item.name).join(', ')} />
        <MenuRow icon={<Users size={19} />} title="Quản lý thành viên" subtitle="Chồng · Vợ" />
        <MenuRow icon={<Settings size={19} />} title="Cài đặt tháng hiện tại" subtitle={currentMonthKey()} />
      </GlassCard>

      <GlassCard className="space-y-3 p-4">
        <p className="font-semibold text-ink">Thêm danh mục</p>
        <div className="grid grid-cols-[1fr_112px] gap-2">
          <input className="h-11 min-w-0 rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Tên danh mục" />
          <select className="h-11 rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" value={categoryType} onChange={(event) => setCategoryType(event.target.value as 'expense' | 'income')}>
            <option value="expense">Chi</option>
            <option value="income">Thu</option>
          </select>
        </div>
        <button
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/70 font-semibold text-lagoon transition active:scale-[0.98]"
          disabled={!categoryName.trim()}
          onClick={async () => {
            await onAddCategory({ name: categoryName.trim(), type: categoryType, icon: 'CircleEllipsis', color: '#d89614' });
            setCategoryName('');
          }}
        >
          <Plus size={17} />
          Thêm danh mục
        </button>
      </GlassCard>

      <GlassCard className="space-y-3 p-4">
        <p className="font-semibold text-ink">Thêm ví tiền</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="h-11 min-w-0 rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" value={walletName} onChange={(event) => setWalletName(event.target.value)} placeholder="Tên ví" />
          <input className="h-11 min-w-0 rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" inputMode="numeric" value={walletBalance} onChange={(event) => setWalletBalance(event.target.value)} placeholder="Số dư" />
        </div>
        <button
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/70 font-semibold text-lagoon transition active:scale-[0.98]"
          disabled={!walletName.trim()}
          onClick={async () => {
            await onAddWallet({ name: walletName.trim(), balance: Number(walletBalance || 0) });
            setWalletName('');
            setWalletBalance('');
          }}
        >
          <Plus size={17} />
          Thêm ví tiền
        </button>
      </GlassCard>

      <div className="grid grid-cols-1 gap-3">
        <PrimaryButton onClick={exportCsv} className="flex items-center justify-center gap-2">
          <Download size={18} />
          Xuất dữ liệu CSV
        </PrimaryButton>
      </div>
    </div>
  );
}

function MenuRow({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 text-lagoon">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="truncate text-sm font-medium text-ink/64">{subtitle}</p>
      </div>
    </div>
  );
}
