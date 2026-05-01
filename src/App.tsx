import { useState } from 'react';
import { Plus } from 'lucide-react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { toast, showToast } = useToast();
  const data = useFinanceData();

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_88%_14%,rgba(255,229,132,.46),transparent_28%),radial-gradient(circle_at_18%_74%,rgba(180,108,0,.24),transparent_30%),linear-gradient(180deg,#f5c242_0%,#f5c242_8%,#f6cf5b_30%,#dda12a_74%,#f4c849_100%)] text-ink">
      <div className="mx-auto min-h-screen max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+108px)] pt-[calc(env(safe-area-inset-top)+18px)]">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink/70">Bé Bông</p>
            <h1 className="text-[28px] font-semibold tracking-normal text-ink">{pageTitle[activeTab]}</h1>
          </div>
          <button
            className="grid h-12 w-12 place-items-center rounded-[20px] bg-white/45 text-lagoon shadow-soft backdrop-blur transition active:scale-95"
            onClick={() => data.refresh()}
            aria-label="Tải lại dữ liệu"
          >
            <span className="text-lg font-semibold">↻</span>
          </button>
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
            {activeTab === 'overview' && <Overview summary={data.summary} categories={data.categories} transactions={data.transactions} />}
            {activeTab === 'entry' && <Entry categories={data.categories} wallets={data.wallets} onSave={handleSaveTransaction} />}
            {activeTab === 'transactions' && (
              <Transactions
                transactions={data.transactions}
                categories={data.categories}
                wallets={data.wallets}
                onUpdate={handleUpdateTransaction}
                onDelete={handleDeleteTransaction}
              />
            )}
            {activeTab === 'budgets' && <Budgets budgets={data.budgets} categories={data.categories} transactions={data.transactions} onSave={handleSaveBudget} />}
            {activeTab === 'menu' && (
              <Menu
                categories={data.categories}
                wallets={data.wallets}
                transactions={data.transactions}
                onAddCategory={handleAddCategory}
                onAddWallet={handleAddWallet}
              />
            )}
          </>
        )}
      </div>

      {activeTab !== 'entry' && (
        <button
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] right-5 z-30 grid h-16 w-16 place-items-center rounded-[26px] bg-gradient-to-br from-lagoon to-aqua text-white shadow-[0_18px_42px_rgba(132,84,10,.40)] transition active:scale-95"
          onClick={() => setActiveTab('entry')}
          aria-label="Thêm giao dịch"
        >
          <Plus size={30} />
        </button>
      )}

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <Toast toast={toast} />
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
