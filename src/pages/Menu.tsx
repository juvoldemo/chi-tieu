import { useState } from 'react';
import type { ReactNode } from 'react';
import { CalendarDays, ChevronRight, Download, Plus, Settings, Trash2, Users, Wallet } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { formatCurrency, toCsv } from '../lib/format';
import type { Anniversary, AnniversaryIcon, Category, Transaction, Wallet as WalletType } from '../types';

type MenuSection = 'anniversaries' | 'wallets' | 'members' | 'month';

interface MenuProps {
  wallets: WalletType[];
  transactions: Transaction[];
  members: string[];
  anniversaries: Anniversary[];
  selectedMonth: string;
  onMembersChange: (members: string[]) => void;
  onAnniversariesChange: (anniversaries: Anniversary[]) => void;
  onMonthChange: (month: string) => void;
  onAddCategory: (input: Pick<Category, 'name' | 'type' | 'icon' | 'color'>) => Promise<void>;
  onAddWallet: (input: Pick<WalletType, 'name' | 'balance'>) => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
  onOpenReset: () => void;
}

export function Menu({
  wallets,
  transactions,
  members,
  anniversaries,
  selectedMonth,
  onMembersChange,
  onAnniversariesChange,
  onMonthChange,
  onAddWallet,
  onDeleteWallet,
  onOpenReset,
}: MenuProps) {
  const [activeSection, setActiveSection] = useState<MenuSection | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [memberDrafts, setMemberDrafts] = useState([members[0] ?? 'Chồng', members[1] ?? 'Vợ']);
  const [anniversaryName, setAnniversaryName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [anniversaryIcon, setAnniversaryIcon] = useState<AnniversaryIcon>('love');

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

  const addAnniversary = () => {
    const cleanName = anniversaryName.trim();
    if (!cleanName || !anniversaryDate) return;

    const [, month, day] = anniversaryDate.split('-').map(Number);
    onAnniversariesChange([
      ...anniversaries,
      {
        id: crypto.randomUUID(),
        name: cleanName,
        shortName: cleanName,
        icon: anniversaryIcon,
        day,
        month,
      },
    ]);
    setAnniversaryName('');
    setAnniversaryDate('');
    setAnniversaryIcon('love');
  };

  const deleteAnniversary = (id: string) => {
    onAnniversariesChange(anniversaries.filter((item) => item.id !== id));
  };

  const toggleSection = (section: MenuSection) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  return (
    <div className="page-enter space-y-4">
      <GlassCard className="divide-y divide-white/25 overflow-hidden">
        <MenuRow
          active={activeSection === 'anniversaries'}
          icon={<CalendarDays size={19} />}
          title="Quản lý ngày kỷ niệm"
          subtitle={`${anniversaries.length} ngày đang lưu`}
          onClick={() => toggleSection('anniversaries')}
        />
        <MenuRow
          active={activeSection === 'wallets'}
          icon={<Wallet size={19} />}
          title="Quản lý ví tiền"
          subtitle={wallets.map((item) => item.name).join(', ') || 'Chưa có ví'}
          onClick={() => toggleSection('wallets')}
        />
        <MenuRow
          active={activeSection === 'members'}
          icon={<Users size={19} />}
          title="Quản lý thành viên"
          subtitle={members.join(' · ')}
          onClick={() => toggleSection('members')}
        />
        <MenuRow
          active={activeSection === 'month'}
          icon={<Settings size={19} />}
          title="Cài đặt tháng hiện tại"
          subtitle={selectedMonth}
          onClick={() => toggleSection('month')}
        />
      </GlassCard>

      {activeSection === 'anniversaries' && (
        <GlassCard className="space-y-3 p-4">
          <p className="font-semibold text-ink">Ngày kỷ niệm</p>
          <div className="space-y-2">
            {anniversaries.map((item) => (
              <div key={item.id} className="control-surface flex items-center gap-3 rounded-2xl px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{item.name}</p>
                  <p className="text-xs font-medium text-ink/62">
                    {String(item.day).padStart(2, '0')}/{String(item.month).padStart(2, '0')}
                  </p>
                </div>
                <button
                  className="control-surface grid h-9 w-9 place-items-center rounded-2xl text-rose-600"
                  onClick={() => deleteAnniversary(item.id)}
                  aria-label={`Xóa ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <input
            className="control-surface h-11 w-full rounded-2xl px-3 text-sm text-ink"
            value={anniversaryName}
            onChange={(event) => setAnniversaryName(event.target.value)}
            placeholder="Tên ngày kỷ niệm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="control-surface h-11 min-w-0 rounded-2xl px-3 text-sm text-ink"
              type="date"
              value={anniversaryDate}
              onChange={(event) => setAnniversaryDate(event.target.value)}
            />
            <select
              className="control-surface h-11 min-w-0 rounded-2xl px-3 text-sm text-ink"
              value={anniversaryIcon}
              onChange={(event) => setAnniversaryIcon(event.target.value as AnniversaryIcon)}
            >
              <option value="love">Yêu nhau</option>
              <option value="wedding">Ngày cưới</option>
              <option value="birthday">Sinh nhật</option>
            </select>
          </div>
          <button
            className="control-surface flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-lagoon transition active:scale-[0.98] disabled:opacity-50"
            disabled={!anniversaryName.trim() || !anniversaryDate}
            onClick={addAnniversary}
          >
            <Plus size={17} />
            Thêm ngày kỷ niệm
          </button>
        </GlassCard>
      )}

      <GlassCard className="p-3">
        <button
          type="button"
          className="control-surface flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-3 font-semibold text-rose-600 transition active:scale-[0.98]"
          onClick={onOpenReset}
        >
          <Trash2 size={18} />
          Reset
        </button>
      </GlassCard>

      {activeSection === 'wallets' && (
        <GlassCard className="space-y-3 p-4">
          <p className="font-semibold text-ink">Ví tiền</p>
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="control-surface flex items-center gap-3 rounded-2xl px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{wallet.name}</p>
                  <p className="text-xs font-medium text-ink/62">{formatCurrency(Number(wallet.balance || 0))}</p>
                </div>
                <button
                  className="control-surface grid h-9 w-9 place-items-center rounded-2xl text-rose-600"
                  onClick={() => onDeleteWallet(wallet.id)}
                  aria-label={`Xóa ví ${wallet.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="control-surface h-11 min-w-0 rounded-2xl px-3 text-sm text-ink" value={walletName} onChange={(event) => setWalletName(event.target.value)} placeholder="Tên ví" />
            <input className="control-surface h-11 min-w-0 rounded-2xl px-3 text-sm text-ink" inputMode="numeric" value={walletBalance} onChange={(event) => setWalletBalance(event.target.value.replace(/\D/g, ''))} placeholder="Số dư" />
          </div>
          <button
            className="control-surface flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-lagoon transition active:scale-[0.98]"
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
          <input className="control-surface h-11 w-full rounded-2xl px-3 text-sm text-ink" value={memberDrafts[0]} onChange={(event) => setMemberDrafts([event.target.value, memberDrafts[1]])} placeholder="Thành viên 1" />
          <input className="control-surface h-11 w-full rounded-2xl px-3 text-sm text-ink" value={memberDrafts[1]} onChange={(event) => setMemberDrafts([memberDrafts[0], event.target.value])} placeholder="Thành viên 2" />
          <PrimaryButton className="w-full" onClick={saveMembers}>
            Lưu thành viên
          </PrimaryButton>
        </GlassCard>
      )}

      {activeSection === 'month' && (
        <GlassCard className="space-y-3 p-4">
          <p className="font-semibold text-ink">Tháng đang xem</p>
          <input className="control-surface h-12 w-full rounded-2xl px-4 text-sm text-ink" type="month" value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)} />
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
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 p-4 text-left transition ${active ? 'bg-[#005BAA]/7' : 'active:bg-white/18'}`}>
      <span className="control-surface grid h-11 w-11 place-items-center rounded-2xl text-lagoon">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="truncate text-sm font-medium text-ink/64">{subtitle}</p>
      </div>
      <ChevronRight size={18} className={`text-ink/45 transition ${active ? 'rotate-90' : ''}`} />
    </button>
  );
}
