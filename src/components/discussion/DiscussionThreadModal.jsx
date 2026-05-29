import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DiscussionThreadModal({ entry, user, onClose, onUpdate }) {
  const [thread, setThread] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const bottomRef = useRef(null);
  const isAttorney = user?.role === 'attorney';

  useEffect(() => {
    base44.entities.DiscussionThread.filter({ billing_entry_id: entry.id }).then(t => {
      setThread(t[0] || null);
    });
  }, [entry.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  const sendMessage = async () => {
    if (!message.trim() || !thread) return;
    setSending(true);
    const newMsg = {
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      sender_role: isAttorney ? 'attorney' : 'client',
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...(thread.messages || []), newMsg];
    await base44.entities.DiscussionThread.update(thread.id, { messages: updated });

    // Notify the other party
    const notifyEmail = isAttorney ? thread.client_email : thread.attorney_email;
    await base44.entities.Notification.create({
      user_email: notifyEmail,
      type: 'new_message',
      title: 'New Message in Discussion',
      message: `${user.full_name || user.email}: "${message.trim().substring(0, 60)}..."`,
      case_id: entry.case_id,
      billing_entry_id: entry.id,
      read: false,
    });

    setThread(t => ({ ...t, messages: updated }));
    setMessage('');
    setSending(false);
  };

  const resolveThread = async () => {
    if (!thread) return;
    setResolving(true);
    await Promise.all([
      base44.entities.DiscussionThread.update(thread.id, { status: 'resolved' }),
      base44.entities.BillingEntry.update(entry.id, { status: 'resolved' }),
    ]);
    await base44.entities.Notification.create({
      user_email: thread.client_email,
      type: 'flag_resolved',
      title: 'Entry Review Resolved',
      message: `Your dispute on "${entry.description}" has been marked resolved.`,
      case_id: entry.case_id,
      billing_entry_id: entry.id,
      read: false,
    });
    toast.success('Thread resolved.');
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-semibold text-foreground">Discussion Thread</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.description} · ${entry.amount?.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAttorney && thread?.status === 'open' && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={resolveThread} disabled={resolving}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Resolve
              </Button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {!thread ? (
            <p className="text-center text-muted-foreground text-sm py-6">Loading thread...</p>
          ) : thread.messages?.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">No messages yet.</p>
          ) : (
            thread.messages?.map((msg, i) => {
              const isMine = msg.sender_email === user.email;
              return (
                <div key={i} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5', isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
                    <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name} · {msg.sender_role}</p>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-50 text-right">{format(new Date(msg.timestamp), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {thread?.status !== 'resolved' ? (
          <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              className="resize-none flex-1"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <Button size="icon" onClick={sendMessage} disabled={sending || !message.trim()} className="self-end h-10 w-10 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-border shrink-0 text-center text-sm text-muted-foreground">
            This thread is resolved.
          </div>
        )}
      </div>
    </div>
  );
}