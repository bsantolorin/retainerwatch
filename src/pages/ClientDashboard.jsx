import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { DollarSign, FileText, Flag, AlertTriangle, ArrowRight } from 'lucide-react';
import MetricCard from '@/components/shared/MetricCard';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function ClientDashboard() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, e] = await Promise.all([
        base44.entities.Case.filter({ client_email: user.email }),
        base44.entities.BillingEntry.filter({ client_email: user.email }, '-date', 50),
      ]);
      setCases(c);
      setEntries(e);
      setLoading(false);
    }
    load();
  }, [user.email]);

  const totalBalance = cases.reduce((s, c) => s + (c.current_balance || 0), 0);
  const flaggedCount = entries.filter(e => e.status === 'flagged').length;
  const totalCharged = entries.reduce((s, e) => s + (e.amount || 0), 0);
  const lowBalance = cases.some(c => c.current_balance != null && c.alert_threshold != null && c.current_balance <= c.alert_threshold);

  // Build balance chart data from entries
  const chartData = (() => {
    if (!cases[0]) return [];
    const initial = cases[0].initial_retainer || 0;
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    let balance = initial;
    const points = [{ date: 'Start', balance: initial }];
    sorted.forEach(e => {
      balance -= e.amount;
      points.push({ date: format(new Date(e.date), 'MMM d'), balance: Math.max(balance, 0) });
    });
    return points.slice(-12);
  })();

  const recentEntries = entries.slice(0, 6);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title={`Hello, ${user.full_name?.split(' ')[0] || 'there'}`}
        subtitle="Your retainer overview"
      />

      {lowBalance && (
        <div className="mb-6 flex items-center gap-3 bg-amber/10 border border-amber/30 text-amber rounded-xl px-4 py-3 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Your retainer balance is running low. Please contact your attorney to discuss a top-up.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard title="Retainer Balance" value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} variant={lowBalance ? 'amber' : 'green'} className="col-span-2 lg:col-span-1" />
        <MetricCard title="Total Charged" value={`$${totalCharged.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={FileText} variant="primary" />
        <MetricCard title="Flagged Entries" value={flaggedCount} icon={Flag} variant={flaggedCount > 0 ? 'amber' : 'default'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-sm mb-4">Balance History</h2>
          {chartData.length < 2 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Not enough data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Balance']} />
                <Area type="monotone" dataKey="balance" stroke="hsl(217,91%,60%)" fill="url(#balGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cases */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">My Cases</h2>
            <Link to="/cases" className="text-xs text-primary hover:underline flex items-center gap-1">All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No cases yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {cases.map(c => (
                <Link key={c.id} to={`/cases/${c.id}`} className="block px-5 py-4 hover:bg-muted/30 transition-colors">
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className={`text-sm font-semibold mt-1 ${c.current_balance <= c.alert_threshold ? 'text-amber' : 'text-emerald-600'}`}>
                    ${c.current_balance?.toFixed(2)} remaining
                  </p>
                  <StatusBadge status={c.status} className="mt-1" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Charges */}
      <div className="mt-6 bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Recent Charges</h2>
          <Link to="/billing" className="text-xs text-primary hover:underline flex items-center gap-1">All charges <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {loading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
        ) : recentEntries.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">No charges yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Description</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentEntries.map(e => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 max-w-[200px] truncate">{e.description}</td>
                  <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{e.date ? format(new Date(e.date), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-3 py-3 text-right font-medium">${e.amount?.toFixed(2)}</td>
                  <td className="px-3 py-3"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}