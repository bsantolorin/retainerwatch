import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, CheckCheck, AlertTriangle, Info, MessageSquare, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  low_balance:   { icon: AlertTriangle, color: 'text-amber', bg: 'bg-amber/10' },
  new_entry:     { icon: DollarSign,    color: 'text-blue-400', bg: 'bg-blue-400/10' },
  flag_created:  { icon: MessageSquare, color: 'text-red-400',  bg: 'bg-red-400/10' },
  flag_resolved: { icon: CheckCheck,    color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  new_message:   { icon: MessageSquare, color: 'text-primary',  bg: 'bg-primary/10' },
};

export default function NotificationsBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    const data = await base44.entities.Notification.filter(
      { user_email: user.email },
      '-created_date',
      30
    );
    setNotifications(data);
  };

  useEffect(() => { load(); }, [user.email]);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    const unreadOnes = notifications.filter(n => !n.read);
    await Promise.all(unreadOnes.map(n => base44.entities.Notification.update(n.id, { read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (n) => {
    if (n.read) return;
    await base44.entities.Notification.update(n.id, { read: true });
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-foreground text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
            ) : (
              notifications.map(n => {
                const cfg = typeConfig[n.type] || { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted' };
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={cn(
                      'flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors',
                      !n.read && 'bg-primary/5'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                      <Icon className={cn('w-4 h-4', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium leading-snug', !n.read ? 'text-foreground' : 'text-muted-foreground')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}