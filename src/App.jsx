import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useEffect, useRef } from 'react';
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
import LandingPage from '@/pages/LandingPage';
import { Toaster as Sonner } from 'sonner';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoadingAuth || isLoadingPublicSettings) return;
    if (redirected.current) return;

    const publicPaths = ['/', '/landing', '/login', '/register', '/forgot-password', '/reset-password'];
    if (publicPaths.includes(window.location.pathname)) return;

    const needsLogin =
      (!authError && !user) ||
      (authError && authError.type === 'auth_required');

    if (needsLogin) {
      redirected.current = true;
      navigateToLogin();
    }
  }, [isLoadingAuth, isLoadingPublicSettings, authError, user]);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-sidebar">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'auth_required') {
      return null; // redirect handled in useEffect above
    }
  }

  if (!user) {
    return null; // redirect handled in useEffect above
  }

  return (
    <Routes>
      <Route element={<AppLayout user={user} />}>
        <Route path="/dashboard" element={<HomePage />} />
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
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
        <Sonner richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;