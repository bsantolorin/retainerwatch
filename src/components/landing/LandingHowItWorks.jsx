const steps = [
  {
    num: '01',
    title: 'Attorney Creates a Case',
    desc: 'Set up a new client case, define the retainer amount, and configure a low-balance alert threshold tailored to the engagement.',
  },
  {
    num: '02',
    title: 'Log & Review Billing',
    desc: 'Attorneys log time and expenses. Clients receive instant notifications and can review every charge with full transparency.',
  },
  {
    num: '03',
    title: 'Resolve & Communicate',
    desc: 'Clients flag disputed entries and engage in threaded discussions with their attorney directly in the platform until resolved.',
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#080D1A]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#3B82F6] font-bold tracking-widest uppercase mb-3">Process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto text-sm">A simple three-step workflow designed for both attorneys and their clients.</p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%-0.5px)] right-[calc(16.67%-0.5px)] h-px bg-[#1E3A5F]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center text-center">
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#0D1526] border border-[#1E3A5F] flex items-center justify-center mb-6">
                  <span className="text-2xl font-black text-[#3B82F6]">{num}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}