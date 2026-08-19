'use client';
import { BudgetAllocation } from '@/domain/types';
import { formatMoney } from '@/domain/money';
const cats: Record<string, string> = {
  Home: '🏠',
  Food: '🥗',
  Travel: '🚌',
  Health: '✚',
  Fun: '✦',
  Other: '•',
};
export function CalendarDay({
  date,
  inMonth,
  selected,
  items,
  onSelect,
  onDrop,
}: {
  date: string;
  inMonth: boolean;
  selected: boolean;
  items: BudgetAllocation[];
  onSelect: () => void;
  onDrop: (id: string) => void;
}) {
  const total = items.reduce((s, a) => s + a.amount, 0);
  return (
    <button
      aria-label={`${new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { dateStyle: 'full' })}, planned ${formatMoney(total)}`}
      aria-pressed={selected}
      onClick={onSelect}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e.dataTransfer.getData('text/allocation'))}
      className={`min-h-24 border-b border-r p-1.5 text-left align-top sm:min-h-32 sm:p-2 ${!inMonth ? 'bg-stone-100 text-stone-400' : ''} ${selected ? 'relative z-10 bg-mint ring-2 ring-inset ring-moss' : ''}`}
    >
      <span className="text-xs font-semibold sm:text-sm">{Number(date.slice(8))}</span>
      {total > 0 && (
        <>
          <div className="mt-1 text-[10px] font-bold sm:text-xs">{formatMoney(total)}</div>
          <div className="mt-1 space-y-0.5">
            {items.slice(0, 2).map((a) => (
              <div
                key={a.id}
                draggable={a.kind === 'flexible'}
                onDragStart={(e) => e.dataTransfer.setData('text/allocation', a.id)}
                className="truncate rounded bg-white/80 px-1 text-[9px] sm:text-[11px]"
              >
                {cats[a.category]} {a.description}
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-0.5" aria-hidden>
            {items.slice(0, 5).map((a) => (
              <i key={a.id} className="h-1 flex-1 rounded bg-moss" />
            ))}
          </div>
        </>
      )}
    </button>
  );
}
export function BudgetCalendar({
  month,
  allocations,
  selected,
  onSelect,
  onMove,
}: {
  month: string;
  allocations: BudgetAllocation[];
  selected?: string;
  onSelect: (d: string) => void;
  onMove: (id: string, d: string) => void;
}) {
  const [y, m] = month.split('-').map(Number),
    first = new Date(Date.UTC(y, m - 1, 1)),
    start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const key = (e: React.KeyboardEvent, idx: number) => {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (offsets[e.key]) {
      e.preventDefault();
      const target = days[idx + offsets[e.key]];
      if (target) {
        onSelect(target);
        document.querySelector<HTMLElement>(`[data-date='${target}']`)?.focus();
      }
    }
  };
  return (
    <section
      aria-label="Budget calendar"
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
    >
      <div className="grid grid-cols-7 bg-ink text-center text-[10px] font-semibold uppercase tracking-wider text-white sm:text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((x) => (
          <div className="py-2" key={x}>
            {x}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, i) => (
          <div key={d} data-date={d} onKeyDown={(e) => key(e, i)}>
            <CalendarDay
              date={d}
              inMonth={d.startsWith(month)}
              selected={selected === d}
              items={allocations.filter((a) => a.date === d)}
              onSelect={() => onSelect(d)}
              onDrop={(id) => id && onMove(id, d)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
