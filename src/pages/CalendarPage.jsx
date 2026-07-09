import { useEffect, useMemo, useState } from 'react';
import { addMonths, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths, eachDayOfInterval } from 'date-fns';
import { CalendarPlus, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import EventModal from '@/components/calendar/EventModal';
import { cn } from '@/lib/utils';

const typeStyles = { deadline: 'bg-destructive/10 text-destructive', hearing: 'bg-violet-100 text-violet-700', consultation: 'bg-amber/10 text-amber', meeting: 'bg-primary/10 text-primary', task: 'bg-emerald-100 text-emerald-700', other: 'bg-muted text-muted-foreground' };

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingEvent, setEditingEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const currentUser = await base44.auth.me();
    const eventList = await base44.entities.CalendarEvent.list('-start');
    setUser(currentUser);
    setEvents(eventList);
    setLoading(false);
  };

  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) }), [month]);
  const eventsByDate = useMemo(() => events.reduce((acc, event) => { const key = String(event.start || '').slice(0, 10); return { ...acc, [key]: [...(acc[key] || []), event] }; }, {}), [events]);
  const selectedEvents = eventsByDate[selectedDate] || [];

  const saveEvent = async (data) => {
    const saved = data.id ? await base44.entities.CalendarEvent.update(data.id, data) : await base44.entities.CalendarEvent.create(data);
    setEvents(prev => data.id ? prev.map(item => item.id === data.id ? saved : item) : [saved, ...prev]);
    setShowModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = async (event) => {
    await base44.entities.CalendarEvent.delete(event.id);
    setEvents(prev => prev.filter(item => item.id !== event.id));
    setShowModal(false);
    setEditingEvent(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Native Calendar" subtitle="Manage attorney-specific deadlines, hearings, consultations, and meetings." actions={<Button onClick={() => { setEditingEvent(null); setShowModal(true); }}><CalendarPlus className="w-4 h-4" /> Add Event</Button>} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-border"><Button variant="outline" size="icon" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft className="w-4 h-4" /></Button><h2 className="text-lg font-bold">{format(month, 'MMMM yyyy')}</h2><Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight className="w-4 h-4" /></Button></div>
          <div className="grid grid-cols-7 text-xs font-semibold text-muted-foreground border-b border-border">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-3 text-center">{day}</div>)}</div>
          <div className="grid grid-cols-7">{days.map(day => { const key = format(day, 'yyyy-MM-dd'); const dayEvents = eventsByDate[key] || []; return <button key={key} onClick={() => setSelectedDate(key)} className={cn('min-h-28 border-r border-b border-border p-2 text-left hover:bg-muted/40', !isSameMonth(day, month) && 'bg-muted/30 text-muted-foreground', selectedDate === key && 'ring-2 ring-primary ring-inset')}><span className={cn('inline-flex w-7 h-7 items-center justify-center rounded-full text-sm', isToday(day) && 'bg-primary text-primary-foreground')}>{format(day, 'd')}</span><div className="mt-2 space-y-1">{dayEvents.slice(0, 3).map(event => <div key={event.id} className={cn('truncate rounded px-2 py-1 text-xs', typeStyles[event.event_type] || typeStyles.other)}>{event.title}</div>)}{dayEvents.length > 3 && <p className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</p>}</div></button>; })}</div>
        </div>
        <aside className="bg-card border border-border rounded-2xl p-5 shadow-sm h-fit"><h3 className="font-bold mb-1">{format(new Date(`${selectedDate}T00:00`), 'MMMM d, yyyy')}</h3><p className="text-sm text-muted-foreground mb-4">{selectedEvents.length} scheduled event{selectedEvents.length === 1 ? '' : 's'}</p><div className="space-y-3">{selectedEvents.length ? selectedEvents.map(event => <button key={event.id} onClick={() => { setEditingEvent(event); setShowModal(true); }} className="w-full text-left border border-border rounded-xl p-4 hover:shadow-md transition-shadow"><span className={cn('rounded-full px-2 py-1 text-xs font-medium', typeStyles[event.event_type] || typeStyles.other)}>{event.event_type}</span><h4 className="font-semibold mt-3">{event.title}</h4><p className="text-sm text-muted-foreground mt-1">{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</p>{event.location && <p className="text-xs text-muted-foreground mt-2 flex gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</p>}</button>) : <p className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-6 text-center">No events for this date.</p>}</div></aside>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">External calendar sync is designed for the next connector step: each attorney can connect Google Calendar, Outlook, or Calendly to feed this native calendar.</div>
      {showModal && <EventModal event={editingEvent} user={user} selectedDate={selectedDate} onClose={() => setShowModal(false)} onSave={saveEvent} onDelete={deleteEvent} />}
    </div>
  );
}