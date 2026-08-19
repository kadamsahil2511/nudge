'use client';
import { useEffect, useRef, useState } from 'react';
import { BudgetAllocation, Category } from '@/domain/types';
import { formatMoney } from '@/domain/money';
import { AllocationSlider, CategorySelector } from './Controls';
export function ExpenseCard({
  item,
  onEdit,
  onDelete,
  onMove,
  onActual,
}: {
  item: BudgetAllocation;
  onEdit: (a: BudgetAllocation) => void;
  onDelete: () => void;
  onMove: (d: string) => void;
  onActual: (n: number) => void;
}) {
  const [unlocked, setUnlocked] = useState(item.kind === 'flexible');
  return (
    <article className="rounded-xl border bg-white p-3">
      <div className="flex justify-between">
        <div>
          <span className="text-xs text-stone-500">
            {item.category} · {item.kind}
          </span>
          <h3 className="font-bold">{item.description}</h3>
        </div>
        <b>{formatMoney(item.amount)}</b>
      </div>
      {item.note && <p className="text-sm text-stone-500">{item.note}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {!unlocked ? (
          <button onClick={() => setUnlocked(true)} className="rounded-lg border px-3">
            Unlock fixed expense
          </button>
        ) : (
          <button onClick={() => onEdit(item)} className="rounded-lg border px-3">
            Edit
          </button>
        )}
        <button
          onClick={() => {
            const v = prompt('Move to date (YYYY-MM-DD)', item.date);
            if (v) onMove(v);
          }}
          className="rounded-lg border px-3"
        >
          Move
        </button>
        <button
          onClick={() => {
            const v = prompt('Actual amount (₹)');
            if (v) onActual(Math.round(+v * 100));
          }}
          className="rounded-lg border px-3"
        >
          Add actual
        </button>
        <button onClick={onDelete} className="rounded-lg border border-red-200 px-3 text-red-700">
          Delete
        </button>
      </div>
    </article>
  );
}
export function AddExpenseModal({
  open,
  date,
  max,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  date: string;
  max: number;
  initial?: BudgetAllocation;
  onClose: () => void;
  onSave: (a: BudgetAllocation) => void;
}) {
  const ref = useRef<HTMLInputElement>(null),
    [amount, setAmount] = useState(initial?.amount ?? 0),
    [category, setCategory] = useState<Category>(initial?.category ?? 'Food'),
    [description, setDescription] = useState(initial?.description ?? ''),
    [kind, setKind] = useState<'fixed' | 'flexible'>(initial?.kind ?? 'flexible'),
    [note, setNote] = useState(initial?.note ?? ''),
    [recurring, setRecurring] = useState(!!initial?.recurringRuleId);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-title"
        className="max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-sand p-5 sm:max-w-md sm:rounded-3xl"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            id: initial?.id ?? crypto.randomUUID(),
            date,
            amount,
            category,
            description,
            kind,
            note: note || undefined,
            recurringRuleId: recurring
              ? (initial?.recurringRuleId ?? crypto.randomUUID())
              : undefined,
          });
        }}
      >
        <div className="mb-4 flex justify-between">
          <h2 id="expense-title" className="text-xl font-black">
            {initial ? 'Edit' : 'Add'} expense
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Description
            <input
              ref={ref}
              required
              className="rounded-xl border px-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <CategorySelector value={category} onChange={setCategory} />
          <AllocationSlider value={amount} max={max} onChange={setAmount} />
          <label className="grid gap-1 text-sm font-medium">
            Type
            <select
              className="rounded-xl border bg-white px-3"
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
            >
              <option value="flexible">Flexible</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Optional note
            <textarea
              className="rounded-xl border p-3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />{' '}
            Repeat monthly
          </label>
          <button className="rounded-xl bg-moss px-4 font-bold text-white">Save allocation</button>
        </div>
      </form>
    </div>
  );
}
export function DailyBudgetDrawer({
  date,
  items,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onActual,
  onClose,
}: {
  date: string;
  items: BudgetAllocation[];
  onAdd: () => void;
  onEdit: (a: BudgetAllocation) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, d: string) => void;
  onActual: (a: BudgetAllocation, n: number) => void;
  onClose: () => void;
}) {
  return (
    <aside
      aria-label="Daily budget details"
      className="fixed inset-x-0 bottom-0 z-30 max-h-[72vh] overflow-auto rounded-t-3xl border bg-sand p-4 shadow-2xl lg:static lg:max-h-none lg:rounded-2xl lg:shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-500">Selected date</p>
          <h2 className="font-black">
            {new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </h2>
        </div>
        <button aria-label="Close daily details" onClick={onClose}>
          ✕
        </button>
      </div>
      <button onClick={onAdd} className="mb-4 w-full rounded-xl bg-moss font-bold text-white">
        + Add expense
      </button>
      <div className="space-y-3">
        {items.length ? (
          items.map((a) => (
            <ExpenseCard
              key={a.id}
              item={a}
              onEdit={onEdit}
              onDelete={() => onDelete(a.id)}
              onMove={(d) => onMove(a.id, d)}
              onActual={(n) => onActual(a, n)}
            />
          ))
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-stone-500">
            Nothing planned yet. Add an expense for this day.
          </p>
        )}
      </div>
    </aside>
  );
}
