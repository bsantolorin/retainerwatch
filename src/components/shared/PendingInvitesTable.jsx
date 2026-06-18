import { Mail, Clock } from 'lucide-react';

export default function PendingInvitesTable({ invites, emptyLabel }) {
  if (invites.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Email</th>
            <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
            <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Sent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invites.map(invite => (
            <tr key={invite.id || invite.email} className="hover:bg-muted/30 transition-colors">
              <td className="px-5 py-4">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {invite.email}
                </span>
              </td>
              <td className="px-3 py-4">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber/20 text-amber">Pending</span>
              </td>
              <td className="px-3 py-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {invite.sent_at ? new Date(invite.sent_at).toLocaleDateString() : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}