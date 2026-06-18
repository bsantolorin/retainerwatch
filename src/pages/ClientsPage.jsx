import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, AlertTriangle, UserPlus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import InviteTabs from '@/components/shared/InviteTabs';
import PendingInvitesTable from '@/components/shared/PendingInvitesTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function ClientsPage() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('accepted');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg('');
    try {
      const response = await base44.functions.invoke('sendInviteEmail', { email: inviteEmail, role: 'client' });
      if (response.data?.invitation) setInvitations(prev => [response.data.invitation, ...prev.filter(i => i.id !== response.data.invitation.id)]);
      setInviteEmail('');
      setInviteOpen(false);
      setActiveTab('pending');
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Please try again.';
      setInviteMsg(`Failed to send invite: ${message}`);
    } finally {
      setInviting(false);
    }
  };

  useEffect(() => {
    Promise.all([
      base44.entities.Case.filter({ attorney_email: user.email }),
      base44.entities.BillingEntry.filter({ attorney_email: user.email }),
      base44.entities.User.list(),
      base44.entities.Invitation.filter({ invited_by_email: user.email, role: 'client' }),
    ]).then(([c, e, allUsers, inv]) => {
      setCases(c);
      setEntries(e);
      setUsers(allUsers);
      setInvitations(inv);
      setLoading(false);
    });
  }, [user.email]);

  const userByEmail = new Map(users.map(u => [u.email?.toLowerCase(), u]));
  const casesByClient = cases.reduce((acc, c) => {
    const key = c.client_email?.toLowerCase();
    if (!acc[key]) acc[key] = { email: c.client_email, name: c.client_name, cases: [] };
    acc[key].cases.push(c);
    return acc;
  }, {});
  const acceptedEmails = new Set([
    ...Object.keys(casesByClient).filter(email => userByEmail.has(email)),
    ...invitations.filter(i => userByEmail.has(i.email?.toLowerCase())).map(i => i.email.toLowerCase()),
  ]);
  const clients = Array.from(acceptedEmails).map(email => {
    const foundUser = userByEmail.get(email);
    const fromCases = casesByClient[email];
    return { email: fromCases?.email || foundUser?.email || email, name: fromCases?.name || foundUser?.full_name, cases: fromCases?.cases || [] };
  });
  const pendingInvites = invitations.filter(i => i.status === 'pending' && !userByEmail.has(i.email?.toLowerCase()));
  const filtered = clients.filter(cl => cl.name?.toLowerCase().includes(search.toLowerCase()) || cl.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredPending = pendingInvites.filter(i => i.email?.toLowerCase().includes(search.toLowerCase()));
  const getFlagged = (email) => entries.filter(e => e.client_email === email && e.status === 'flagged').length;
  const getTotalBalance = (clientCases) => clientCases.reduce((s, c) => s + (c.current_balance || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader title="Clients" subtitle="All clients and their retainer status" actions={<Button size="sm" onClick={() => { setInviteOpen(true); setInviteMsg(''); }}><UserPlus className="w-4 h-4" />Invite Client</Button>} />

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Invite a Client</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2"><Label htmlFor="invite-email">Client Email</Label><Input id="invite-email" type="email" placeholder="client@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInvite()} />{inviteMsg && <p className="text-sm text-destructive">{inviteMsg}</p>}</div>
          <DialogFooter><Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button><Button onClick={handleInvite} disabled={inviting || !inviteEmail}>{inviting ? 'Sending…' : 'Send Invite'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteTabs activeTab={activeTab} onChange={setActiveTab} acceptedCount={clients.length} pendingCount={pendingInvites.length} />
      <div className="relative mb-5"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : activeTab === 'pending' ? (
        <PendingInvitesTable invites={filteredPending} emptyLabel="No pending client invites." />
      ) : filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground">No accepted clients found.</div> : (
        <div className="bg-card rounded-xl border border-border overflow-hidden"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Client</th><th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Cases</th><th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">Total Balance</th><th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground">Open Flags</th><th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th></tr></thead><tbody className="divide-y divide-border">{filtered.map(cl => { const totalBalance = getTotalBalance(cl.cases); const flagCount = getFlagged(cl.email); const hasLow = cl.cases.some(c => c.current_balance != null && c.alert_threshold != null && c.current_balance <= c.alert_threshold); return <tr key={cl.email} className="hover:bg-muted/30 transition-colors"><td className="px-5 py-4"><p className="font-medium text-foreground">{cl.name || '—'}</p><p className="text-xs text-muted-foreground">{cl.email}</p></td><td className="px-3 py-4"><div className="flex flex-wrap gap-1">{cl.cases.length ? cl.cases.map(c => <Link key={c.id} to={`/cases/${c.id}`} className="text-xs text-primary hover:underline">{c.title}</Link>) : <span className="text-muted-foreground">—</span>}</div></td><td className="px-3 py-4 text-right"><span className={`font-semibold ${hasLow ? 'text-amber' : 'text-foreground'}`}>${totalBalance.toFixed(2)}</span>{hasLow && <AlertTriangle className="inline-block w-3 h-3 text-amber ml-1" />}</td><td className="px-3 py-4 text-center">{flagCount > 0 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber/20 text-amber text-xs font-bold">{flagCount}</span> : <span className="text-muted-foreground">—</span>}</td><td className="px-3 py-4"><StatusBadge status={hasLow ? 'pending' : 'active'} /></td></tr>; })}</tbody></table></div>
      )}
    </div>
  );
}