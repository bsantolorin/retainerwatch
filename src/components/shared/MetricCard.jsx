import { cn } from '@/lib/utils';

export default function MetricCard({ title, value, subtitle, icon: Icon, variant = 'default', className }) {
  const variants = {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    amber: 'bg-amber/10 border-amber/30',
    green: 'bg-emerald-50 border-emerald-200',
    red: 'bg-red-50 border-red-200',
  };

  const iconVariants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    amber: 'bg-amber/20 text-amber',
    green: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className={cn('rounded-xl border p-5 flex items-start gap-4', variants[variant], className)}>
      {Icon && (
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold mt-0.5 text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}