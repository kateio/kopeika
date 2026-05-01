import type { Transaction, Category, CurrencyCode } from '@/types';

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  defaultCurrency: CurrencyCode;
}

export type AppAction =
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UNDO_DELETE_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_DEFAULT_CURRENCY'; payload: CurrencyCode };
