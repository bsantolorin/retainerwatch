import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import CasesPage from '@/pages/CasesPage';
import CaseDetailPage from '@/pages/CaseDetailPage';
import NewCasePage from '@/pages/NewCasePage';
import BillingPage from '@/pages/BillingPage';
import ClientsPage from '@/pages/ClientsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import LogBillingEntryPage from '@/pages/LogBillingEntryPage';
import AttorneysPage from '@/pages/AttorneysPage';
import { Toaster as Sonner } from 'sonner';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setUserLoading(false));
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth || userLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-sidebar">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  if (!user) {
    navigateToLogin();
    return null;
  }

  return (
    <Routes>
      <Route element={<AppLayout user={user} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/new" element={<NewCasePage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/billing/new" element={<LogBillingEntryPage />} />
        <Route path="/attorneys" element={<AttorneysPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <Sonner richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;