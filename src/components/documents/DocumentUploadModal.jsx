import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DocumentUploadModal({ cases, onClose, onUpload, uploading }) {
  const [form, setForm] = useState({ title: '', case_id: cases[0]?.id || '', category: 'other', version: 'v1', status: 'draft', client_visible: false, notes: '' });
  const [file, setFile] = useState(null);
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-start justify-between gap-4 mb-5"><div><h2 className="text-lg font-bold">Upload Document</h2><p className="text-sm text-muted-foreground">Attach a versioned file to a case and choose whether clients can view it.</p></div><Button variant="ghost" onClick={onClose}>Close</Button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Document Title"><Input value={form.title} onChange={(e) => update('title', e.target.value)} /></Field>
          <Field label="Case"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.case_id} onChange={(e) => update('case_id', e.target.value)}>{cases.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field>
          <Field label="Category"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.category} onChange={(e) => update('category', e.target.value)}><option value="pleading">Pleading</option><option value="contract">Contract</option><option value="evidence">Evidence</option><option value="correspondence">Correspondence</option><option value="billing">Billing</option><option value="court">Court</option><option value="other">Other</option></select></Field>
          <Field label="Version"><Input value={form.version} onChange={(e) => update('version', e.target.value)} placeholder="v1, v2, Final" /></Field>
          <Field label="Status"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Draft</option><option value="final">Final</option><option value="signed">Signed</option><option value="archived">Archived</option></select></Field>
          <Field label="File"><Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>
        </div>
        <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={form.client_visible} onChange={(e) => update('client_visible', e.target.checked)} /> Make visible in the client portal</label>
        <Field label="Notes" className="mt-4"><Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} /></Field>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={uploading || !form.title || !form.case_id || !file} onClick={() => onUpload(form, file)}>{uploading ? 'Uploading...' : 'Upload Document'}</Button></div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <div className={className}><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}