import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AIWorkspaceForm({ role, cases, documents, form, setForm, onSubmit, generating }) {
  const isClient = role === 'client';
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const selectedDocs = documents.filter(doc => !form.case_id || doc.case_id === form.case_id);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <div><h2 className="text-lg font-semibold">Ask RetainerWatch AI</h2><p className="text-sm text-muted-foreground">{isClient ? 'Answers are limited to your portal data and general FAQ guidance.' : 'Draft billing notes, summarize documents, and prepare client updates.'}</p></div>
      <Field label="Workflow"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.workflow} onChange={(e) => update('workflow', e.target.value)}>{isClient ? <option value="client_question">Ask about my case</option> : <><option value="billing_description">Draft billing description</option><option value="document_summary">Summarize case document</option><option value="client_update">Draft client update</option></>}</select></Field>
      <Field label="Case"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.case_id} onChange={(e) => update('case_id', e.target.value)}><option value="">All accessible cases</option>{cases.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field>
      {!isClient && form.workflow === 'document_summary' && <Field label="Document"><select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full" value={form.document_id} onChange={(e) => update('document_id', e.target.value)}><option value="">Use case context only</option>{selectedDocs.map(doc => <option key={doc.id} value={doc.id}>{doc.title} — {doc.version || 'v1'}</option>)}</select></Field>}
      <Field label={isClient ? 'Question' : 'Notes or instructions'}><Textarea className="min-h-32" value={form.prompt} onChange={(e) => update('prompt', e.target.value)} placeholder={isClient ? 'What is the latest status of my case?' : 'Paste rough notes, document questions, or update instructions...'} /></Field>
      <Button onClick={onSubmit} disabled={generating || (!form.prompt && form.workflow !== 'document_summary')}>{generating ? 'Thinking...' : 'Generate'}</Button>
    </div>
  );
}

function Field({ label, children }) {
  return <div><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}