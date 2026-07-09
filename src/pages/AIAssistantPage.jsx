import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import AIWorkspaceForm from '@/components/ai/AIWorkspaceForm';
import AIResult from '@/components/ai/AIResult';

export default function AIAssistantPage() {
  const { user, effectiveView } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [billing, setBilling] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({ workflow: 'billing_description', case_id: '', document_id: '', prompt: '' });

  useEffect(() => { loadData(); }, [effectiveView]);

  const loadData = async () => {
    const [caseList, billingList, documentList] = await Promise.all([
      base44.entities.Case.list('-updated_date'),
      base44.entities.BillingEntry.list('-date'),
      base44.entities.CaseDocument.list('-updated_date'),
    ]);
    const isClientView = effectiveView === 'client';
    setCases(isClientView ? caseList.filter(item => item.client_email === user.email) : caseList);
    setBilling(isClientView ? billingList.filter(item => item.client_email === user.email) : billingList);
    setDocuments(isClientView ? documentList.filter(item => item.client_visible && item.client_email === user.email) : documentList);
    setForm(prev => ({ ...prev, workflow: effectiveView === 'client' ? 'client_question' : 'billing_description' }));
    setLoading(false);
  };

  const context = useMemo(() => {
    const scopedCases = form.case_id ? cases.filter(item => item.id === form.case_id) : cases;
    const scopedBilling = billing.filter(item => !form.case_id || item.case_id === form.case_id).slice(0, 20);
    const scopedDocuments = documents.filter(item => !form.case_id || item.case_id === form.case_id).slice(0, 20);
    return JSON.stringify({ cases: scopedCases, recent_billing: scopedBilling, documents: scopedDocuments }, null, 2);
  }, [cases, billing, documents, form.case_id]);

  const generate = async () => {
    setGenerating(true);
    setResult('');
    try {
      const selectedDoc = documents.find(doc => doc.id === form.document_id);
      const isClient = effectiveView === 'client';
      const staffInstruction = 'You are RetainerWatch AI for a law firm practice management system. Help staff draft billing descriptions, summarize documents, and prepare client-friendly case updates. Be concise, professional, and do not invent facts.';
      const clientInstruction = 'You are RetainerWatch AI in a client portal. Answer only from the provided portal data and basic app FAQ. Do not provide legal advice. If information is not present, tell the client to contact their attorney.';
      const prompt = `${isClient ? clientInstruction : staffInstruction}\n\nWorkflow: ${form.workflow}\nUser request: ${form.prompt || 'Summarize the selected document or case context.'}\n\nAvailable context:\n${context}`;
      const response = await base44.integrations.Core.InvokeLLM({ prompt, file_urls: selectedDoc?.file_url ? [selectedDoc.file_url] : undefined });
      setResult(response);
    } catch (error) {
      setResult('AI generation failed. Please try again with a shorter request or a different document.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="RetainerWatch AI" subtitle="AI-assisted drafting, document summaries, and role-aware client answers." actions={<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><BrainCircuit className="w-5 h-5 text-primary" /></div>} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AIWorkspaceForm role={effectiveView} cases={cases} documents={documents} form={form} setForm={setForm} onSubmit={generate} generating={generating} />
        <AIResult result={result || (generating ? 'Generating your response...' : '')} />
      </div>
    </div>
  );
}