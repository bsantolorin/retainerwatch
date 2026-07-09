import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function EventModal({ event, user, selectedDate, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ title: '', start: '', end: '', event_type: 'meeting', location: '', client_email: '', description: '' });

  useEffect(() => {
    const baseDate = selectedDate || new Date().toISOString().slice(0, 10);
    setForm(event || { title: '', start: `${baseDate}T09:00`, end: `${baseDate}T10:00`, event_type: 'meeting', location: '', client_email: '', description: '' });
  }, [event, selectedDate]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const save = () => onSave({ ...form, attorney_email: form.attorney_email || user.email, source: form.source || 'native', status: form.status || 'scheduled' });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-start justify-between gap-4 mb-5"><div><h2 className="text-lg font-bold">{event ? 'Edit Calendar Event' : 'Add Calendar Event'}</h2><p className="text-sm text-muted-foreground">Create native firm events, deadlines, consultations, and meetings.</p></div><Button variant="ghost" onClick={onClose}>Close</Button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title"><Input value={form.title || ''} onChange={(e) => update('title', e.target.value)} /></Field>
          <Field label="Type"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.event_type || 'meeting'} onChange={(e) => update('event_type', e.target.value)}><option value="deadline">Deadline</option><option value="hearing">Hearing</option><option value="consultation">Consultation</option><option value="meeting">Meeting</option><option value="task">Task</option><option value="other">Other</option></select></Field>
          <Field label="Start"><Input type="datetime-local" value={form.start || ''} onChange={(e) => update('start', e.target.value)} /></Field>
          <Field label="End"><Input type="datetime-local" value={form.end || ''} onChange={(e) => update('end', e.target.value)} /></Field>
          <Field label="Location / Link"><Input value={form.location || ''} onChange={(e) => update('location', e.target.value)} /></Field>
          <Field label="Client Email"><Input value={form.client_email || ''} onChange={(e) => update('client_email', e.target.value)} /></Field>
        </div>
        <Field label="Description" className="mt-4"><Textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} /></Field>
        <div className="flex justify-between gap-2 mt-6">{event ? <Button variant="destructive" onClick={() => onDelete(event)}>Delete</Button> : <span />}<Button onClick={save} disabled={!form.title || !form.start || !form.end}>Save Event</Button></div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <div className={className}><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}