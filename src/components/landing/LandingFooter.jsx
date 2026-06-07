import { Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="bg-[#060B15] border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">RetainerWatch</span>
            </div>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              Transparent legal billing for modern law firms and their clients.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="text-white/70 font-semibold text-sm mb-4 uppercase tracking-wider">Platform</p>
              <ul className="space-y-2.5">
                {['Features', 'How It Works', 'FAQ'].map(l => (
                  <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="text-white/40 hover:text-white text-sm transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/70 font-semibold text-sm mb-4 uppercase tracking-wider">Account</p>
              <ul className="space-y-2.5">
                <li><Link to="/login" className="text-white/40 hover:text-white text-sm transition-colors">Log In</Link></li>
                <li><Link to="/register" className="text-white/40 hover:text-white text-sm transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">© 2026 RetainerWatch. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
              <a key={l} href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}