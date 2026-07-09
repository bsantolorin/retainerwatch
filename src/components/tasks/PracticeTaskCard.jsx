import { CalendarClock, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-amber/10 text-amber',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function PracticeTaskCard({ task, canManage, onStatus }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-foreground">{task.title}</h3>{task.case_title && <p className="text-xs text-muted-foreground mt-0.5">{task.case_title}</p>}</div><span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityStyles[task.priority] || priorityStyles.medium}`}>{task.priority || 'medium'}</span></div>
      {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
      <div className="space-y-1 text-xs text-muted-foreground">{task.assigned_to_email && <p className="flex items-center gap-2"><UserRound className="w-3.5 h-3.5" />{task.assigned_to_name || task.assigned_to_email}</p>}{task.due_date && <p className="flex items-center gap-2"><CalendarClock className="w-3.5 h-3.5" />Due {task.due_date}</p>}</div>
      {canManage && task.status !== 'done' && <Button size="sm" variant="outline" className="w-full" onClick={() => onStatus(task, task.status === 'todo' ? 'in_progress' : 'done')}>{task.status === 'todo' ? 'Start Task' : 'Mark Done'}</Button>}
    </div>
  );
}