import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function FlagEntryModal({ entry, user, onClose, onSaved }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!reason.trim()) { toast.error('Please provide a reason.'); return; }
    setSaving(true);

    // Create discussion thread
    const thread = await base44.entities.DiscussionThread.create({
      billing_entry_id: entry.id,
      case_id: entry.case_id,
      client_email: user.email,
      attorney_email: entry.attorney_email,
      billing_description: entry.description,
      billing_amount: entry.amount,
      status: 'open',
      messages: [{
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        sender_role: 'client',
        text: reason,
        timestamp: new Date().toISOString(),
      }],
    });

    // Flag the billing entry
    await base44.entities.BillingEntry.update(entry.id, { status: 'flagged' });

    // Notify attorney
    await base44.entities.Notification.create({
      user_email: entry.attorney_email,
      type: 'flag_created',
      title: 'Entry Flagged for Review',
      message: `${user.full_name || user.email} flagged "${entry.description}" for review.`,
      case_id: entry.case_id,
      billing_entry_id: entry.id,
      read: false,
    });

    toast.success('Entry flagged and discussion thread opened.');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber" /> Flag Entry for Review
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{entry.description}</p>
            <p className="text-muted-foreground mt-0.5">${entry.amount?.toFixed(2)}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Reason for flagging *</Label>
            <Textarea
              placeholder="Explain why you're flagging this entry..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <p className="text-xs text-muted-foreground">This will open a discussion thread with your attorney.</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-amber hover:bg-amber/90 text-white">
              {saving ? 'Flagging...' : 'Flag Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}