import type { Category, Wallet } from '../types';

export const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Ăn uống', type: 'expense', icon: 'Utensils', color: '#d89614' },
  { name: 'Đi chợ', type: 'expense', icon: 'ShoppingBasket', color: '#e7ad2f' },
  { name: 'Cafe', type: 'expense', icon: 'Coffee', color: '#b9811c' },
  { name: 'Xăng xe', type: 'expense', icon: 'Fuel', color: '#d47a16' },
  { name: 'Nhà cửa', type: 'expense', icon: 'Home', color: '#c99a2e' },
  { name: 'Con cái', type: 'expense', icon: 'Baby', color: '#efb84c' },
  { name: 'Y tế', type: 'expense', icon: 'HeartPulse', color: '#c8752c' },
  { name: 'Giải trí', type: 'expense', icon: 'Gamepad2', color: '#b88a22' },
  { name: 'Mua sắm', type: 'expense', icon: 'ShoppingBag', color: '#d39a21' },
  { name: 'Du lịch', type: 'expense', icon: 'Plane', color: '#e2a934' },
  { name: 'Hóa đơn', type: 'expense', icon: 'ReceiptText', color: '#a97820' },
  { name: 'Khác', type: 'expense', icon: 'CircleEllipsis', color: '#bb8b24' },
  { name: 'Lương', type: 'income', icon: 'WalletCards', color: '#c8941e' },
  { name: 'Thưởng', type: 'income', icon: 'Sparkles', color: '#d89614' },
  { name: 'Thu nhập khác', type: 'income', icon: 'BadgePlus', color: '#e0a72a' },
];

export const defaultWallets: Omit<Wallet, 'id'>[] = [
  { name: 'Tiền mặt', balance: 0 },
  { name: 'Ngân hàng', balance: 0 },
  { name: 'Momo', balance: 0 },
  { name: 'Khác', balance: 0 },
];
