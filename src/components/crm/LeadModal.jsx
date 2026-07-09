import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const emptyLead = { name: '', company: '', email: '', phone: '', source: '', referred_by: '', estimated_value: '', next_follow_up: '', notes: '', custom_fields: {} };

export default function LeadModal({ lead, stages, user, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(emptyLead);
  const [customRows, setCustomRows] = useState([]);

  useEffect(() => {
    const next = lead || { ...emptyLead, stage_id: stages[0]?.id, stage_name: stages[0]?.name };
    setForm(next);
    setCustomRows(Object.entries(next.custom_fields || {}).map(([key, value]) => ({ key, value })));
  }, [lead, stages]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const save = () => {
    const stage = stages.find(item => item.id === form.stage_id) || stages[0];
    const custom_fields = customRows.reduce((acc, row) => row.key ? { ...acc, [row.key]: row.value } : acc, {});
    onSave({ ...form, stage_id: stage?.id, stage_name: stage?.name, owner_email: form.owner_email || user.email, assigned_attorney_email: form.assigned_attorney_email || user.email, assigned_attorney_name: form.assigned_attorney_name || user.full_name, estimated_value: Number(form.estimated_value || 0), custom_fields });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-3xl w-full p-6 my-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div><h2 className="text-lg font-bold">{lead ? 'Edit Lead' : 'Add Lead'}</h2><p className="text-sm text-muted-foreground">Track intake, referrals, follow-ups, and custom fields.</p></div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name"><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} /></Field>
          <Field label="Company"><Input value={form.company || ''} onChange={(e) => update('company', e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email || ''} onChange={(e) => update('email', e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} /></Field>
          <Field label="Source"><Input value={form.source || ''} onChange={(e) => update('source', e.target.value)} placeholder="Website, referral, event" /></Field>
          <Field label="Referred By"><Input value={form.referred_by || ''} onChange={(e) => update('referred_by', e.target.value)} /></Field>
          <Field label="Stage"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.stage_id || ''} onChange={(e) => update('stage_id', e.target.value)}>{stages.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></Field>
          <Field label="Estimated Value"><Input type="number" value={form.estimated_value || ''} onChange={(e) => update('estimated_value', e.target.value)} /></Field>
          <Field label="Next Follow-up"><Input type="date" value={form.next_follow_up || ''} onChange={(e) => update('next_follow_up', e.target.value)} /></Field>
          <Field label="Status"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.status || 'active'} onChange={(e) => update('status', e.target.value)}><option value="active">Active</option><option value="retained">Retained</option><option value="lost">Lost</option><option value="closed">Closed</option></select></Field>
        </div>
        <Field label="Notes" className="mt-4"><Textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} /></Field>
        <div className="mt-4">
          <Label>Custom Fields</Label>
          <div className="space-y-2 mt-2">
            {customRows.map((row, index) => <div key={index} className="grid grid-cols-2 gap-2"><Input placeholder="Field" value={row.key} onChange={(e) => setCustomRows(rows => rows.map((item, i) => i === index ? { ...item, key: e.target.value } : item))} /><Input placeholder="Value" value={row.value} onChange={(e) => setCustomRows(rows => rows.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} /></div>)}
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setCustomRows(rows => [...rows, { key: '', value: '' }])}>Add Custom Field</Button>
        </div>
        <div className="flex justify-between gap-2 mt-6">
          {lead ? <Button variant="destructive" onClick={() => onDelete(lead)}>Delete</Button> : <span />}
          <Button onClick={save} disabled={!form.name}>Save Lead</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <div className={className}><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}