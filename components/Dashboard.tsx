'use client';
import { useEffect, useState } from 'react';
import { useBudget } from '@/state/BudgetContext';
import { totals } from '@/state/reducer';
import { MonthlyBudget, BudgetAllocation } from '@/domain/types';
import { formatMoney } from '@/domain/money';
import { BudgetCalendar } from './BudgetCalendar';
import { DailyBudgetDrawer, AddExpenseModal } from './DailyBudgetDrawer';
import { MoneyPool, MonthProjection } from './Controls';
const empty = (month: string): MonthlyBudget => ({
  month,
  funds: 0,
  savings: 0,
  allocations: [],
  actuals: [],
});
export function MonthlyBudgetHeader({
  month,
  onChange,
}: {
  month: string;
  onChange: (m: string) => void;
}) {
  const d = new Date(month + '-15T12:00:00Z'),
    shift = (n: number) => {
      const x = new Date(d);
      x.setUTCMonth(x.getUTCMonth() + n);
      onChange(x.toISOString().slice(0, 7));
    };
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-moss">NUDGE</p>
        <h1 className="text-2xl font-black sm:text-3xl">Monthly plan</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Previous month"
          className="rounded-xl border bg-white px-3"
          onClick={() => shift(-1)}
        >
          ←
        </button>
        <strong className="min-w-28 text-center">
          {d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </strong>
        <button
          aria-label="Next month"
          className="rounded-xl border bg-white px-3"
          onClick={() => shift(1)}
        >
          →
        </button>
      </div>
    </header>
  );
}
function Onboarding({
  month,
  onDone,
}: {
  month: string;
  onDone: (funds: number, savings: number, fixed?: BudgetAllocation) => void;
}) {
  const [money, setMoney] = useState(''),
    [savings, setSavings] = useState(''),
    [fixed, setFixed] = useState(''),
    [name, setName] = useState('');
  return (
    <main className="mx-auto grid min-h-screen max-w-lg place-items-center p-5">
      <form
        className="w-full rounded-3xl bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          onDone(
            Math.round(+money * 100),
            Math.round((+savings || 0) * 100),
            fixed && name
              ? {
                  id: crypto.randomUUID(),
                  date: `${month}-01`,
                  amount: Math.round(+fixed * 100),
                  category: 'Home',
                  description: name,
                  kind: 'fixed',
                }
              : undefined,
          );
        }}
      >
        <p className="font-bold text-moss">Welcome to Nudge</p>
        <h1 className="mt-2 text-3xl font-black">Give every rupee a day.</h1>
        <p className="mt-2 text-stone-500">
          Start with what you can spend this month. You can change it anytime.
        </p>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1 font-semibold">
            Monthly money (₹)
            <input
              autoFocus
              required
              min="1"
              type="number"
              className="rounded-xl border px-3"
              value={money}
              onChange={(e) => setMoney(e.target.value)}
            />
          </label>
          <label className="grid gap-1 font-semibold">
            Savings to reserve (optional)
            <input
              min="0"
              type="number"
              className="rounded-xl border px-3"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
            />
          </label>
          <fieldset className="rounded-xl border p-3">
            <legend className="px-1 text-sm font-semibold">Add a fixed expense (optional)</legend>
            <input
              aria-label="Fixed expense name"
              placeholder="e.g. Rent"
              className="mb-2 w-full rounded-lg border px-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              aria-label="Fixed expense amount"
              placeholder="Amount ₹"
              min="0"
              type="number"
              className="w-full rounded-lg border px-3"
              value={fixed}
              onChange={(e) => setFixed(e.target.value)}
            />
          </fieldset>
          <button className="rounded-xl bg-moss font-bold text-white">Open my calendar</button>
        </div>
      </form>
    </main>
  );
}
export function Dashboard() {
  const { state, dispatch } = useBudget(),
    month = state.activeMonth,
    b = state.budgets[month] ?? empty(month),
    t = totals(b),
    [modal, setModal] = useState(false),
    [editing, setEditing] = useState<BudgetAllocation>(),
    [error, setError] = useState('');
  useEffect(() => {
    if (state.undo) {
      const timer = setTimeout(() => {}, 6000);
      return () => clearTimeout(timer);
    }
  }, [state.undo]);
  const save = (a: BudgetAllocation) => {
    try {
      dispatch({ type: editing ? 'EDIT_ALLOCATION' : 'ADD_ALLOCATION', month, allocation: a });
      setModal(false);
      setEditing(undefined);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  if (!Object.values(state.budgets).some((x) => x.funds > 0))
    return (
      <Onboarding
        month={month}
        onDone={(funds, savings, fixed) => {
          dispatch({ type: 'SET_FUNDS', month, funds, savings });
          if (fixed) dispatch({ type: 'ADD_ALLOCATION', month, allocation: fixed });
          dispatch({ type: 'SELECT_DATE', date: `${month}-01` });
        }}
      />
    );
  return (
    <main className="mx-auto max-w-[1500px] p-3 sm:p-6">
      <MonthlyBudgetHeader
        month={month}
        onChange={(m) => dispatch({ type: 'SET_MONTH', month: m })}
      />
      <section className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-live="polite">
        <button
          onClick={() => {
            const v = prompt('Monthly budget (₹)', String(b.funds / 100));
            if (v)
              dispatch({
                type: 'SET_FUNDS',
                month,
                funds: Math.round(+v * 100),
                savings: b.savings,
              });
          }}
          className="rounded-xl border bg-white p-3 text-left"
        >
          <p className="text-xs text-stone-500">Monthly budget · Edit</p>
          <strong>{formatMoney(b.funds)}</strong>
        </button>
        {[
          ['Planned', t.planned],
          ['Actual', t.actual],
          ['Reserved savings', b.savings],
        ].map(([x, n]) => (
          <div key={x as string} className="rounded-xl border bg-white p-3">
            <p className="text-xs text-stone-500">{x}</p>
            <strong>{formatMoney(n as number)}</strong>
          </div>
        ))}
        <MonthProjection projected={t.projected} />
      </section>
      <div className="mb-5">
        <div className="mb-1 flex justify-between text-xs">
          <span>Planned from spendable money</span>
          <span>
            {b.funds - b.savings ? Math.round((t.planned / (b.funds - b.savings)) * 100) : 0}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-stone-200">
          <div
            className="h-full bg-moss"
            style={{
              width: `${Math.min(100, b.funds - b.savings ? (t.planned / (b.funds - b.savings)) * 100 : 0)}%`,
            }}
          />
        </div>
      </div>
      <MoneyPool
        available={t.available}
        onAllocate={() => {
          dispatch({ type: 'SELECT_DATE', date: state.selectedDate ?? `${month}-01` });
          setModal(true);
        }}
      />
      <p className="my-3 text-sm text-stone-500">
        Select a date to plan spending. Drag flexible expenses to another day.
      </p>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <BudgetCalendar
          month={month}
          allocations={b.allocations}
          selected={state.selectedDate}
          onSelect={(date) => dispatch({ type: 'SELECT_DATE', date })}
          onMove={(id, date) => {
            const a = b.allocations.find((x) => x.id === id);
            if (a?.kind === 'fixed') {
              setError('Fixed allocations must be explicitly unlocked before moving.');
              return;
            }
            dispatch({ type: 'MOVE_ALLOCATION', month, id, date });
          }}
        />
        {state.selectedDate && (
          <DailyBudgetDrawer
            date={state.selectedDate}
            items={b.allocations.filter((a) => a.date === state.selectedDate)}
            onClose={() => dispatch({ type: 'SELECT_DATE', date: '' })}
            onAdd={() => setModal(true)}
            onEdit={(a) => {
              setEditing(a);
              setModal(true);
            }}
            onDelete={(id) => dispatch({ type: 'DELETE_ALLOCATION', month, id })}
            onMove={(id, date) => dispatch({ type: 'MOVE_ALLOCATION', month, id, date })}
            onActual={(a, amount) =>
              dispatch({
                type: 'ADD_ACTUAL',
                month,
                actual: { id: crypto.randomUUID(), allocationId: a.id, date: a.date, amount },
              })
            }
          />
        )}
      </div>
      <AddExpenseModal
        key={editing?.id ?? String(modal)}
        open={modal}
        date={state.selectedDate ?? `${month}-01`}
        max={t.available + (editing?.amount ?? 0)}
        initial={editing}
        onClose={() => {
          setModal(false);
          setEditing(undefined);
        }}
        onSave={save}
      />
      {error && (
        <div
          role="alert"
          className="fixed bottom-24 left-1/2 z-[60] w-[90%] max-w-md -translate-x-1/2 rounded-xl bg-red-900 p-4 text-sm text-white"
        >
          {error}
          <button
            className="ml-3 underline"
            onClick={() => {
              const v = prompt('New monthly budget (₹)');
              if (v) dispatch({ type: 'SET_FUNDS', month, funds: +v * 100, savings: b.savings });
            }}
          >
            Edit monthly budget
          </button>
        </div>
      )}
      {state.undo && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-5 rounded-xl bg-ink px-4 text-sm text-white shadow-xl"
        >
          <span>{state.undo.label}</span>
          <button className="font-bold text-green-300" onClick={() => dispatch({ type: 'UNDO' })}>
            Undo
          </button>
        </div>
      )}
    </main>
  );
}
