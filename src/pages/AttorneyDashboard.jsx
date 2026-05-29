import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Briefcase, DollarSign, Flag, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import MetricCard from '@/components/shared/MetricCard';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AttorneyDashboard() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, e] = await Promise.all([
        base44.entities.Case.filter({ attorney_email: user.email }),
        base44.entities.BillingEntry.filter({ attorney_email: user.email }, '-created_date', 50),
      ]);
      setCases(c);
      setEntries(e);
      setLoading(false);
    }
    load();
  }, [user.email]);

  const activeCases = cases.filter(c => c.status === 'active');
  const flaggedEntries = entries.filter(e => e.status === 'flagged');
  const lowBalanceCases = cases.filter(c => c.current_balance != null && c.alert_threshold != null && c.current_balance <= c.alert_threshold);
  const totalManaged = cases.reduce((s, c) => s + (c.current_balance || 0), 0);
  const recentEntries = entries.slice(0, 8);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={`Good morning, ${user.full_name?.split(' ')[0] || 'Counsel'}`}
        subtitle="Here's an overview of your practice"
        actions={
          <Link to="/cases/new">
            <Button size="sm" className="gap-2"><Briefcase className="w-4 h-4" /> New Case</Button>
          </Link>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Active Cases" value={activeCases.length} icon={Briefcase} variant="primary" />
        <MetricCard title="Total Retainer" value={`$${totalManaged.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} variant="green" />
        <MetricCard title="Flagged Entries" value={flaggedEntries.length} icon={Flag} variant={flaggedEntries.length > 0 ? 'amber' : 'default'} />
        <MetricCard title="Low Balance" value={lowBalanceCases.length} icon={AlertTriangle} variant={lowBalanceCases.length > 0 ? 'amber' : 'default'} subtitle="Cases below threshold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Billing */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Recent Billing Entries</h2>
            <Link to="/billing" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : recentEntries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No billing entries yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Description</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Case</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentEntries.map(e => (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 max-w-[180px] truncate">{e.description}</td>
                    <td className="px-3 py-3 text-muted-foreground truncate max-w-[120px]">{e.case_title || '—'}</td>
                    <td className="px-3 py-3 text-right font-medium">${e.amount?.toFixed(2)}</td>
                    <td className="px-3 py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Balance Alerts */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber" /> Low Balance Alerts
            </h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : lowBalanceCases.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">All balances look healthy.</div>
          ) : (
            <div className="divide-y divide-border">
              {lowBalanceCases.map(c => (
                <Link key={c.id} to={`/cases/${c.id}`} className="block px-5 py-4 hover:bg-amber/5 transition-colors">
                  <p className="font-medium text-sm text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.client_name}</p>
                  <p className="text-sm font-semibold text-amber mt-1">
                    ${c.current_balance?.toFixed(2)} remaining
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}