import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PracticeTaskCard from '@/components/tasks/PracticeTaskCard';
import TaskCreateModal from '@/components/tasks/TaskCreateModal';

const columns = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' },
];

export default function TasksPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    const canManage = currentUser.role === 'admin' || currentUser.role === 'attorney';
    const [taskList, caseList, userList] = await Promise.all([
      base44.entities.PracticeTask.list('-updated_date'),
      base44.entities.Case.list('-updated_date'),
      canManage ? base44.entities.User.list() : Promise.resolve([]),
    ]);
    setUser(currentUser);
    setTasks(taskList);
    setCases(caseList);
    setUsers(userList.filter(item => item.role === 'admin' || item.role === 'attorney'));
    setLoading(false);
  };

  const canManage = user?.role === 'admin' || user?.role === 'attorney';
  const filteredTasks = tasks.filter(task => [task.title, task.description, task.case_title, task.assigned_to_name].join(' ').toLowerCase().includes(search.toLowerCase()));

  const createTask = async (form) => {
    setSaving(true);
    const relatedCase = cases.find(item => item.id === form.case_id);
    const assignee = users.find(item => item.email === form.assigned_to_email);
    const created = await base44.entities.PracticeTask.create({ ...form, case_title: relatedCase?.title, client_email: relatedCase?.client_email, owner_email: user.email, assigned_to_name: assignee?.full_name || assignee?.email });
    setTasks(prev => [created, ...prev]);
    setSaving(false);
    setShowCreate(false);
  };

  const updateStatus = async (task, status) => {
    await base44.entities.PracticeTask.update(task.id, { status });
    setTasks(prev => prev.map(item => item.id === task.id ? { ...item, status } : item));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Manage case work, assignments, deadlines, and client-visible milestones." actions={canManage && <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Task</Button>} />
      <div className="relative max-w-md mb-5"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">{columns.map(column => <div key={column.key} className="bg-muted/30 border border-border rounded-2xl p-4 min-h-80"><div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-foreground flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" />{column.label}</h2><span className="text-xs text-muted-foreground">{filteredTasks.filter(task => task.status === column.key).length}</span></div><div className="space-y-3">{filteredTasks.filter(task => task.status === column.key).map(task => <PracticeTaskCard key={task.id} task={task} canManage={canManage} onStatus={updateStatus} />)}</div></div>)}</div>
      {showCreate && <TaskCreateModal cases={cases} users={users} onClose={() => setShowCreate(false)} onCreate={createTask} saving={saving} />}
    </div>
  );
}