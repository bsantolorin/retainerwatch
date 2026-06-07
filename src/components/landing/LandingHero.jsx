import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

const HERO_BG = 'https://media.base44.com/images/public/6a19a1c52a86f4ed357a8518/e6eb8d257_generated_image.png';

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0A0F1E]/70" />
      {/* Blue glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-[#3B82F6]/10 blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24">
        <div className="inline-flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full px-4 py-1.5 mb-8">
          <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span className="text-xs text-[#3B82F6] font-semibold tracking-widest uppercase">Trusted Legal Billing Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white">
          The Legal Solutions<br />
          <span className="text-[#3B82F6]">You Can Trust.</span>
        </h1>

        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          RetainerWatch helps law firms and clients manage retainer balances, track billing entries, and resolve disputes — all in one transparent platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold px-8 py-4 rounded-lg transition-colors text-sm tracking-widest uppercase"
          >
            Consultation & Inquiries <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0F1E] to-transparent" />
    </section>
  );
}