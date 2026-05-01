import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight, Download, Plus, RefreshCw, RotateCcw, Settings, Tags, Trash2, Users, Wallet } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { formatCurrency, toCsv } from '../lib/format';
import type { Category, Transaction, Wallet as WalletType } from '../types';

type MenuSection = 'categories' | 'wallets' | 'members' | 'month';

interface MenuProps {
  categories: Category[];
  wallets: WalletType[];
  transactions: Transaction[];
  members: string[];
  selectedMonth: string;
  onMembersChange: (members: string[]) => void;
  onMonthChange: (month: string) => void;
  onAddCategory: (input: Pick<Category, 'name' | 'type' | 'icon' | 'color'>) => Promise<void>;
  onAddWallet: (input: Pick<WalletType, 'name' | 'balance'>) => Promise<void>;
  onResetCategories: () => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onOpenReset: () => void;
}

export function Menu({
  categories,
  wallets,
  transactions,
  members,
  selectedMonth,
  onMembersChange,
  onMonthChange,
  onAddWallet,
  onResetCategories,
  onDeleteWallet,
  onRefresh,
  onOpenReset,
}: MenuProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('categories');
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [memberDrafts, setMemberDrafts] = useState([members[0] ?? 'Chồng', members[1] ?? 'Vợ']);

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
    link.download = `chi-tieu-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveMembers = () => {
    onMembersChange(memberDrafts);
  };

  return (
    <div className="page-enter space-y-4">
      <GlassCard className="divide-y divide-white/25 overflow-hidden">
        <MenuRow
          active={activeSection === 'categories'}
          icon={<Tags size={19} />}
          title="Quản lý danh mục"
          subtitle={`${categories.length} danh mục mặc định`}
          onClick={() => setActiveSection('categories')}
        />
        <MenuRow
          active={activeSection === 'wallets'}
          icon={<Wallet size={19} />}
          title="Quản lý ví tiền"
          subtitle={wallets.map((item) => item.name).join(', ') || 'Chưa có ví'}
          onClick={() => setActiveSection('wallets')}
        />
        <MenuRow
          active={activeSection === 'members'}
          icon={<Users size={19} />}
          title="Quản lý thành viên"
          subtitle={members.join(' · ')}
          onClick={() => setActiveSection('members')}
        />
        <MenuRow
          active={activeSection === 'month'}
          icon={<Settings size={19} />}
          title="Cài đặt tháng hiện tại"
          subtitle={selectedMonth}
          onClick={() => setActiveSection('month')}
        />
      </GlassCard>

      <GlassCard className="grid grid-cols-2 gap-3 p-3">
        <button
          type="button"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white/70 px-3 font-semibold text-lagoon transition active:scale-[0.98]"
          onClick={onRefresh}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
        <button
          type="button"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 font-semibold text-rose-600 transition active:scale-[0.98]"
          onClick={onOpenReset}
        >
          <Trash2 size={18} />
          Reset
        </button>
      </GlassCard>

      {activeSection === 'categories' && (
        <GlassCard className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-ink">Danh mục đang dùng</p>
            <button
              className="flex h-10 items-center gap-2 rounded-2xl bg-white/70 px-3 text-sm font-semibold text-lagoon"
              onClick={onResetCategories}
            >
              <RotateCcw size={16} />
              Khôi phục
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-2xl bg-white/60 px-3 py-2 text-sm font-semibold text-ink">
                {category.name}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeSection === 'wallets' && (
        <GlassCard className="space-y-3 p-4">
          <p className="font-semibold text-ink">Ví tiền</p>
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{wallet.name}</p>
                  <p className="text-xs font-medium text-ink/62">{formatCurrency(Number(wallet.balance || 0))}</p>
                </div>
                <button
                  className="grid h-9 w-9 place-items-center rounded-2xl bg-white/75 text-rose-600"
                  onClick={() => onDeleteWallet(wallet.id)}
                  aria-label={`Xóa ví ${wallet.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="h-11 min-w-0 rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" value={walletName} onChange={(event) => setWalletName(event.target.value)} placeholder="Tên ví" />
            <input className="h-11 min-w-0 rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" inputMode="numeric" value={walletBalance} onChange={(event) => setWalletBalance(event.target.value.replace(/\D/g, ''))} placeholder="Số dư" />
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
      )}

      {activeSection === 'members' && (
        <GlassCard className="space-y-3 p-4">
          <p className="font-semibold text-ink">Thành viên</p>
          <input className="h-11 w-full rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" value={memberDrafts[0]} onChange={(event) => setMemberDrafts([event.target.value, memberDrafts[1]])} placeholder="Thành viên 1" />
          <input className="h-11 w-full rounded-2xl border border-white/70 bg-white/70 px-3 text-sm text-ink" value={memberDrafts[1]} onChange={(event) => setMemberDrafts([memberDrafts[0], event.target.value])} placeholder="Thành viên 2" />
          <PrimaryButton className="w-full" onClick={saveMembers}>
            Lưu thành viên
          </PrimaryButton>
        </GlassCard>
      )}

      {activeSection === 'month' && (
        <GlassCard className="space-y-3 p-4">
          <p className="font-semibold text-ink">Tháng đang xem</p>
          <input className="h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-ink" type="month" value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)} />
          <p className="text-sm font-medium leading-6 text-ink/64">Tổng quan, ngân sách và bộ lọc tháng này sẽ dùng tháng đã chọn.</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-3">
        <PrimaryButton onClick={exportCsv} className="flex items-center justify-center gap-2">
          <Download size={18} />
          Xuất dữ liệu CSV
        </PrimaryButton>
      </div>
    </div>
  );
}

function MenuRow({ icon, title, subtitle, active, onClick }: { icon: ReactNode; title: string; subtitle: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 p-4 text-left transition ${active ? 'bg-white/28' : 'active:bg-white/18'}`}>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 text-lagoon">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="truncate text-sm font-medium text-ink/64">{subtitle}</p>
      </div>
      <ChevronRight size={18} className={`text-ink/45 transition ${active ? 'rotate-90' : ''}`} />
    </button>
  );
}
