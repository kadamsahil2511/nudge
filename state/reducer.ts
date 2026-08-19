import { actual, assertMinorUnits, available, planned } from '@/domain/money';
import { BudgetAllocation, BudgetState, MonthlyBudget } from '@/domain/types';
export type Action =
  | { type: 'SET_MONTH'; month: string }
  | { type: 'SELECT_DATE'; date: string }
  | { type: 'SET_FUNDS'; month: string; funds: number; savings: number }
  | { type: 'ADD_ALLOCATION'; month: string; allocation: BudgetAllocation }
  | { type: 'EDIT_ALLOCATION'; month: string; allocation: BudgetAllocation }
  | { type: 'DELETE_ALLOCATION'; month: string; id: string }
  | { type: 'MOVE_ALLOCATION'; month: string; id: string; date: string }
  | {
      type: 'ADD_ACTUAL';
      month: string;
      actual: { id: string; allocationId?: string; date: string; amount: number; note?: string };
    }
  | { type: 'RETURN_UNDERSPEND'; month: string; allocationId: string }
  | { type: 'CARRY_FORWARD'; month: string; allocationId: string }
  | { type: 'GENERATE_RECURRING'; fromMonth: string; toMonth: string }
  | { type: 'UNDO' };
const empty = (month: string): MonthlyBudget => ({
  month,
  funds: 0,
  savings: 0,
  allocations: [],
  actuals: [],
});
const snapshot = (s: BudgetState, label: string): BudgetState => ({
  ...s,
  undo: { label, before: structuredClone(s.budgets), createdAt: Date.now() },
});
const update = (s: BudgetState, month: string, fn: (b: MonthlyBudget) => MonthlyBudget) => ({
  ...s,
  budgets: { ...s.budgets, [month]: fn(s.budgets[month] ?? empty(month)) },
});
export function budgetReducer(state: BudgetState, action: Action): BudgetState {
  if (action.type === 'SET_MONTH') return { ...state, activeMonth: action.month };
  if (action.type === 'SELECT_DATE') return { ...state, selectedDate: action.date };
  if (action.type === 'UNDO')
    return state.undo ? { ...state, budgets: state.undo.before, undo: undefined } : state;
  if (action.type === 'SET_FUNDS') {
    assertMinorUnits(action.funds);
    assertMinorUnits(action.savings);
    if (action.savings > action.funds) throw Error('Savings cannot exceed monthly money.');
    return update(snapshot(state, 'Monthly budget updated'), action.month, (b) => ({
      ...b,
      funds: action.funds,
      savings: action.savings,
    }));
  }
  if (action.type === 'ADD_ALLOCATION') {
    assertMinorUnits(action.allocation.amount);
    const b = state.budgets[action.month] ?? empty(action.month);
    if (action.allocation.amount > available(b))
      throw Error(
        'This allocation is more than your available money. Reduce the amount or edit your monthly budget.',
      );
    return update(snapshot(state, 'Allocation added'), action.month, (x) => ({
      ...x,
      allocations: [...x.allocations, action.allocation],
    }));
  }
  if (action.type === 'EDIT_ALLOCATION') {
    const b = state.budgets[action.month] ?? empty(action.month),
      old = b.allocations.find((a) => a.id === action.allocation.id);
    if (!old) return state;
    if (action.allocation.amount - old.amount > available(b))
      throw Error(
        'This allocation is more than your available money. Reduce the amount or edit your monthly budget.',
      );
    return update(snapshot(state, 'Allocation edited'), action.month, (x) => ({
      ...x,
      allocations: x.allocations.map((a) =>
        a.id === action.allocation.id ? action.allocation : a,
      ),
    }));
  }
  if (action.type === 'DELETE_ALLOCATION')
    return update(snapshot(state, 'Allocation deleted'), action.month, (b) => ({
      ...b,
      allocations: b.allocations.filter((a) => a.id !== action.id),
    }));
  if (action.type === 'MOVE_ALLOCATION')
    return update(snapshot(state, 'Allocation moved'), action.month, (b) => ({
      ...b,
      allocations: b.allocations.map((a) => (a.id === action.id ? { ...a, date: action.date } : a)),
    }));
  if (action.type === 'ADD_ACTUAL') {
    assertMinorUnits(action.actual.amount);
    return update(snapshot(state, 'Actual spending recorded'), action.month, (b) => ({
      ...b,
      actuals: [...b.actuals, action.actual],
    }));
  }
  if (action.type === 'RETURN_UNDERSPEND')
    return update(snapshot(state, 'Underspend returned'), action.month, (b) => {
      const a = b.allocations.find((x) => x.id === action.allocationId);
      if (!a) return b;
      const spent = b.actuals
        .filter((x) => x.allocationId === a.id)
        .reduce((s, x) => s + x.amount, 0);
      return {
        ...b,
        allocations: b.allocations.map((x) =>
          x.id === a.id ? { ...x, amount: Math.min(x.amount, spent) } : x,
        ),
      };
    });
  if (action.type === 'CARRY_FORWARD') {
    const b = state.budgets[action.month] ?? empty(action.month),
      a = b.allocations.find((x) => x.id === action.allocationId);
    if (!a) return state;
    const spent = b.actuals
        .filter((x) => x.allocationId === a.id)
        .reduce((s, x) => s + x.amount, 0),
      carry = Math.max(0, a.amount - spent);
    const d = new Date(`${action.month}-15T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + 1);
    const next = d.toISOString().slice(0, 7);
    let s = budgetReducer(state, {
      type: 'RETURN_UNDERSPEND',
      month: action.month,
      allocationId: a.id,
    });
    return update(s, next, (n) => ({ ...n, funds: n.funds + carry }));
  }
  if (action.type === 'GENERATE_RECURRING') {
    const src = state.budgets[action.fromMonth] ?? empty(action.fromMonth);
    return update(state, action.toMonth, (b) => ({
      ...b,
      allocations: [
        ...b.allocations,
        ...src.allocations
          .filter(
            (a) =>
              a.recurringRuleId &&
              !b.allocations.some(
                (x) => x.recurringRuleId === a.recurringRuleId && x.generatedFor === action.toMonth,
              ),
          )
          .map((a) => ({
            ...a,
            id: crypto.randomUUID(),
            date: `${action.toMonth}-${a.date.slice(8)}`,
            generatedFor: action.toMonth,
          })),
      ],
    }));
  }
  return state;
}
export const totals = (b: MonthlyBudget) => ({
  planned: planned(b),
  actual: actual(b),
  available: available(b),
  projected: b.funds - b.savings - actual(b),
});
