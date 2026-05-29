import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RoleGatePage({ onRoleSet }) {
  const [setting, setSetting] = useState(null);

  const chooseRole = async (role) => {
    setSetting(role);
    await base44.auth.updateMe({ role });
    toast.success(`You're now registered as ${role === 'attorney' ? 'an Attorney' : 'a Client'}.`);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Scale className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to RetainerWatch</h1>
        <p className="text-muted-foreground text-sm mb-8">Select your role to continue. This sets your permissions within the platform.</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => chooseRole('attorney')}
            disabled={!!setting}
            className="group border-2 border-border hover:border-primary rounded-xl p-5 text-left transition-all hover:bg-primary/5"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Attorney</p>
            <p className="text-xs text-muted-foreground mt-1">Create cases, log billing, manage clients</p>
          </button>
          <button
            onClick={() => chooseRole('client')}
            disabled={!!setting}
            className="group border-2 border-border hover:border-primary rounded-xl p-5 text-left transition-all hover:bg-primary/5"
          >
            <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5 text-amber" />
            </div>
            <p className="font-semibold text-foreground">Client</p>
            <p className="text-xs text-muted-foreground mt-1">View retainer balance, charges, and flag entries</p>
          </button>
        </div>
        {setting && (
          <p className="text-sm text-muted-foreground mt-4 animate-pulse">Setting up your account...</p>
        )}
      </div>
    </div>
  );
}