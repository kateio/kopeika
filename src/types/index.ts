export type CurrencyCode = 'RUB' | 'USD';

export interface Money {
  value: number;
  currency: CurrencyCode;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  date: string; // ISO date string YYYY-MM-DD
  comment: string;
  type: 'expense' | 'income';
}

// Для экрана Start (выбор категорий)
export interface CategoryToggle extends Category {
  enabled: boolean;
}

// Props для экранов
export interface StartScreenProps {
  categories: CategoryToggle[];
  onToggleCategory: (id: string) => void;
  onAddCategory: (name: string) => void;
  onContinue: () => void;
}

export interface MainScreenProps {
  categories: Category[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onSelectCategory: (category: Category) => void;
}

export interface CategoryModalProps {
  category: Category;
  transactions: Transaction[];
  onClose: () => void;
}
