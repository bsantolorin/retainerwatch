import { cn } from '@/lib/utils';

const configs = {
  normal:   { label: 'Normal',   classes: 'bg-emerald-100 text-emerald-700' },
  flagged:  { label: 'Flagged',  classes: 'bg-amber/20 text-amber' },
  resolved: { label: 'Resolved', classes: 'bg-blue-100 text-blue-700' },
  active:   { label: 'Active',   classes: 'bg-emerald-100 text-emerald-700' },
  closed:   { label: 'Closed',   classes: 'bg-muted text-muted-foreground' },
  pending:  { label: 'Pending',  classes: 'bg-amber/20 text-amber' },
  open:     { label: 'Open',     classes: 'bg-amber/20 text-amber' },
  hourly:   { label: 'Hourly',   classes: 'bg-blue-100 text-blue-700' },
  flat_fee: { label: 'Flat Fee', classes: 'bg-purple-100 text-purple-700' },
  expense:  { label: 'Expense',  classes: 'bg-orange-100 text-orange-700' },
};

export default function StatusBadge({ status, className }) {
  const cfg = configs[status] || { label: status, classes: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', cfg.classes, className)}>
      {cfg.label}
    </span>
  );
}