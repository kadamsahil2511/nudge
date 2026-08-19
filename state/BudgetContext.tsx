'use client';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { BudgetState } from '@/domain/types';
import { Action, budgetReducer } from './reducer';
const now = new Date().toISOString().slice(0, 7);
const initial: BudgetState = { budgets: {}, activeMonth: now };
const C = createContext<{ state: BudgetState; dispatch: React.Dispatch<Action> } | null>(null);
export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initial, (s) => {
    if (typeof window === 'undefined') return s;
    try {
      return JSON.parse(localStorage.getItem('nudge-budget') ?? 'null') ?? s;
    } catch {
      return s;
    }
  });
  useEffect(
    () => localStorage.setItem('nudge-budget', JSON.stringify({ ...state, undo: undefined })),
    [state],
  );
  return <C.Provider value={{ state, dispatch }}>{children}</C.Provider>;
}
export function useBudget() {
  const v = useContext(C);
  if (!v) throw Error('useBudget must be used inside BudgetProvider');
  return v;
}
