'use client';
import { Category, MinorUnits } from '@/domain/types';
import { formatMoney } from '@/domain/money';
export const categories: Category[] = ['Home', 'Food', 'Travel', 'Health', 'Fun', 'Other'];
export function CategorySelector({
  value,
  onChange,
}: {
  value: Category;
  onChange: (v: Category) => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      Category
      <select
        className="rounded-xl border bg-white px-3"
        value={value}
        onChange={(e) => onChange(e.target.value as Category)}
      >
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </label>
  );
}
export function AllocationSlider({
  value,
  max,
  onChange,
}: {
  value: MinorUnits;
  max: MinorUnits;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex justify-between text-sm font-medium">
        <span>Allocation</span>
        <b>{formatMoney(value)}</b>
      </label>
      <input
        aria-label="Allocation amount"
        className="w-full accent-moss"
        type="range"
        min="0"
        max={Math.max(max, value)}
        step="10000"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="grid grid-cols-4 gap-2">
        {[-50000, -10000, 10000, 50000].map((n) => (
          <button
            type="button"
            className="rounded-lg border bg-white text-xs font-bold"
            key={n}
            onClick={() => onChange(Math.max(0, Math.min(max, value + n)))}
          >
            {n > 0 ? '+' : '−'}₹{Math.abs(n) / 100}
          </button>
        ))}
      </div>
      <label className="mt-2 grid gap-1 text-xs">
        Direct amount (₹)
        <input
          className="rounded-lg border px-3"
          type="number"
          min="0"
          value={value / 100}
          onChange={(e) => onChange(Math.round(Number(e.target.value) * 100))}
        />
      </label>
    </div>
  );
}
export function MoneyPool({
  available,
  onAllocate,
}: {
  available: number;
  onAllocate: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-mint p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-moss">Available money</p>
        <p className="text-2xl font-black">{formatMoney(available)}</p>
      </div>
      <button onClick={onAllocate} className="rounded-xl bg-moss px-4 text-sm font-bold text-white">
        Allocate
      </button>
    </div>
  );
}
export function MonthProjection({ projected }: { projected: number }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <p className="text-xs text-stone-500">Projected month end</p>
      <strong>{formatMoney(projected)}</strong>
    </div>
  );
}
