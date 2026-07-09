import { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Settings2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import LeadCard from '@/components/crm/LeadCard';
import LeadModal from '@/components/crm/LeadModal';
import StageManager from '@/components/crm/StageManager';
import { DEFAULT_PIPELINE_STAGES, STAGE_COLORS } from '@/lib/crmDefaults';

export default function CRMPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [stageDraft, setStageDraft] = useState({ name: '', color: 'blue' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const currentUser = await base44.auth.me();
    const existingStages = await base44.entities.PipelineStage.list('position');
    const activeStages = existingStages.filter(stage => stage.active !== false);
    const finalStages = activeStages.length ? activeStages : await base44.entities.PipelineStage.bulkCreate(DEFAULT_PIPELINE_STAGES);
    const leadList = await base44.entities.Lead.list('-updated_date');
    setUser(currentUser);
    setStages(finalStages.sort((a, b) => a.position - b.position));
    setLeads(leadList);
    setLoading(false);
  };

  const filteredLeads = useMemo(() => leads.filter(lead => [lead.name, lead.company, lead.email, lead.referred_by, lead.source].join(' ').toLowerCase().includes(query.toLowerCase())), [leads, query]);

  const saveLead = async (data) => {
    const saved = data.id ? await base44.entities.Lead.update(data.id, data) : await base44.entities.Lead.create(data);
    setLeads(prev => data.id ? prev.map(item => item.id === data.id ? saved : item) : [saved, ...prev]);
    setShowLeadModal(false);
    setEditingLead(null);
  };

  const deleteLead = async (lead) => {
    await base44.entities.Lead.delete(lead.id);
    setLeads(prev => prev.filter(item => item.id !== lead.id));
    setShowLeadModal(false);
    setEditingLead(null);
  };

  const moveLead = async ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;
    const stage = stages.find(item => item.id === destination.droppableId);
    setLeads(prev => prev.map(lead => lead.id === draggableId ? { ...lead, stage_id: stage.id, stage_name: stage.name } : lead));
    await base44.entities.Lead.update(draggableId, { stage_id: stage.id, stage_name: stage.name });
  };

  const addStage = async () => {
    if (!stageDraft.name.trim()) return;
    const created = await base44.entities.PipelineStage.create({ ...stageDraft, position: stages.length + 1, active: true });
    setStages(prev => [...prev, created]);
    setStageDraft({ name: '', color: 'blue' });
  };

  const renameStage = async (stage, name) => {
    if (!name.trim() || name === stage.name) return;
    const updated = await base44.entities.PipelineStage.update(stage.id, { name });
    setStages(prev => prev.map(item => item.id === stage.id ? updated : item));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="CRM Pipeline" subtitle="Track leads, referrals, consultations, and retention from first contact." actions={<><Button variant="outline" onClick={() => setShowStages(true)}><Settings2 className="w-4 h-4" /> Stages</Button><Button onClick={() => { setEditingLead(null); setShowLeadModal(true); }}><Plus className="w-4 h-4" /> Add Lead</Button></>} />
      <div className="relative max-w-md mb-5"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search leads, referrals, or sources..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <DragDropContext onDragEnd={moveLead}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageLeads = filteredLeads.filter(lead => lead.stage_id === stage.id || (!lead.stage_id && lead.stage_name === stage.name));
            return (
              <Droppable droppableId={stage.id} key={stage.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="bg-muted/50 rounded-2xl p-3 min-h-[420px]">
                    <div className={`border rounded-xl px-3 py-2 mb-3 text-sm font-semibold ${STAGE_COLORS[stage.color] || STAGE_COLORS.slate}`}>{stage.name} <span className="float-right">{stageLeads.length}</span></div>
                    {stageLeads.map((lead, index) => (
                      <Draggable draggableId={lead.id} index={index} key={lead.id}>
                        {(dragProvided) => (
                          <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} className="mb-3">
                            <LeadCard lead={lead} onEdit={(item) => { setEditingLead(item); setShowLeadModal(true); }} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
      {showLeadModal && <LeadModal lead={editingLead} stages={stages} user={user} onClose={() => setShowLeadModal(false)} onSave={saveLead} onDelete={deleteLead} />}
      {showStages && <StageManager stages={stages} draft={stageDraft} setDraft={setStageDraft} onAdd={addStage} onRename={renameStage} onClose={() => setShowStages(false)} />}
    </div>
  );
}