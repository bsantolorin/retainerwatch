import { COLOR_OPTIONS } from '@/lib/crmDefaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StageManager({ stages, draft, setDraft, onAdd, onRename, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-xl w-full p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div><h2 className="text-lg font-bold">Pipeline Stages</h2><p className="text-sm text-muted-foreground">Modify the stages used by the CRM Kanban board.</p></div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="space-y-3 mb-5">
          {stages.map(stage => (
            <div key={stage.id} className="flex items-center gap-2">
              <Input defaultValue={stage.name} onBlur={(e) => onRename(stage, e.target.value)} />
              <span className="text-xs text-muted-foreground w-14">#{stage.position}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2">
          <Input placeholder="New stage name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })}>
            {COLOR_OPTIONS.map(color => <option key={color} value={color}>{color}</option>)}
          </select>
          <Button onClick={onAdd}>Add Stage</Button>
        </div>
      </div>
    </div>
  );
}