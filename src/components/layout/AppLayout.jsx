import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationsBell from './NotificationsBell';

export default function AppLayout({ user }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 shrink-0 flex items-center justify-end px-4 border-b border-border bg-sidebar">
          {user && <NotificationsBell user={user} />}
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}