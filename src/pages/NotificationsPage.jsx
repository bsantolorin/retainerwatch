import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Bell, CheckCheck, AlertTriangle, Flag, MessageSquare, DollarSign, FileText } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const typeConfig = {
  low_balance: { icon: AlertTriangle, color: 'text-amber', bg: 'bg-amber/10' },
  flag_created: { icon: Flag, color: 'text-red-500', bg: 'bg-red-50' },
  flag_resolved: { icon: CheckCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  new_message: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
  new_entry: { icon: FileText, color: 'text-foreground', bg: 'bg-muted' },
};

const getNotificationPath = (n) => {
  if (n.case_id && (n.type === 'flag_created' || n.type === 'flag_resolved' || n.type === 'new_message' || n.type === 'new_entry')) {
    return `/cases/${n.case_id}`;
  }
  if (n.case_id && n.type === 'low_balance') {
    return `/cases/${n.case_id}`;
  }
  return null;
};

export default function NotificationsPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 50).then(n => {
      setNotifications(n);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [user.email]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    load();
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          unreadCount > 0 && (
            <Button size="sm" variant="outline" className="gap-2" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )
        }
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.new_entry;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                onClick={async () => {
                  if (!n.read) await markRead(n.id);
                  const path = getNotificationPath(n);
                  if (path) navigate(path);
                }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                  n.read ? 'bg-card border-border opacity-60' : 'bg-card border-primary/20 shadow-sm hover:shadow-md'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                  <Icon className={cn('w-4 h-4', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium', n.read ? 'text-muted-foreground' : 'text-foreground')}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{n.created_date ? format(new Date(n.created_date), 'MMM d, h:mm a') : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}