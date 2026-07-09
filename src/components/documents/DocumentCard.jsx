import { Download, FileText, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusStyles = {
  draft: 'bg-muted text-muted-foreground',
  final: 'bg-primary/10 text-primary',
  signed: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-600',
};

export default function DocumentCard({ document, canManage = false }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-primary" /></div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{document.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{document.case_title || 'Case document'}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[document.status] || statusStyles.draft}`}>{document.status || 'draft'}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-muted-foreground">
        <p>Category: <span className="font-medium text-foreground">{document.category || 'other'}</span></p>
        <p>Version: <span className="font-medium text-foreground">{document.version || 'v1'}</span></p>
        {canManage && <p className="flex items-center gap-1">{document.client_visible ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}{document.client_visible ? 'Client visible' : 'Internal only'}</p>}
        <p className="truncate">{document.file_name}</p>
      </div>
      {document.notes && <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{document.notes}</p>}
      <Button asChild variant="outline" className="w-full mt-4"><a href={document.file_url} target="_blank" rel="noreferrer"><Download className="w-4 h-4" /> Open File</a></Button>
    </div>
  );
}