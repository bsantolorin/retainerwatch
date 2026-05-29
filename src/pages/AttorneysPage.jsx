import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, UserPlus, Briefcase, Mail } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AttorneysPage() {
  const { user } = useOutletContext();
  const [attorneys, setAttorneys] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    Promise.all([
      base44.entities.User.list(),
      base44.entities.Case.filter({ attorney_email: user.email }),
    ]).then(([users, c]) => {
      setAttorneys(users.filter(u => u.role === 'attorney' || u.role === 'admin'));
      setCases(c);
      setLoading(false);
    });
  }, [user.email]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg('');
    await base44.users.inviteUser(inviteEmail, 'admin');
    setInviteMsg(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviting(false);
  };

  const getCaseCount = (email) => cases.filter(c => c.attorney_email === email).length;

  const filtered = attorneys.filter(a =>
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Attorneys"
        subtitle="All attorneys with access to the attorney portal"
        actions={
          <Button size="sm" onClick={() => { setInviteOpen(true); setInviteMsg(''); }}>
            <UserPlus className="w-4 h-4" />
            Add Attorney
          </Button>
        }
      />

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite an Attorney</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="invite-email">Attorney Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="attorney@example.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
            />
            {inviteMsg && <p className="text-sm text-green-600">{inviteMsg}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search attorneys..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No attorneys found.</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Attorney</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Role</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground">Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {(a.full_name || a.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{a.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />{a.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                      {a.role}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      {getCaseCount(a.email)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}