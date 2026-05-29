import { useState } from 'react';
import { AlertTriangle, DollarSign, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const BANNER_CONFIG = {
  low_balance: {
    icon: AlertTriangle,
    bg: 'bg-amber/15 border-amber/30',
    iconColor: 'text-amber',
    textColor: 'text-amber',
  },
  new_entry: {
    icon: DollarSign,
    bg: 'bg-blue-500/15 border-blue-500/30',
    iconColor: 'text-blue-400',
    textColor: 'text-blue-300',
  },
};

export default function AlertBanners({ notifications }) {
  const [dismissed, setDismissed] = useState(new Set());

  const alertable = notifications.filter(
    n => !n.read && !dismissed.has(n.id) && (n.type === 'low_balance' || n.type === 'new_entry')
  );

  if (alertable.length === 0) return null;

  return (
    <div className="px-5 pb-3 space-y-2">
      {alertable.map(n => {
        const cfg = BANNER_CONFIG[n.type] || BANNER_CONFIG.low_balance;
        const Icon = cfg.icon;
        return (
          <div
            key={n.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-2xl border text-sm',
              cfg.bg
            )}
          >
            <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', cfg.iconColor)} />
            <div className="flex-1 min-w-0">
              <p className={cn('font-semibold text-xs uppercase tracking-wide', cfg.textColor)}>{n.title}</p>
              <p className="text-white/70 text-xs mt-0.5">{n.message}</p>
            </div>
            <button
              onClick={() => setDismissed(prev => new Set([...prev, n.id]))}
              className="text-white/30 hover:text-white/70 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}