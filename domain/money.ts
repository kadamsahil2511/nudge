import { MonthlyBudget, MinorUnits } from './types';
export const assertMinorUnits = (value: number): MinorUnits => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error('Money must be a non-negative integer in minor units.');
  return value;
};
export const planned = (b: MonthlyBudget) => b.allocations.reduce((sum, a) => sum + a.amount, 0);
export const actual = (b: MonthlyBudget) => b.actuals.reduce((sum, a) => sum + a.amount, 0);
export const available = (b: MonthlyBudget) => b.funds - b.savings - planned(b);
export const formatMoney = (paise: MinorUnits) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
