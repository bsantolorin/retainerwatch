export const DEFAULT_PIPELINE_STAGES = [
  { name: 'New Lead', color: 'blue', position: 1, active: true },
  { name: 'Qualified', color: 'violet', position: 2, active: true },
  { name: 'Consultation', color: 'amber', position: 3, active: true },
  { name: 'Engagement Sent', color: 'orange', position: 4, active: true },
  { name: 'Retained', color: 'emerald', position: 5, active: true },
  { name: 'Closed/Lost', color: 'slate', position: 6, active: true },
];

export const STAGE_COLORS = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
};

export const COLOR_OPTIONS = ['blue', 'violet', 'amber', 'orange', 'emerald', 'slate'];