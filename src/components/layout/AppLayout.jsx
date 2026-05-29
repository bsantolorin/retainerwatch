import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout({ user }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}