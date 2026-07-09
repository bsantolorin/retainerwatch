import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationsBell from './NotificationsBell';
import { Menu } from 'lucide-react';

export default function AppLayout({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminView, setAdminView] = useState('attorney');
  const effectiveView = user?.role === 'admin' ? adminView : user?.role;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 md:relative md:flex md:shrink-0
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar user={user} adminView={adminView} setAdminView={setAdminView} onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border bg-sidebar">
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {user && <NotificationsBell user={user} />}
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ user, effectiveView }} />
        </main>
      </div>
    </div>
  );
}