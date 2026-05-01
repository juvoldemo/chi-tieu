import type { Category, Wallet } from '../types';

export const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Ăn uống', type: 'expense', icon: 'Utensils', color: '#005BAA' },
  { name: 'Hóa đơn', type: 'expense', icon: 'ReceiptText', color: '#5856D6' },
  { name: 'Đi chợ', type: 'expense', icon: 'ShoppingBasket', color: '#34C759' },
  { name: 'Siêu thị', type: 'expense', icon: 'Store', color: '#00A3E0' },
  { name: 'Cafe', type: 'expense', icon: 'Coffee', color: '#8E8E93' },
  { name: 'Ăn vặt', type: 'expense', icon: 'Cookie', color: '#FF9500' },
  { name: 'Mua sắm', type: 'expense', icon: 'ShoppingBag', color: '#AF52DE' },
  { name: 'Hiếu hỷ', type: 'expense', icon: 'Gift', color: '#FF2D55' },
  { name: 'Xăng xe', type: 'expense', icon: 'Fuel', color: '#FF3B30' },
  { name: 'Y tế', type: 'expense', icon: 'HeartPulse', color: '#FF2D55' },
  { name: 'Lương', type: 'income', icon: 'WalletCards', color: '#34C759' },
  { name: 'Thưởng', type: 'income', icon: 'BadgeDollarSign', color: '#005BAA' },
  { name: 'Trúng vietlot', type: 'income', icon: 'TicketCheck', color: '#AF52DE' },
];

export const defaultWallets: Omit<Wallet, 'id'>[] = [
  { name: 'Tiền mặt', balance: 0 },
  { name: 'Ngân hàng', balance: 0 },
  { name: 'Momo', balance: 0 },
  { name: 'Khác', balance: 0 },
];
