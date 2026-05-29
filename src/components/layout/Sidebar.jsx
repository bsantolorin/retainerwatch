import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Briefcase, FileText, Bell, Users, ChevronLeft, ChevronRight, Scale, LogOut
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItemsAttorney = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Cases', icon: Briefcase, path: '/cases' },
  { label: 'Billing', icon: FileText, path: '/billing' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
];

const navItemsClient = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'My Cases', icon: Briefcase, path: '/cases' },
  { label: 'Charges', icon: FileText, path: '/billing' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
];

export default function Sidebar({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isAttorney = user?.role === 'attorney';
  const navItems = isAttorney ? navItemsAttorney : navItemsClient;

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-sidebar text-white transition-all duration-300 shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-wide text-white/90">RetainerWatch</span>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            isAttorney ? 'bg-primary/20 text-primary' : 'bg-amber/20 text-amber'
          )}>
            {isAttorney ? 'Attorney' : 'Client'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-primary/20 text-primary'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Collapse */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {!collapsed && (
          <div className="px-2 py-2">
            <p className="text-xs font-medium text-white/80 truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={() => base44.auth.logout()}
          className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors', collapsed && 'justify-center')}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors', collapsed && 'justify-center')}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}