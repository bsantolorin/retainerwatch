import { useState } from 'react';
import { Flag, MessageSquare } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import DiscussionThreadModal from '@/components/discussion/DiscussionThreadModal';
import FlagEntryModal from '@/components/billing/FlagEntryModal';

export default function BillingEntryRow({ entry, user, viewRole, onUpdate }) {
  const [showThread, setShowThread] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const isAttorney = viewRole ? viewRole !== 'client' : user?.role === 'attorney' || user?.role === 'admin';

  return (
    <>
      <div className="px-5 py-4 hover:bg-muted/20 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm text-foreground">{entry.description}</p>
              <StatusBadge status={entry.type} />
              <StatusBadge status={entry.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {entry.date ? format(new Date(entry.date), 'MMM d, yyyy') : '—'}
              {entry.hours && ` · ${entry.hours}h @ $${entry.rate}/hr`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-foreground">${entry.amount?.toFixed(2)}</span>
            {entry.status === 'flagged' || entry.status === 'resolved' ? (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowThread(true)}>
                <MessageSquare className="w-3.5 h-3.5" /> Thread
              </Button>
            ) : (
              !isAttorney && entry.status === 'normal' && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs text-amber border-amber/30 hover:bg-amber/10" onClick={() => setShowFlag(true)}>
                  <Flag className="w-3.5 h-3.5" /> Flag
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {showThread && (
        <DiscussionThreadModal
          entry={entry}
          user={user}
          onClose={() => setShowThread(false)}
          onUpdate={onUpdate}
        />
      )}
      {showFlag && (
        <FlagEntryModal
          entry={entry}
          user={user}
          onClose={() => setShowFlag(false)}
          onSaved={onUpdate}
        />
      )}
    </>
  );
}