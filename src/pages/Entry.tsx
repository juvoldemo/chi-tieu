import { TransactionForm } from '../components/TransactionForm';
import type { Category, TransactionInput, Wallet } from '../types';

interface EntryProps {
  categories: Category[];
  wallets: Wallet[];
  members: string[];
  onSave: (input: TransactionInput) => Promise<void>;
}

export function Entry({ categories, wallets, members, onSave }: EntryProps) {
  return (
    <div className="page-enter space-y-4">
      <TransactionForm categories={categories} wallets={wallets} members={members} onSubmit={onSave} />
    </div>
  );
}
