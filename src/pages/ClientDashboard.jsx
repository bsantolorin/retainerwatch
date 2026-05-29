import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { MessageSquareWarning, Calendar, Clock, FileText, ArrowRight, ChevronRight } from 'lucide-react';
import CircularGauge from '@/components/client/CircularGauge';
import FlagEntryModal from '@/components/billing/FlagEntryModal';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

function StatChip({ icon: Icon, label, value, color = 'text-white/70' }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/5 rounded-2xl px-4 py-3 flex-1 min-w-0 border border-white/10">
      <Icon className={cn('w-4 h-4', color)} />
      <span className="text-lg font-bold text-white leading-none">{value}</span>
      <span className="text-[10px] text-white/40 text-center uppercase tracking-wide leading-tight">{label}</span>
    </div>
  );
}

function BillingCard({ entry, user, onRefresh }) {
  const [flagging, setFlagging] = useState(false);
  const isFlagged = entry.status === 'flagged';
  const isResolved = entry.status === 'resolved';

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">{entry.description}</p>
          <p className="text-xs text-white/40 mt-0.5">{entry.case_title || '—'} · {entry.date ? format(new Date(entry.date), 'MMM d, yyyy') : ''}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-white">${entry.amount?.toFixed(2)}</p>
          {entry.hours && (
            <p className="text-xs text-white/40 mt-0.5">{entry.hours}h @ ${entry.rate}/hr</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StatusBadge status={entry.status} />
        {!isFlagged && !isResolved && (
          <button
            onClick={() => setFlagging(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-amber hover:text-amber/80 transition-colors bg-amber/10 hover:bg-amber/20 px-3 py-1.5 rounded-full"
          >
            <MessageSquareWarning className="w-3 h-3" />
            Question this charge
          </button>
        )}
        {isFlagged && (
          <Link
            to={`/billing`}
            className="flex items-center gap-1 text-xs text-amber/70"
          >
            Under review <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {flagging && (
        <FlagEntryModal
          entry={entry}
          user={user}
          onClose={() => setFlagging(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [c, e] = await Promise.all([
      base44.entities.Case.filter({ client_email: user.email }),
      base44.entities.BillingEntry.filter({ client_email: user.email }, '-date', 50),
    ]);
    setCases(c);
    setEntries(e);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.email]);

  // Primary case (first active)
  const primaryCase = cases.find(c => c.status === 'active') || cases[0];
  const balance = primaryCase?.current_balance ?? 0;
  const initial = primaryCase?.initial_retainer ?? 0;
  const pct = initial > 0 ? (balance / initial) * 100 : 0;

  const balanceColor =
    pct > 50 ? 'text-emerald-400' :
    pct > 25 ? 'text-amber' :
    'text-red-400';

  // Stat chip calculations
  const now = new Date();
  const entriesThisMonth = entries.filter(e => {
    const d = new Date(e.date);
    return d >= startOfMonth(now) && d <= endOfMonth(now);
  }).length;

  const hoursThisWeek = entries
    .filter(e => { const d = new Date(e.date); return d >= startOfWeek(now) && d <= endOfWeek(now); })
    .reduce((s, e) => s + (e.hours || 0), 0);

  const recentEntries = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-sidebar">
      {/* Hero Section */}
      <div className="px-5 pt-8 pb-6">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold text-white">{user.full_name?.split(' ')[0] || 'Client'}</h1>
        {primaryCase && (
          <p className="text-white/40 text-xs mt-1 truncate">{primaryCase.title}</p>
        )}
      </div>

      {/* Circular Gauge + Balance */}
      <div className="flex flex-col items-center gap-2 pb-6 px-5">
        {loading ? (
          <div className="w-[200px] h-[200px] rounded-full bg-white/5 animate-pulse" />
        ) : (
          <CircularGauge pct={pct} />
        )}
        <div className="text-center -mt-2">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Retainer Balance</p>
          <p className={cn('text-4xl font-extrabold', balanceColor)}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-white/30 mt-1">
            of ${initial.toLocaleString('en-US', { minimumFractionDigits: 2 })} initial
          </p>
        </div>
      </div>

      {/* Stat Chips */}
      <div className="px-5 mb-6">
        <div className="flex gap-2">
          <StatChip icon={FileText} label="This Month" value={entriesThisMonth} color="text-blue-400" />
          <StatChip icon={Calendar} label="Next Hearing" value="—" color="text-purple-400" />
          <StatChip icon={Clock} label="Hrs This Week" value={hoursThisWeek.toFixed(1)} color="text-emerald-400" />
          <StatChip icon={FileText} label="Documents" value="—" color="text-amber" />
        </div>
      </div>

      {/* Recent Billing Entries */}
      <div className="px-5 pb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/80">Recent Charges</h2>
          <Link to="/billing" className="text-xs text-primary flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-8">No charges yet.</div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map(e => (
              <BillingCard key={e.id} entry={e} user={user} onRefresh={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}