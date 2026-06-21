import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Search } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CasesPage() {
  const { user } = useOutletContext();
  const isAttorney = user?.role === 'attorney' || user?.role === 'admin';
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const filter = isAttorney ? { attorney_email: user.email } : { client_email: user.email };
    base44.entities.Case.filter(filter, '-created_date').then(c => {
      setCases(c);
      setLoading(false);
    });
  }, [user.email, isAttorney]);

  const filtered = cases.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title={isAttorney ? 'Cases' : 'My Cases'}
        subtitle={isAttorney ? 'Manage all client cases' : 'Cases associated with your account'}
        actions={
          isAttorney && (
            <Link to="/cases/new">
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Case</Button>
            </Link>
          )
        }
      />

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search cases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? 'No cases match your search.' : 'No cases found.'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(c => {
            const low = c.current_balance != null && c.alert_threshold != null && c.current_balance <= c.alert_threshold;
            return (
              <Link key={c.id} to={`/cases/${c.id}`} className="block bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    {isAttorney && <p className="text-sm text-muted-foreground mt-1">{c.client_name} · {c.client_email}</p>}
                    {c.description && <p className="text-sm text-muted-foreground mt-1 truncate">{c.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-bold ${low ? 'text-amber' : 'text-foreground'}`}>
                      ${c.current_balance?.toFixed(2) ?? '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">balance remaining</p>
                    {low && <p className="text-xs text-amber font-medium mt-1">⚠ Low balance</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}