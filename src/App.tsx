import { useEffect, useState } from 'react';
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
import type { Anniversary, TabKey } from './types';
import { currentMonthKey } from './lib/format';

const defaultAnniversaries: Anniversary[] = [
  { id: 'birthday-be-bong', name: 'Sinh nhật Bé Bông', shortName: 'Bé Bông', icon: 'birthday', day: 10, month: 4 },
  { id: 'birthday-anh-du', name: 'Sinh nhật anh Dũ', shortName: 'Anh Dũ', icon: 'birthday', day: 1, month: 7 },
  { id: 'love-anniversary', name: 'Kỷ niệm yêu nhau', shortName: 'Yêu nhau', icon: 'love', day: 21, month: 8 },
  { id: 'wedding-anniversary', name: 'Kỷ niệm ngày cưới', shortName: 'Ngày cưới', icon: 'wedding', day: 28, month: 9 },
];

const loadList = (key: string, fallback: string[]) => {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as string[]) : null;
    return parsed?.length ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const loadAnniversaries = () => {
  try {
    const raw = window.localStorage.getItem('be-bong-anniversaries');
    if (!raw) return defaultAnniversaries;
    const parsed = JSON.parse(raw) as Anniversary[];
    return Array.isArray(parsed) ? parsed : defaultAnniversaries;
  } catch {
    return defaultAnniversaries;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedMonth, setSelectedMonth] = useState(() => window.localStorage.getItem('be-bong-current-month') || currentMonthKey());
  const [members, setMembers] = useState(() => loadList('be-bong-members', ['Chồng', 'Vợ']));
  const [anniversaries, setAnniversaries] = useState(loadAnniversaries);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { toast, showToast } = useToast();
  const data = useFinanceData(selectedMonth);

  useEffect(() => {
    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
    };

    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('gesturestart', preventGestureZoom);
    document.addEventListener('gesturechange', preventGestureZoom);
    document.addEventListener('gestureend', preventGestureZoom);
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', preventGestureZoom);
      document.removeEventListener('gesturechange', preventGestureZoom);
      document.removeEventListener('gestureend', preventGestureZoom);
      document.removeEventListener('touchmove', preventPinchZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, []);

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

  const handleSetAnniversaries = (nextAnniversaries: Anniversary[]) => {
    setAnniversaries(nextAnniversaries);
    window.localStorage.setItem('be-bong-anniversaries', JSON.stringify(nextAnniversaries));
  };

  const pageTitle: Record<TabKey, string> = {
    overview: 'Tổng quan',
    entry: 'Ghi chi tiêu',
    transactions: 'Giao dịch',
    budgets: 'Ngân sách',
    menu: 'Menu',
  };

  const handleSaveTransaction = async (input: Parameters<typeof data.addTransaction>[0]) => {
    try {
      await data.addTransaction(input);
      const transactionMonth = input.transaction_date.slice(0, 7);
      if (transactionMonth) {
        handleSetSelectedMonth(transactionMonth);
      }
      showToast('Đã lưu giao dịch');
      setActiveTab('overview');
    } catch (err) {
      console.error('Unable to save transaction', err);
      showToast('Không lưu được giao dịch. Kiểm tra mạng/Supabase rồi thử lại.');
    }
  };

  const handleUpdateTransaction = async (id: string, input: Parameters<typeof data.updateTransaction>[1]) => {
    try {
      await data.updateTransaction(id, input);
      showToast('Đã cập nhật giao dịch');
    } catch (err) {
      console.error('Unable to update transaction', err);
      showToast('Không cập nhật được giao dịch.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await data.deleteTransaction(id);
      showToast('Đã xóa giao dịch');
    } catch (err) {
      console.error('Unable to delete transaction', err);
      showToast('Không xóa được giao dịch.');
    }
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_88%_10%,rgba(0,163,224,.22),transparent_28%),radial-gradient(circle_at_14%_78%,rgba(0,91,170,.13),transparent_30%),linear-gradient(180deg,#F9F9FB_0%,#F2F2F7_42%,#E5E5EA_100%)] text-ink">
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
            {activeTab === 'overview' && <Overview summary={data.summary} categories={data.categories} transactions={data.transactions} anniversaries={anniversaries} month={selectedMonth} />}
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
                wallets={data.wallets}
                transactions={data.transactions}
                members={members}
                anniversaries={anniversaries}
                selectedMonth={selectedMonth}
                onMembersChange={handleSetMembers}
                onAnniversariesChange={handleSetAnniversaries}
                onMonthChange={handleSetSelectedMonth}
                onAddCategory={handleAddCategory}
                onAddWallet={handleAddWallet}
                onDeleteWallet={data.deleteWallet}
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
