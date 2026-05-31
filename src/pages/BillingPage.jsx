import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BillingEntryRow from '@/components/billing/BillingEntryRow';
import AddBillingEntryModal from '@/components/billing/AddBillingEntryModal';

export default function BillingPage() {
  const { user } = useOutletContext();
  const isAttorney = user?.role === 'attorney';
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    const filter = isAttorney ? { attorney_email: user.email } : { client_email: user.email };
    base44.entities.BillingEntry.filter(filter, '-date', 100).then(e => {
      setEntries(e);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [user.email]);

  const filtered = entries.filter(e => {
    const matchSearch = e.description?.toLowerCase().includes(search.toLowerCase()) || e.case_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchType = filterType === 'all' || e.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title={isAttorney ? 'All Billing Entries' : 'My Charges'}
        subtitle={isAttorney ? 'View and manage all billing entries across cases' : 'All charges against your retainer'}
        actions={isAttorney && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Billing Entry
          </Button>
        )}
      />

      {showAddModal && (
        <AddBillingEntryModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); load(); }}
        />
      )}

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="flat_fee">Flat Fee</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No entries found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(entry => (
              <BillingEntryRow key={entry.id} entry={entry} user={user} onUpdate={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}