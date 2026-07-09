import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import ReportMetric from '@/components/reports/ReportMetric';

export default function ReportsPage() {
  const [data, setData] = useState({ cases: [], billing: [], leads: [], tasks: [], events: [], documents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const canViewLeads = user.role === 'admin' || user.role === 'attorney';
    const [cases, billing, leads, tasks, events, documents] = await Promise.all([
      base44.entities.Case.list('-updated_date'),
      base44.entities.BillingEntry.list('-date'),
      canViewLeads ? base44.entities.Lead.list('-updated_date') : Promise.resolve([]),
      base44.entities.PracticeTask.list('-updated_date'),
      base44.entities.CalendarEvent.list('-start'),
      base44.entities.CaseDocument.list('-updated_date'),
    ]);
    setData({ cases, billing, leads, tasks, events, documents });
    setLoading(false);
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const billingByMonth = data.billing.reduce((acc, entry) => {
      const month = (entry.date || '').slice(0, 7) || 'No date';
      acc[month] = (acc[month] || 0) + Number(entry.amount || 0);
      return acc;
    }, {});
    return {
      activeCases: data.cases.filter(item => item.status !== 'closed').length,
      retainerBalance: data.cases.reduce((sum, item) => sum + Number(item.current_balance || 0), 0),
      billedTotal: data.billing.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      flaggedBilling: data.billing.filter(item => item.status === 'flagged').length,
      activeLeads: data.leads.filter(item => item.status === 'active').length,
      overdueTasks: data.tasks.filter(item => item.status !== 'done' && item.due_date && item.due_date < today).length,
      upcomingEvents: data.events.filter(item => item.start && item.start.slice(0, 10) >= today).length,
      documentCount: data.documents.length,
      billingChart: Object.entries(billingByMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, amount]) => ({ month, amount })),
    };
  }, [data]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Operational visibility across cases, billing, CRM, tasks, calendar, and documents." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ReportMetric label="Active Cases" value={stats.activeCases} hint="Open and pending matters" />
        <ReportMetric label="Retainer Balance" value={`$${stats.retainerBalance.toLocaleString()}`} hint="Current accessible balance" />
        <ReportMetric label="Total Billed" value={`$${stats.billedTotal.toLocaleString()}`} hint="Accessible billing entries" />
        <ReportMetric label="Active Leads" value={stats.activeLeads} hint="Open CRM opportunities" />
        <ReportMetric label="Flagged Charges" value={stats.flaggedBilling} hint="Needs review" />
        <ReportMetric label="Overdue Tasks" value={stats.overdueTasks} hint="Incomplete past due tasks" />
        <ReportMetric label="Upcoming Events" value={stats.upcomingEvents} hint="Scheduled calendar items" />
        <ReportMetric label="Documents" value={stats.documentCount} hint="Accessible case files" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-4">Billing Trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.billingChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Billed']} /><Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}