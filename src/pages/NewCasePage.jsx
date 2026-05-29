import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function NewCasePage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    client_email: '',
    client_name: '',
    initial_retainer: '',
    alert_threshold: '',
    description: '',
    status: 'active',
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.client_email || !form.initial_retainer) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    const initial = parseFloat(form.initial_retainer);
    await base44.entities.Case.create({
      ...form,
      initial_retainer: initial,
      current_balance: initial,
      alert_threshold: form.alert_threshold ? parseFloat(form.alert_threshold) : initial * 0.2,
      attorney_email: user.email,
      attorney_name: user.full_name || user.email,
    });
    toast.success('Case created successfully.');
    navigate('/cases');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="New Case" subtitle="Create a new client case and set the retainer" />
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div className="space-y-1.5">
          <Label>Case Title *</Label>
          <Input placeholder="e.g. Smith v. Jones — Contract Dispute" value={form.title} onChange={e => update('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Client Name *</Label>
            <Input placeholder="Full name" value={form.client_name} onChange={e => update('client_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Client Email *</Label>
            <Input type="email" placeholder="client@example.com" value={form.client_email} onChange={e => update('client_email', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Initial Retainer ($) *</Label>
            <Input type="number" min="0" step="0.01" placeholder="5000.00" value={form.initial_retainer} onChange={e => update('initial_retainer', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Low Balance Alert Threshold ($)</Label>
            <Input type="number" min="0" step="0.01" placeholder="Auto: 20% of retainer" value={form.alert_threshold} onChange={e => update('alert_threshold', e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Brief case description..." value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/cases')}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Case'}</Button>
        </div>
      </form>
    </div>
  );
}