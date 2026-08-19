import { describe, expect, it } from 'vitest';
import { budgetReducer, totals } from '@/state/reducer';
import { BudgetState } from '@/domain/types';
const state: BudgetState = {
  activeMonth: '2026-08',
  budgets: {
    '2026-08': { month: '2026-08', funds: 100000, savings: 10000, allocations: [], actuals: [] },
  },
};
const allocation = {
  id: 'a',
  date: '2026-08-20',
  amount: 30000,
  category: 'Food' as const,
  description: 'Groceries',
  kind: 'flexible' as const,
};
describe('budgetReducer monetary invariants', () => {
  it('allocates only integer available money', () => {
    const next = budgetReducer(state, { type: 'ADD_ALLOCATION', month: '2026-08', allocation });
    expect(totals(next.budgets['2026-08']).available).toBe(60000);
  });
  it('rejects over-allocation with guidance', () =>
    expect(() =>
      budgetReducer(state, {
        type: 'ADD_ALLOCATION',
        month: '2026-08',
        allocation: { ...allocation, amount: 90001 },
      }),
    ).toThrow(
      'This allocation is more than your available money. Reduce the amount or edit your monthly budget.',
    ));
  it('moves and atomically undoes', () => {
    const added = budgetReducer(state, { type: 'ADD_ALLOCATION', month: '2026-08', allocation });
    const moved = budgetReducer(added, {
      type: 'MOVE_ALLOCATION',
      month: '2026-08',
      id: 'a',
      date: '2026-08-25',
    });
    const undone = budgetReducer(moved, { type: 'UNDO' });
    expect(undone.budgets['2026-08'].allocations[0].date).toBe('2026-08-20');
    expect(totals(undone.budgets['2026-08'])).toEqual(totals(added.budgets['2026-08']));
  });
  it('generates recurring records idempotently', () => {
    const recurring = { ...allocation, recurringRuleId: 'r' };
    const withOne = {
      ...state,
      budgets: { '2026-08': { ...state.budgets['2026-08'], allocations: [recurring] } },
    };
    const once = budgetReducer(withOne, {
      type: 'GENERATE_RECURRING',
      fromMonth: '2026-08',
      toMonth: '2026-09',
    });
    const twice = budgetReducer(once, {
      type: 'GENERATE_RECURRING',
      fromMonth: '2026-08',
      toMonth: '2026-09',
    });
    expect(twice.budgets['2026-09'].allocations).toHaveLength(1);
  });
});
