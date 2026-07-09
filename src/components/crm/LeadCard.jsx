import { Mail, Phone, UserRound, CalendarClock } from 'lucide-react';

export default function LeadCard({ lead, onEdit }) {
  return (
    <button onClick={() => onEdit(lead)} className="w-full text-left bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{lead.name}</h3>
          {lead.company && <p className="text-xs text-muted-foreground mt-0.5">{lead.company}</p>}
        </div>
        {lead.estimated_value ? <span className="text-xs font-semibold text-primary">${Number(lead.estimated_value).toLocaleString()}</span> : null}
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        {lead.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{lead.email}</p>}
        {lead.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{lead.phone}</p>}
        {lead.referred_by && <p className="flex items-center gap-2"><UserRound className="w-3.5 h-3.5" />Referred by {lead.referred_by}</p>}
        {lead.next_follow_up && <p className="flex items-center gap-2 text-amber"><CalendarClock className="w-3.5 h-3.5" />Follow up {lead.next_follow_up}</p>}
      </div>
    </button>
  );
}