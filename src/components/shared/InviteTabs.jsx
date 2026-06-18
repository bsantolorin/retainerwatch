import { cn } from '@/lib/utils';

export default function InviteTabs({ activeTab, onChange, acceptedCount, pendingCount }) {
  const tabs = [
    { key: 'accepted', label: 'Accepted', count: acceptedCount },
    { key: 'pending', label: 'Pending Invites', count: pendingCount },
  ];

  return (
    <div className="flex gap-2 mb-5 border-b border-border">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}