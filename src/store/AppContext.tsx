import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Transaction, Category, CurrencyCode } from '@/types';
import type { AppState, AppAction } from './types';
import { categories as mockCategories, transactions as mockTransactions } from '@/data/mocks';

function generateId(): string {
  return 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

function generateCategoryId(): string {
  return 'cat_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

const initialState: AppState = {
  transactions: [...mockTransactions],
  categories: [...mockCategories],
  defaultCurrency: 'RUB',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [{ ...action.payload, id: generateId() }, ...state.transactions],
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case 'UNDO_DELETE_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, { ...action.payload, id: generateCategoryId() }],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };

    case 'DELETE_CATEGORY': {
      const catToDelete = state.categories.find((c) => c.id === action.payload);
      if (!catToDelete) return state;
      const sameTypeCats = state.categories.filter(
        (c) => c.type === catToDelete.type && c.id !== action.payload,
      );
      if (sameTypeCats.length === 0) return state;
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
    }

    case 'SET_DEFAULT_CURRENCY':
      return { ...state, defaultCurrency: action.payload };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => Transaction | undefined;
  undoDeleteTransaction: (tx: Transaction) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => boolean;
  setDefaultCurrency: (currency: CurrencyCode) => void;
  getCategoryById: (id: string) => Category | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: tx });
  }, []);

  const updateTransaction = useCallback((tx: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: tx });
  }, []);

  const deleteTransaction = useCallback(
    (id: string): Transaction | undefined => {
      const tx = state.transactions.find((t) => t.id === id);
      if (tx) dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      return tx;
    },
    [state.transactions],
  );

  const undoDeleteTransaction = useCallback((tx: Transaction) => {
    dispatch({ type: 'UNDO_DELETE_TRANSACTION', payload: tx });
  }, []);

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    dispatch({ type: 'ADD_CATEGORY', payload: cat });
  }, []);

  const updateCategory = useCallback((cat: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: cat });
  }, []);

  const deleteCategory = useCallback(
    (id: string): boolean => {
      const cat = state.categories.find((c) => c.id === id);
      if (!cat) return false;
      const sameType = state.categories.filter((c) => c.type === cat.type && c.id !== id);
      if (sameType.length === 0) return false;
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
      return true;
    },
    [state.categories],
  );

  const setDefaultCurrency = useCallback((currency: CurrencyCode) => {
    dispatch({ type: 'SET_DEFAULT_CURRENCY', payload: currency });
  }, []);

  const getCategoryById = useCallback(
    (id: string) => state.categories.find((c) => c.id === id),
    [state.categories],
  );

  return (
    <AppContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        undoDeleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        setDefaultCurrency,
        getCategoryById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
