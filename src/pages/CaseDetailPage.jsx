import { useState, useEffect } from 'react';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, ArrowLeft, DollarSign, Flag, FileText } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import MetricCard from '@/components/shared/MetricCard';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import BillingEntryRow from '@/components/billing/BillingEntryRow';
import NewBillingEntryModal from '@/components/billing/NewBillingEntryModal';

export default function CaseDetailPage() {
  const { user } = useOutletContext();
  const { id } = useParams();
  const isAttorney = user?.role === 'attorney';
  const [caseData, setCaseData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);

  const reload = async () => {
    const [c, e] = await Promise.all([
      base44.entities.Case.filter({ id }),
      base44.entities.BillingEntry.filter({ case_id: id }, '-date'),
    ]);
    setCaseData(c[0] || null);
    setEntries(e);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!caseData) return <div className="p-8 text-center text-muted-foreground">Case not found.</div>;

  const low = caseData.current_balance != null && caseData.alert_threshold != null && caseData.current_balance <= caseData.alert_threshold;
  const flagged = entries.filter(e => e.status === 'flagged');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cases
      </Link>

      <PageHeader
        title={caseData.title}
        subtitle={isAttorney ? `Client: ${caseData.client_name} · ${caseData.client_email}` : `Attorney: ${caseData.attorney_name}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={caseData.status} />
            {isAttorney && (
              <Button size="sm" className="gap-2" onClick={() => setShowNewEntry(true)}>
                <Plus className="w-4 h-4" /> Log Entry
              </Button>
            )}
          </div>
        }
      />

      {low && (
        <div className="mb-6 flex items-center gap-3 bg-amber/10 border border-amber/30 text-amber rounded-xl px-4 py-3 text-sm font-medium">
          ⚠ Retainer balance is below the alert threshold of ${caseData.alert_threshold?.toFixed(2)}.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Current Balance" value={`$${caseData.current_balance?.toFixed(2) ?? '0.00'}`} icon={DollarSign} variant={low ? 'amber' : 'green'} />
        <MetricCard title="Initial Retainer" value={`$${caseData.initial_retainer?.toFixed(2) ?? '0.00'}`} icon={DollarSign} variant="default" />
        <MetricCard title="Total Billed" value={`$${((caseData.initial_retainer || 0) - (caseData.current_balance || 0)).toFixed(2)}`} icon={FileText} variant="primary" />
        <MetricCard title="Flagged Entries" value={flagged.length} icon={Flag} variant={flagged.length > 0 ? 'amber' : 'default'} />
      </div>

      {/* Billing Entries Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Billing Entries</h2>
          <span className="text-xs text-muted-foreground">{entries.length} entries</span>
        </div>
        {entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No billing entries yet. {isAttorney && 'Click "Log Entry" to add the first one.'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map(entry => (
              <BillingEntryRow
                key={entry.id}
                entry={entry}
                user={user}
                onUpdate={reload}
              />
            ))}
          </div>
        )}
      </div>

      {showNewEntry && (
        <NewBillingEntryModal
          caseData={caseData}
          user={user}
          onClose={() => setShowNewEntry(false)}
          onSaved={reload}
        />
      )}
    </div>
  );
}