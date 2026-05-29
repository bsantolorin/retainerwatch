import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function NewBillingEntryModal({ caseData, user, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'hourly', description: '', amount: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const computedAmount = () => {
    if (form.type === 'hourly' && form.hours && form.rate) {
      return (parseFloat(form.hours) * parseFloat(form.rate)).toFixed(2);
    }
    return form.amount;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const amount = parseFloat(computedAmount());
    if (!form.description || !amount || !form.date) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    await base44.entities.BillingEntry.create({
      case_id: caseData.id,
      case_title: caseData.title,
      client_email: caseData.client_email,
      attorney_email: user.email,
      type: form.type,
      description: form.description,
      amount,
      hours: form.hours ? parseFloat(form.hours) : undefined,
      rate: form.rate ? parseFloat(form.rate) : undefined,
      date: form.date,
      status: 'normal',
    });

    // Deduct from case balance
    const newBalance = (caseData.current_balance || 0) - amount;
    await base44.entities.Case.update(caseData.id, { current_balance: newBalance });

    // Low balance notification
    if (newBalance <= (caseData.alert_threshold || 0)) {
      await Promise.all([
        base44.entities.Notification.create({
          user_email: caseData.client_email,
          type: 'low_balance',
          title: 'Low Retainer Balance',
          message: `Your retainer for "${caseData.title}" is low: $${newBalance.toFixed(2)} remaining.`,
          case_id: caseData.id,
          read: false,
        }),
        base44.entities.Notification.create({
          user_email: user.email,
          type: 'low_balance',
          title: 'Client Low Balance Alert',
          message: `Retainer for "${caseData.title}" (${caseData.client_name}) is low: $${newBalance.toFixed(2)} remaining.`,
          case_id: caseData.id,
          read: false,
        }),
      ]);
    }

    toast.success('Billing entry logged.');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Log Billing Entry</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={v => update('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="flat_fee">Flat Fee</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea placeholder="Describe the work performed..." value={form.description} onChange={e => update('description', e.target.value)} rows={2} />
          </div>
          {form.type === 'hourly' ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hours *</Label>
                <Input type="number" min="0" step="0.25" placeholder="2.5" value={form.hours} onChange={e => update('hours', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Rate ($/hr) *</Label>
                <Input type="number" min="0" step="0.01" placeholder="350.00" value={form.rate} onChange={e => update('rate', e.target.value)} />
              </div>
              {form.hours && form.rate && (
                <div className="col-span-2 text-sm text-muted-foreground">
                  Total: <strong>${computedAmount()}</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Amount ($) *</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => update('amount', e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Date *</Label>
            <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Log Entry'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}