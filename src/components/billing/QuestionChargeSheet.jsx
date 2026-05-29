import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, CheckCircle2, DollarSign, Clock, FileQuestion, Copy, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const REASONS = [
  { label: 'Too High', icon: DollarSign },
  { label: "I don't recall this", icon: HelpCircle },
  { label: 'Time looks wrong', icon: Clock },
  { label: 'Need more detail', icon: FileQuestion },
  { label: 'Duplicate', icon: Copy },
  { label: 'Other', icon: AlertCircle },
];

export default function QuestionChargeSheet({ entry, user, onClose, onSaved }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSaving(true);

    const messageText = selectedReason + (note.trim() ? `\n\n${note.trim()}` : '');

    await base44.entities.DiscussionThread.create({
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
        text: messageText,
        timestamp: new Date().toISOString(),
      }],
    });

    await base44.entities.BillingEntry.update(entry.id, { status: 'flagged' });

    await base44.entities.Notification.create({
      user_email: entry.attorney_email,
      type: 'flag_created',
      title: 'Charge Questioned by Client',
      message: `${user.full_name || user.email} questioned "${entry.description}": ${selectedReason}.`,
      case_id: entry.case_id,
      billing_entry_id: entry.id,
      read: false,
    });

    setSaving(false);
    setSuccess(true);
    onSaved?.();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-2xl border-t border-border max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground text-base">Question a Charge</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          /* Success screen */
          <div className="flex flex-col items-center justify-center px-6 py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Your attorney has been notified</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We've flagged this charge and opened a discussion thread. Your attorney will respond shortly.
              </p>
            </div>
            <Button onClick={onClose} className="mt-2 w-full max-w-xs">Done</Button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6 pb-10">
            {/* Entry details */}
            <div className="bg-muted/50 rounded-2xl p-4 space-y-1">
              <p className="font-medium text-foreground text-sm">{entry.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="text-base font-semibold text-foreground">${entry.amount?.toFixed(2)}</span>
                {entry.date && <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>}
                {entry.hours && <span>{entry.hours}h @ ${entry.rate}/hr</span>}
              </div>
            </div>

            {/* Reason grid */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">What's the issue?</p>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setSelectedReason(label)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all',
                      selectedReason === label
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional note */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Additional note <span className="text-muted-foreground font-normal">(optional)</span></p>
              <Textarea
                placeholder="Add any extra context for your attorney..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || saving}
              className="w-full"
              size="lg"
            >
              {saving ? 'Submitting…' : 'Submit Question'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}