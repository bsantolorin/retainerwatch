import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createBillingAlerts } from '@/lib/billingAlerts';

export default function AddBillingEntryModal({ user, onClose, onSaved }) {
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    case_id: '',
    type: 'hourly',
    description: '',
    amount: '',
    hours: '',
    rate: '',
    date: new Date().toISOString().split('T')[0],
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    base44.entities.Case.filter({ attorney_email: user.email, status: 'active' }, 'title', 100)
      .then(c => { setCases(c); setLoadingCases(false); });
  }, [user.email]);

  const computedAmount = () => {
    if (form.type === 'hourly' && form.hours && form.rate) {
      return (parseFloat(form.hours) * parseFloat(form.rate)).toFixed(2);
    }
    return form.amount;
  };

  const selectedCase = cases.find(c => c.id === form.case_id);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.case_id) { toast.error('Please select a case.'); return; }
    const amount = parseFloat(computedAmount());
    if (!form.description || !amount || !form.date) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    await base44.entities.BillingEntry.create({
      case_id: selectedCase.id,
      case_title: selectedCase.title,
      client_email: selectedCase.client_email,
      attorney_email: user.email,
      type: form.type,
      description: form.description,
      amount,
      hours: form.hours ? parseFloat(form.hours) : undefined,
      rate: form.rate ? parseFloat(form.rate) : undefined,
      date: form.date,
      status: 'normal',
    });

    const newBalance = (selectedCase.current_balance || 0) - amount;
    await base44.entities.Case.update(selectedCase.id, { current_balance: newBalance });
    await createBillingAlerts({ caseData: selectedCase, amount, newBalance, clientEmail: selectedCase.client_email });

    toast.success('Billing entry logged.');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Add Billing Entry</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Case selector */}
          <div className="space-y-1.5">
            <Label>Case *</Label>
            <Select value={form.case_id} onValueChange={v => update('case_id', v)} disabled={loadingCases}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCases ? 'Loading cases...' : 'Select a case'} />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title} — {c.client_name || c.client_email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea placeholder="Describe the work performed..." value={form.description} onChange={e => update('description', e.target.value)} rows={2} />
          </div>

          {/* Amount */}
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

          {/* Date */}
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