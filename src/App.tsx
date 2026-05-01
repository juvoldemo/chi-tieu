import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { GlassCard } from './components/GlassCard';
import { Toast } from './components/Toast';
import { useFinanceData } from './hooks/useFinanceData';
import { useToast } from './hooks/useToast';
import { Budgets } from './pages/Budgets';
import { Entry } from './pages/Entry';
import { Menu } from './pages/Menu';
import { Overview } from './pages/Overview';
import { Transactions } from './pages/Transactions';
import type { TabKey } from './types';
import { currentMonthKey } from './lib/format';

const loadList = (key: string, fallback: string[]) => {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as string[]) : null;
    return parsed?.length ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedMonth, setSelectedMonth] = useState(() => window.localStorage.getItem('be-bong-current-month') || currentMonthKey());
  const [members, setMembers] = useState(() => loadList('be-bong-members', ['Chồng', 'Vợ']));
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { toast, showToast } = useToast();
  const data = useFinanceData(selectedMonth);

  const handleSetSelectedMonth = (month: string) => {
    setSelectedMonth(month);
    window.localStorage.setItem('be-bong-current-month', month);
  };

  const handleSetMembers = (nextMembers: string[]) => {
    const cleanMembers = nextMembers.map((member) => member.trim()).filter(Boolean).slice(0, 2);
    const finalMembers = cleanMembers.length ? cleanMembers : ['Chồng', 'Vợ'];
    setMembers(finalMembers);
    window.localStorage.setItem('be-bong-members', JSON.stringify(finalMembers));
  };

  const pageTitle: Record<TabKey, string> = {
    overview: 'Tổng quan',
    entry: 'Ghi chi tiêu',
    transactions: 'Giao dịch',
    budgets: 'Ngân sách',
    menu: 'Menu',
  };

  const handleSaveTransaction = async (input: Parameters<typeof data.addTransaction>[0]) => {
    await data.addTransaction(input);
    showToast('Đã lưu giao dịch');
    setActiveTab('overview');
  };

  const handleUpdateTransaction = async (id: string, input: Parameters<typeof data.updateTransaction>[1]) => {
    await data.updateTransaction(id, input);
    showToast('Đã cập nhật giao dịch');
  };

  const handleDeleteTransaction = async (id: string) => {
    await data.deleteTransaction(id);
    showToast('Đã xóa giao dịch');
  };

  const handleSaveBudget = async (input: Parameters<typeof data.upsertBudget>[0]) => {
    await data.upsertBudget(input);
    showToast('Đã lưu ngân sách');
  };

  const handleAddCategory = async (input: Parameters<typeof data.addCategory>[0]) => {
    await data.addCategory(input);
    showToast('Đã thêm danh mục');
  };

  const handleAddWallet = async (input: Parameters<typeof data.addWallet>[0]) => {
    await data.addWallet(input);
    showToast('Đã thêm ví tiền');
  };

  const handleHardReset = async () => {
    setResetting(true);
    try {
      await data.hardReset();
      showToast('Đã reset toàn bộ dữ liệu');
      setResetOpen(false);
      setActiveTab('overview');
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_88%_14%,rgba(255,229,132,.46),transparent_28%),radial-gradient(circle_at_18%_74%,rgba(180,108,0,.24),transparent_30%),linear-gradient(180deg,#f5c242_0%,#f5c242_8%,#f6cf5b_30%,#dda12a_74%,#f4c849_100%)] text-ink">
      <div className="mx-auto min-h-screen max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+108px)] pt-[calc(env(safe-area-inset-top)+18px)]">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink/70">Bé Bông</p>
            <h1 className="text-[28px] font-semibold tracking-normal text-ink">{pageTitle[activeTab]}</h1>
          </div>
          {activeTab === 'overview' ? (
            <img
              src="/couple-photo.jpg"
              alt=""
              aria-hidden="true"
              className="h-14 w-14 rounded-[20px] border border-white/70 object-cover shadow-soft"
            />
          ) : (
            <div className="h-12 w-12" />
          )}
        </header>

        {data.error && (
          <div className="glass mb-4 rounded-3xl px-4 py-3 text-sm font-medium text-ink/78">
            {data.error}
          </div>
        )}

        {data.loading ? (
          <LoadingCards />
        ) : (
          <>
            {activeTab === 'overview' && <Overview summary={data.summary} categories={data.categories} transactions={data.transactions} month={selectedMonth} />}
            {activeTab === 'entry' && <Entry categories={data.categories} wallets={data.wallets} members={members} onSave={handleSaveTransaction} />}
            {activeTab === 'transactions' && (
              <Transactions
                transactions={data.transactions}
                categories={data.categories}
                wallets={data.wallets}
                members={members}
                selectedMonth={selectedMonth}
                onUpdate={handleUpdateTransaction}
                onDelete={handleDeleteTransaction}
              />
            )}
            {activeTab === 'budgets' && <Budgets budgets={data.budgets} categories={data.categories} transactions={data.transactions} selectedMonth={selectedMonth} onSave={handleSaveBudget} />}
            {activeTab === 'menu' && (
              <Menu
                categories={data.categories}
                wallets={data.wallets}
                transactions={data.transactions}
                members={members}
                selectedMonth={selectedMonth}
                onMembersChange={handleSetMembers}
                onMonthChange={handleSetSelectedMonth}
                onAddCategory={handleAddCategory}
                onAddWallet={handleAddWallet}
                onResetCategories={data.resetCategories}
                onDeleteWallet={data.deleteWallet}
                onRefresh={data.refresh}
                onOpenReset={() => setResetOpen(true)}
              />
            )}
          </>
        )}
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <Toast toast={toast} />

      {resetOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/28 px-5 backdrop-blur-md">
          <div className="glass-strong w-full max-w-sm rounded-[32px] p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-rose-50 text-rose-600">
                <AlertTriangle size={24} />
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white/65 text-ink"
                onClick={() => setResetOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-ink">Reset toàn bộ dữ liệu?</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-ink/70">
              Thao tác này sẽ xóa toàn bộ giao dịch, ngân sách, danh mục và ví tiền hiện tại. Danh mục mặc định sẽ được tạo lại theo danh sách mới.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="min-h-12 rounded-2xl bg-white/70 px-4 font-semibold text-ink transition active:scale-[0.98]"
                onClick={() => setResetOpen(false)}
                disabled={resetting}
              >
                Không
              </button>
              <button
                className="min-h-12 rounded-2xl bg-rose-600 px-4 font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
                onClick={handleHardReset}
                disabled={resetting}
              >
                {resetting ? 'Đang xóa...' : 'Đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function LoadingCards() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <GlassCard key={item} className="h-32 animate-pulse p-5">
          <div className="h-5 w-28 rounded-full bg-white/45" />
          <div className="mt-5 h-8 w-44 rounded-full bg-white/45" />
        </GlassCard>
      ))}
    </div>
  );
}
