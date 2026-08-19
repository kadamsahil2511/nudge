import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BudgetCalendar } from '@/components/BudgetCalendar';
describe('allocation calendar flow', () => {
  it('selects a date and exposes planned allocation', () => {
    const select = vi.fn();
    render(
      <BudgetCalendar
        month="2026-08"
        selected="2026-08-20"
        onSelect={select}
        onMove={vi.fn()}
        allocations={[
          {
            id: 'a',
            date: '2026-08-20',
            amount: 50000,
            category: 'Food',
            description: 'Groceries',
            kind: 'flexible',
          },
        ]}
      />,
    );
    expect(screen.getByText('Groceries')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /August 21/ }));
    expect(select).toHaveBeenCalledWith('2026-08-21');
  });
});
