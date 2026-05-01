export type TransactionType = 'income' | 'expense';
export type MemberName = string;

export interface Profile {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  created_at?: string;
}

export interface Wallet {
  id: string;
  user_id?: string;
  name: string;
  balance: number;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  wallet_id: string | null;
  member_name: MemberName;
  note: string | null;
  transaction_date: string;
  created_at?: string;
  categories?: Category | null;
  wallets?: Wallet | null;
}

export interface Budget {
  id: string;
  user_id?: string;
  category_id: string;
  month: string;
  amount: number;
  created_at?: string;
  categories?: Category | null;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category_id: string;
  wallet_id: string;
  member_name: MemberName;
  note: string;
  transaction_date: string;
}

export interface BudgetInput {
  category_id: string;
  month: string;
  amount: number;
}

export type TabKey = 'overview' | 'entry' | 'transactions' | 'budgets' | 'menu';
