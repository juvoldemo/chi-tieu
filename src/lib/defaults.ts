import type { Category, Wallet } from '../types';

export const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Ăn uống', type: 'expense', icon: 'Utensils', color: '#b77905' },
  { name: 'Hóa đơn', type: 'expense', icon: 'ReceiptText', color: '#a97820' },
  { name: 'Đi chợ', type: 'expense', icon: 'ShoppingBasket', color: '#d89614' },
  { name: 'Siêu thị', type: 'expense', icon: 'Store', color: '#d39a21' },
  { name: 'Cafe', type: 'expense', icon: 'Coffee', color: '#b9811c' },
  { name: 'Ăn vặt', type: 'expense', icon: 'Cookie', color: '#e7ad2f' },
  { name: 'Mua sắm', type: 'expense', icon: 'ShoppingBag', color: '#d39a21' },
  { name: 'Hiếu hỷ', type: 'expense', icon: 'Gift', color: '#c8941e' },
  { name: 'Xăng xe', type: 'expense', icon: 'Fuel', color: '#d47a16' },
  { name: 'Y tế', type: 'expense', icon: 'HeartPulse', color: '#c8752c' },
];

export const defaultWallets: Omit<Wallet, 'id'>[] = [
  { name: 'Tiền mặt', balance: 0 },
  { name: 'Ngân hàng', balance: 0 },
  { name: 'Momo', balance: 0 },
  { name: 'Khác', balance: 0 },
];
