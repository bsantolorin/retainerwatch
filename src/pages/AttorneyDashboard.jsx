import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Briefcase, DollarSign, Flag, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/shared/MetricCard';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

function RetainerBar({ current, initial }) {
  const pct = initial > 0 ? Math.max(0, Math.min(100, (current / initial) * 100)) : 0;
  const color =
    pct > 50 ? 'bg-emerald-500' :
    pct > 30 ? 'bg-amber' :
    'bg-red-500';
  const textColor =
    pct > 50 ? 'text-emerald-600' :
    pct > 30 ? 'text-amber' :
    'text-red-500';

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{pct.toFixed(0)}% remaining</span>
        <span className={cn('text-sm font-bold', textColor)}>${current?.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CaseCard({ c }) {
  const pct = c.initial_retainer > 0 ? (c.current_balance / c.initial_retainer) * 100 : 0;
  const isLow = pct <= 30;

  return (
    <Link
      to={`/cases/${c.id}`}
      className={cn(
        'block bg-card rounded-xl border p-5 hover:shadow-md transition-all hover:border-primary/30',
        isLow ? 'border-amber/40' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-sm text-foreground leading-tight">{c.title}</p>
        <StatusBadge status={c.status} className="shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground">{c.client_name}</p>
      {c.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-70">{c.description}</p>
      )}
      <RetainerBar current={c.current_balance ?? 0} initial={c.initial_retainer ?? 0} />
    </Link>
  );
}

function ActivityFeedItem({ entry }) {
  const typeIcon = { hourly: '⏱', flat_fee: '📋', expense: '🧾' };
  return (
    <Link to={`/cases/${entry.case_id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm shrink-0">
        {typeIcon[entry.type] || '📄'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{entry.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{entry.case_title || '—'} · {entry.date ? format(new Date(entry.date), 'MMM d') : ''}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-foreground">${entry.amount?.toFixed(2)}</p>
        <StatusBadge status={entry.status} className="mt-1" />
      </div>
    </Link>
  );
}

export default function AttorneyDashboard() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, e] = await Promise.all([
        base44.entities.Case.filter({ attorney_email: user.email }),
        base44.entities.BillingEntry.filter({ attorney_email: user.email }, '-date', 100),
      ]);
      setCases(c);
      setEntries(e);
      setLoading(false);
    }
    load();
  }, [user.email]);

  // Stat calculations
  const totalRetainersHeld = cases.reduce((s, c) => s + (c.current_balance || 0), 0);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const billedThisMonth = entries
    .filter(e => { const d = new Date(e.date); return d >= monthStart && d <= monthEnd; })
    .reduce((s, e) => s + (e.amount || 0), 0);

  const casesBelow30 = cases.filter(c =>
    c.initial_retainer > 0 && (c.current_balance / c.initial_retainer) * 100 <= 30
  );
  const flaggedEntries = entries.filter(e => e.status === 'flagged');
  const recentFeed = entries.slice(0, 5);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={`Good morning, ${user.full_name?.split(' ')[0] || 'Counsel'}`}
        subtitle="Here's your practice overview"
        actions={
          <Link to="/cases/new">
            <Button size="sm" className="gap-2"><Briefcase className="w-4 h-4" /> New Case</Button>
          </Link>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Retainers Held"
          value={`$${totalRetainersHeld.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          variant="green"
          subtitle={`across ${cases.length} case${cases.length !== 1 ? 's' : ''}`}
        />
        <MetricCard
          title="Billed This Month"
          value={`$${billedThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          variant="primary"
          subtitle={format(now, 'MMMM yyyy')}
        />
        <MetricCard
          title="Cases Below 30%"
          value={casesBelow30.length}
          icon={AlertTriangle}
          variant={casesBelow30.length > 0 ? 'amber' : 'default'}
          subtitle="retainer running low"
        />
        <MetricCard
          title="Flagged Entries"
          value={flaggedEntries.length}
          icon={Flag}
          variant={flaggedEntries.length > 0 ? 'amber' : 'default'}
          subtitle="pending review"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Case Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-foreground">Active Cases</h2>
            <Link to="/cases" className="text-xs text-primary hover:underline flex items-center gap-1">
              All cases <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-36 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
              No cases yet. <Link to="/cases/new" className="text-primary hover:underline">Create your first case →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cases.map(c => <CaseCard key={c.id} c={c} />)}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-card rounded-xl border border-border overflow-hidden h-fit">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Recent Activity</h2>
            <Link to="/billing" className="text-xs text-primary hover:underline flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : recentFeed.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No billing entries yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {recentFeed.map(e => <ActivityFeedItem key={e.id} entry={e} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}