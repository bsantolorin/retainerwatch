import { Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0A0F1E]/90 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
          <Scale className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg tracking-wide">RetainerWatch</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {['Features', 'How It Works', 'Testimonials', 'FAQ'].map(item => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
            className="text-sm text-white/60 hover:text-white transition-colors tracking-wide uppercase font-medium"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="text-sm text-white/70 hover:text-white transition-colors font-medium px-4 py-2"
        >
          Log In
        </Link>
        <Link
          to="/register"
          className="text-sm bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}