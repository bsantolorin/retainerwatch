import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'Who is RetainerWatch for?', a: 'RetainerWatch is designed for law firms and their clients. Attorneys manage cases and billing; clients get full visibility into their retainer balance and charges.' },
  { q: 'How does the retainer alert system work?', a: 'When creating a case, attorneys set a custom low-balance threshold. The system automatically notifies both parties when the retainer balance falls below that amount.' },
  { q: 'Can clients dispute billing entries?', a: 'Yes. Clients can flag any charge as disputed, which opens a discussion thread directly in the platform. Both parties can communicate and resolve the issue without leaving RetainerWatch.' },
  { q: 'Is my billing data secure?', a: 'Absolutely. All data is encrypted in transit and at rest. Access is strictly role-based — clients only see their own cases and charges.' },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-24 px-6 bg-[#080D1A]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs text-[#3B82F6] font-bold tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className="bg-[#0D1526] border border-[#1E3A5F]/60 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left text-white font-medium text-sm hover:bg-[#1E3A5F]/20 transition-colors"
              >
                <span>{q}</span>
                <ChevronDown className={cn('w-4 h-4 text-[#3B82F6] shrink-0 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-white/60 leading-relaxed border-t border-[#1E3A5F]/40 pt-4">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}