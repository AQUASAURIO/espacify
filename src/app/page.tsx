'use client';

import { useNavigation, useAuth } from '@/store';
import { AppShell } from '@/components/espacify/app-shell';
import { LandingPage } from '@/components/espacify/landing-page';
import { AuthPage } from '@/components/espacify/auth-page';
import { DashboardView } from '@/components/espacify/dashboard-view';
import { ProjectsView } from '@/components/espacify/projects-view';
import { ProjectCreateView } from '@/components/espacify/project-create';
import { ProjectDetailView } from '@/components/espacify/project-detail';
import { DocumentsView } from '@/components/espacify/documents-view';
import { ProfileView } from '@/components/espacify/profile-view';
import { SettingsView } from '@/components/espacify/settings-view';
import { AuditView } from '@/components/espacify/audit-view';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { currentView, navigate } = useNavigation();
  const { isAuthenticated, token, isLoading, setAuth, clearAuth } = useAuth();

  // Auto-verify token on mount
  useEffect(() => {
    if (token && !isAuthenticated) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.data?.user) {
            setAuth(token, res.data.user);
          } else {
            clearAuth();
          }
        })
        .catch(() => clearAuth());
    }
  }, [token, isAuthenticated, setAuth, clearAuth]);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && ['landing', 'login', 'register'].includes(currentView)) {
      navigate('dashboard');
    } else if (!isAuthenticated && !['landing', 'login', 'register'].includes(currentView)) {
      navigate('landing');
    }
  }, [isAuthenticated, currentView, navigate, isLoading]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Public views
  if (!isAuthenticated) {
    if (currentView === 'login' || currentView === 'register') {
      return <AuthPage />;
    }
    return <LandingPage />;
  }

  // Authenticated views with app shell
  return (
    <AppShell>
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'projects' && <ProjectsView />}
      {currentView === 'project-create' && <ProjectCreateView />}
      {currentView === 'project-detail' && <ProjectDetailView />}
      {currentView === 'documents' && <DocumentsView />}
      {currentView === 'profile' && <ProfileView />}
      {currentView === 'settings' && <SettingsView />}
      {currentView === 'audit' && <AuditView />}
    </AppShell>
  );
}
