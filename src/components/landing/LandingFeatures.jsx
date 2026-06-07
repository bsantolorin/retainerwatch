import { Scale, FileText, Bell } from 'lucide-react';

const features = [
  {
    icon: Scale,
    title: 'Retainer Tracking',
    desc: 'Monitor retainer balances in real-time. Get instant alerts when funds drop below your custom threshold so you\'re never caught off-guard.',
    bullets: ['Real-time balance visibility', 'Custom alert thresholds', 'Automatic low-balance warnings', 'Full deposit history'],
  },
  {
    icon: FileText,
    title: 'Billing Management',
    desc: 'Log hourly, flat-fee, and expense entries with full transparency. Clients can view every charge and flag disputes directly in the platform.',
    bullets: ['Hourly & flat-fee entries', 'Expense tracking', 'Client dispute flagging', 'Detailed billing history'],
  },
  {
    icon: Bell,
    title: 'Real-Time Alerts',
    desc: 'Stay informed with automated notifications for new charges, low balances, flagged entries, and resolved disputes — instantly delivered.',
    bullets: ['Instant charge notifications', 'Low retainer alerts', 'Flag & resolution updates', 'In-app notification center'],
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-24 px-6 bg-[#0A0F1E]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#3B82F6] font-bold tracking-widest uppercase mb-3">Feature Services</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Everything Your Firm Needs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, bullets }) => (
            <div
              key={title}
              className="bg-[#0D1526] border border-[#1E3A5F]/60 rounded-2xl p-7 hover:border-[#3B82F6]/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center mb-5 group-hover:bg-[#3B82F6]/20 transition-colors">
                <Icon className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5">{desc}</p>
              <ul className="space-y-2">
                {bullets.map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}