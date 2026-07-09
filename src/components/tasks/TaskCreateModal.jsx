import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function TaskCreateModal({ cases, users, onClose, onCreate, saving }) {
  const [form, setForm] = useState({ title: '', description: '', case_id: cases[0]?.id || '', assigned_to_email: '', due_date: '', priority: 'medium', client_visible: false });
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-start justify-between gap-4 mb-5"><div><h2 className="text-lg font-bold">New Task</h2><p className="text-sm text-muted-foreground">Create a task tied to a case workflow.</p></div><Button variant="ghost" onClick={onClose}>Close</Button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => update('title', e.target.value)} /></Field>
          <Field label="Case"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.case_id} onChange={(e) => update('case_id', e.target.value)}><option value="">No case</option>{cases.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field>
          <Field label="Assign To"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.assigned_to_email} onChange={(e) => update('assigned_to_email', e.target.value)}><option value="">Unassigned</option>{users.map(item => <option key={item.id} value={item.email}>{item.full_name || item.email}</option>)}</select></Field>
          <Field label="Due Date"><Input type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} /></Field>
          <Field label="Priority"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.priority} onChange={(e) => update('priority', e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></Field>
        </div>
        <Field label="Description" className="mt-4"><Textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></Field>
        <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={form.client_visible} onChange={(e) => update('client_visible', e.target.checked)} /> Show this task in the client portal</label>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={saving || !form.title} onClick={() => onCreate(form)}>{saving ? 'Creating...' : 'Create Task'}</Button></div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <div className={className}><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}