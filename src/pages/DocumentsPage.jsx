import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileUp, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';

export default function DocumentsPage() {
  const { user, effectiveView } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { loadData(); }, [effectiveView]);

  const loadData = async () => {
    setLoading(true);
    const [caseList, documentList] = await Promise.all([base44.entities.Case.list('-updated_date'), base44.entities.CaseDocument.list('-updated_date')]);
    const visibleDocuments = effectiveView === 'client' ? documentList.filter(document => document.client_visible) : documentList;
    setCases(caseList);
    setDocuments(visibleDocuments);
    setLoading(false);
  };

  const canManage = effectiveView !== 'client';
  const filteredDocuments = useMemo(() => documents.filter(doc => [doc.title, doc.case_title, doc.category, doc.status, doc.file_name].join(' ').toLowerCase().includes(query.toLowerCase())), [documents, query]);

  const uploadDocument = async (form, file) => {
    setUploading(true);
    const relatedCase = cases.find(item => item.id === form.case_id);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const created = await base44.entities.CaseDocument.create({ ...form, file_url, file_name: file.name, file_type: file.type, case_title: relatedCase?.title, client_email: relatedCase?.client_email, attorney_email: relatedCase?.attorney_email || user.email, uploaded_by_email: user.email, uploaded_by_name: user.full_name });
    setDocuments(prev => [created, ...prev]);
    setUploading(false);
    setShowUpload(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title={canManage ? "Document Management" : "My Documents"} subtitle={canManage ? "Centralized, searchable, version-labeled case files for staff and client portal access." : "Documents shared with you through the client portal."} actions={canManage && <Button onClick={() => setShowUpload(true)} disabled={!cases.length}><FileUp className="w-4 h-4" /> Upload Document</Button>} />
      <div className="relative max-w-md mb-5"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search documents, cases, categories..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {!cases.length && canManage && <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground mb-5">Create a case first before uploading case documents.</div>}
      {filteredDocuments.length ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{filteredDocuments.map(document => <DocumentCard key={document.id} document={document} canManage={canManage} />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-muted-foreground">No documents found.</div>}
      {showUpload && <DocumentUploadModal cases={cases} onClose={() => setShowUpload(false)} onUpload={uploadDocument} uploading={uploading} />}
    </div>
  );
}