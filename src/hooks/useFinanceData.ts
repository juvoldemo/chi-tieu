import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultCategories, defaultWallets } from '../lib/defaults';
import { currentMonthKey, todayKey } from '../lib/format';
import { supabase } from '../lib/supabaseClient';
import type { Budget, BudgetInput, Category, Transaction, TransactionInput, Wallet } from '../types';

const LOCAL_KEY = 'chi-tieu-local-data';

interface LocalData {
  categories: Category[];
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
}

const slug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createDefaultLocalData = (): LocalData => ({
  categories: defaultCategories.map((item) => ({
    ...item,
    id: `cat-${item.type}-${slug(item.name)}`,
    created_at: new Date().toISOString(),
  })),
  wallets: defaultWallets.map((item) => ({
    ...item,
    id: `wallet-${slug(item.name)}`,
    created_at: new Date().toISOString(),
  })),
  transactions: [],
  budgets: [],
});

const loadLocalData = (): LocalData => {
  const fallback = createDefaultLocalData();
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return {
      categories: parsed.categories?.length ? parsed.categories : fallback.categories,
      wallets: parsed.wallets?.length ? parsed.wallets : fallback.wallets,
      transactions: parsed.transactions ?? [],
      budgets: parsed.budgets ?? [],
    };
  } catch {
    return fallback;
  }
};

const saveLocalData = (data: LocalData) => {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
};

const hydrateRelations = (data: LocalData): LocalData => ({
  ...data,
  transactions: data.transactions.map((item) => ({
    ...item,
    categories: data.categories.find((category) => category.id === item.category_id) ?? null,
    wallets: data.wallets.find((wallet) => wallet.id === item.wallet_id) ?? null,
  })),
  budgets: data.budgets.map((item) => ({
    ...item,
    categories: data.categories.find((category) => category.id === item.category_id) ?? null,
  })),
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const hasSupabaseEnv = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey !== 'your-anon-key',
);

export function useFinanceData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localMode, setLocalMode] = useState(false);

  const applyData = useCallback((data: LocalData) => {
    const hydrated = hydrateRelations(data);
    setCategories(hydrated.categories);
    setWallets(hydrated.wallets);
    setTransactions(hydrated.transactions);
    setBudgets(hydrated.budgets);
  }, []);

  const switchToLocal = useCallback(
    (message?: string) => {
      const local = loadLocalData();
      applyData(local);
      setLocalMode(true);
      setError(message ?? null);
      setLoading(false);
    },
    [applyData],
  );

  const seedDefaults = useCallback(async () => {
    const [{ count: categoryCount }, { count: walletCount }] = await Promise.all([
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('wallets').select('*', { count: 'exact', head: true }),
    ]);

    if (!categoryCount) {
      await supabase.from('categories').insert(defaultCategories);
    }
    if (!walletCount) {
      await supabase.from('wallets').insert(defaultWallets);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!hasSupabaseEnv) {
      switchToLocal('Chưa cấu hình Supabase. App đang lưu tạm trên máy này.');
      return;
    }

    try {
      await seedDefaults();
      const [categoryRes, walletRes, transactionRes, budgetRes] = await Promise.all([
        supabase.from('categories').select('*').order('type').order('name'),
        supabase.from('wallets').select('*').order('name'),
        supabase
          .from('transactions')
          .select('*, categories(*), wallets(*)')
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('budgets').select('*, categories(*)').order('month', { ascending: false }),
      ]);

      const firstError = categoryRes.error || walletRes.error || transactionRes.error || budgetRes.error;
      if (firstError) throw firstError;

      setCategories((categoryRes.data ?? []) as Category[]);
      setWallets((walletRes.data ?? []) as Wallet[]);
      setTransactions((transactionRes.data ?? []) as Transaction[]);
      setBudgets((budgetRes.data ?? []) as Budget[]);
      setLocalMode(false);
    } catch (err) {
      console.warn('Supabase unavailable, using local storage fallback.', err);
      switchToLocal('Đang lưu tạm trên máy này. Dữ liệu chưa đồng bộ lên cloud.');
    } finally {
      setLoading(false);
    }
  }, [seedDefaults, switchToLocal]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateLocal = (updater: (data: LocalData) => LocalData) => {
    const next = updater(loadLocalData());
    saveLocalData(next);
    applyData(next);
  };

  const addTransaction = async (input: TransactionInput) => {
    if (localMode) {
      updateLocal((data) => ({
        ...data,
        transactions: [
          {
            ...input,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          },
          ...data.transactions,
        ],
      }));
      return;
    }

    const { error: insertError } = await supabase.from('transactions').insert(input);
    if (insertError) throw insertError;
    await refresh();
  };

  const updateTransaction = async (id: string, input: TransactionInput) => {
    if (localMode) {
      updateLocal((data) => ({
        ...data,
        transactions: data.transactions.map((item) => (item.id === id ? { ...item, ...input } : item)),
      }));
      return;
    }

    const { error: updateError } = await supabase.from('transactions').update(input).eq('id', id);
    if (updateError) throw updateError;
    await refresh();
  };

  const deleteTransaction = async (id: string) => {
    if (localMode) {
      updateLocal((data) => ({
        ...data,
        transactions: data.transactions.filter((item) => item.id !== id),
      }));
      return;
    }

    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id);
    if (deleteError) throw deleteError;
    await refresh();
  };

  const upsertBudget = async (input: BudgetInput) => {
    if (localMode) {
      updateLocal((data) => {
        const existing = data.budgets.find((budget) => budget.category_id === input.category_id && budget.month === input.month);
        return {
          ...data,
          budgets: existing
            ? data.budgets.map((budget) => (budget.id === existing.id ? { ...budget, ...input } : budget))
            : [{ ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...data.budgets],
        };
      });
      return;
    }

    const existing = budgets.find((budget) => budget.category_id === input.category_id && budget.month === input.month);
    const query = existing ? supabase.from('budgets').update(input).eq('id', existing.id) : supabase.from('budgets').insert(input);
    const { error: budgetError } = await query;
    if (budgetError) throw budgetError;
    await refresh();
  };

  const addCategory = async (input: Pick<Category, 'name' | 'type' | 'icon' | 'color'>) => {
    if (localMode) {
      updateLocal((data) => ({
        ...data,
        categories: [{ ...input, id: `cat-${input.type}-${slug(input.name)}-${Date.now()}`, created_at: new Date().toISOString() }, ...data.categories],
      }));
      return;
    }

    const { error: categoryError } = await supabase.from('categories').insert(input);
    if (categoryError) throw categoryError;
    await refresh();
  };

  const addWallet = async (input: Pick<Wallet, 'name' | 'balance'>) => {
    if (localMode) {
      updateLocal((data) => ({
        ...data,
        wallets: [{ ...input, id: `wallet-${slug(input.name)}-${Date.now()}`, created_at: new Date().toISOString() }, ...data.wallets],
      }));
      return;
    }

    const { error: walletError } = await supabase.from('wallets').insert(input);
    if (walletError) throw walletError;
    await refresh();
  };

  const summary = useMemo(() => {
    const month = currentMonthKey();
    const monthTransactions = transactions.filter((item) => item.transaction_date.startsWith(month));
    const todayTransactions = transactions.filter((item) => item.transaction_date === todayKey());
    const income = monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
    const expense = monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
    const todayExpense = todayTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
    const byMember = monthTransactions
      .filter((item) => item.type === 'expense')
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.member_name] = (acc[item.member_name] ?? 0) + Number(item.amount);
        return acc;
      }, {});
    const biggerSpender = Object.entries(byMember).sort((a, b) => b[1] - a[1])[0];
    const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return {
      month,
      income,
      expense,
      balance: income - expense,
      savingRate,
      todayExpense,
      biggerSpender: biggerSpender ? { name: biggerSpender[0], amount: biggerSpender[1] } : null,
    };
  }, [transactions]);

  return {
    categories,
    wallets,
    transactions,
    budgets,
    loading,
    error,
    localMode,
    summary,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    upsertBudget,
    addCategory,
    addWallet,
  };
}
