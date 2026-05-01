import { TransactionForm } from '../components/TransactionForm';
import type { Category, TransactionInput, Wallet } from '../types';

interface EntryProps {
  categories: Category[];
  wallets: Wallet[];
  onSave: (input: TransactionInput) => Promise<void>;
}

export function Entry({ categories, wallets, onSave }: EntryProps) {
  return (
    <div className="page-enter space-y-4">
      <div>
        <p className="text-sm font-medium text-ink/70">Ghi chi tiêu</p>
        <h1 className="text-2xl font-semibold text-ink">Nhập nhanh hôm nay</h1>
      </div>
      <TransactionForm categories={categories} wallets={wallets} onSubmit={onSave} />
    </div>
  );
}
