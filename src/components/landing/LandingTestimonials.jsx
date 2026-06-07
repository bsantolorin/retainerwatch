const testimonials = [
  {
    quote: "RetainerWatch transformed how I manage client retainers. The real-time balance alerts alone have saved us from awkward conversations dozens of times.",
    name: "Sarah Chen",
    role: "Partner, Chen & Associates",
    initials: "SC",
  },
  {
    quote: "As a client, I finally feel in control. I can see exactly where my retainer is going, and flagging a charge takes just one click. Complete transparency.",
    name: "Jon Mark",
    role: "Client",
    initials: "JM",
  },
  {
    quote: "The dispute resolution thread feature is brilliant. We resolve billing questions in the platform now instead of endless back-and-forth emails.",
    name: "Erik Soman",
    role: "Managing Attorney",
    initials: "ES",
  },
];

export default function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-[#0A0F1E]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#3B82F6] font-bold tracking-widest uppercase mb-3">Reviews</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">What Our Clients Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, initials }) => (
            <div
              key={name}
              className="bg-[#0D1526] border border-[#1E3A5F]/60 rounded-2xl p-7"
            >
              <div className="text-4xl text-[#3B82F6]/30 font-serif leading-none mb-4">"</div>
              <p className="text-white/70 text-sm leading-relaxed mb-6 italic">{quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-white/40 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}