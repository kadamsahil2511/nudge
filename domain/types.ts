export type MinorUnits = number;
export type Category = 'Home' | 'Food' | 'Travel' | 'Health' | 'Fun' | 'Other';
export interface RecurringRule {
  id: string;
  cadence: 'monthly';
  dayOfMonth: number;
  sourceAllocationId: string;
}
export interface BudgetAllocation {
  id: string;
  date: string;
  amount: MinorUnits;
  category: Category;
  description: string;
  kind: 'fixed' | 'flexible';
  note?: string;
  recurringRuleId?: string;
  generatedFor?: string;
}
export interface ActualExpense {
  id: string;
  allocationId?: string;
  date: string;
  amount: MinorUnits;
  note?: string;
}
export interface MonthlyBudget {
  month: string;
  funds: MinorUnits;
  savings: MinorUnits;
  allocations: BudgetAllocation[];
  actuals: ActualExpense[];
}
export interface BudgetState {
  budgets: Record<string, MonthlyBudget>;
  activeMonth: string;
  selectedDate?: string;
  undo?: UndoableAction;
}
export interface UndoableAction {
  label: string;
  before: Record<string, MonthlyBudget>;
  createdAt: number;
}
export interface User {
  id: string;
  email: string;
  createdAt: string;
}
