import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Calculator } from 'lucide-react';

const BILLERS = [
  { value: 'attorney', label: 'Attorney', rate: 300 },
  { value: 'paralegal', label: 'Paralegal', rate: 150 },
];

export default function LogBillingEntryPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    case_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    biller: 'attorney',
  });

  useEffect(() => {
    base44.entities.Case.filter({ attorney_email: user.email, status: 'active' })
      .then(c => { setCases(c); setLoadingCases(false); });
  }, [user.email]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedBiller = BILLERS.find(b => b.value === form.biller);
  const rate = selectedBiller?.rate ?? 0;
  const hours = parseFloat(form.hours) || 0;
  const total = hours * rate;
  const hasTotal = hours > 0;

  const selectedCase = cases.find(c => c.id === form.case_id);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.case_id || !form.description || !form.date || !form.hours || hours <= 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);

    await base44.entities.BillingEntry.create({
      case_id: form.case_id,
      case_title: selectedCase?.title || '',
      client_email: selectedCase?.client_email || '',
      attorney_email: user.email,
      type: 'hourly',
      description: form.description,
      amount: total,
      hours,
      rate,
      date: form.date,
      status: 'normal',
    });

    // Recalculate case balance
    const newBalance = (selectedCase.current_balance || 0) - total;
    await base44.entities.Case.update(form.case_id, { current_balance: newBalance });

    // Low balance notification
    if (newBalance <= (selectedCase.alert_threshold || 0)) {
      await Promise.all([
        base44.entities.Notification.create({
          user_email: selectedCase.client_email,
          type: 'low_balance',
          title: 'Low Retainer Balance',
          message: `Your retainer for "${selectedCase.title}" is low: $${newBalance.toFixed(2)} remaining.`,
          case_id: form.case_id,
          read: false,
        }),
        base44.entities.Notification.create({
          user_email: user.email,
          type: 'low_balance',
          title: 'Client Low Balance Alert',
          message: `Retainer for "${selectedCase.title}" (${selectedCase.client_name}) is low: $${newBalance.toFixed(2)} remaining.`,
          case_id: form.case_id,
          read: false,
        }),
      ]);
    }

    toast.success('Billing entry logged successfully.');
    navigate(`/cases/${form.case_id}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Log Billing Entry"
        subtitle="Record time against an active case"
      />

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Case */}
          <div className="space-y-1.5">
            <Label htmlFor="case">Case <span className="text-destructive">*</span></Label>
            <Select value={form.case_id} onValueChange={v => update('case_id', v)} disabled={loadingCases}>
              <SelectTrigger id="case">
                <SelectValue placeholder={loadingCases ? 'Loading cases…' : 'Select an active case'} />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-medium">{c.title}</span>
                    <span className="ml-2 text-muted-foreground text-xs">— {c.client_name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCase && (
              <p className="text-xs text-muted-foreground mt-1">
                Balance: <span className="font-semibold text-foreground">${selectedCase.current_balance?.toFixed(2)}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desc">Task Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="desc"
              placeholder="Describe the work performed…"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Date + Billed By */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biller">Billed By <span className="text-destructive">*</span></Label>
              <Select value={form.biller} onValueChange={v => update('biller', v)}>
                <SelectTrigger id="biller"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BILLERS.map(b => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label} — ${b.rate}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-1.5">
            <Label htmlFor="hours">Hours Spent <span className="text-destructive">*</span></Label>
            <Input
              id="hours"
              type="number"
              min="0"
              step="0.25"
              placeholder="e.g. 2.5"
              value={form.hours}
              onChange={e => update('hours', e.target.value)}
            />
          </div>

          {/* Live Total */}
          <div className={cn(
            'rounded-xl border px-5 py-4 flex items-center justify-between transition-all',
            hasTotal ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/40'
          )}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="w-4 h-4" />
              <span>{hasTotal ? `${hours} hr${hours !== 1 ? 's' : ''} × $${rate}/hr` : 'Enter hours to calculate total'}</span>
            </div>
            <span className={cn(
              'text-xl font-bold',
              hasTotal ? 'text-primary' : 'text-muted-foreground'
            )}>
              {hasTotal ? `$${total.toFixed(2)}` : '$—'}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={saving || !hasTotal}>
              {saving ? 'Saving…' : 'Log Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}