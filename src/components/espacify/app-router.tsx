'use client';

import { useNavigation, useAuth } from '@/store';
import { useEffect } from 'react';

export function AppRouter() {
  const { currentView, navigate } = useNavigation();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (token && !isAuthenticated) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.data?.user) {
            useAuth.getState().setAuth(token, res.data.user);
          } else {
            useAuth.getState().clearAuth();
          }
        })
        .catch(() => {
          useAuth.getState().clearAuth();
        });
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && (currentView === 'landing' || currentView === 'login' || currentView === 'register')) {
      navigate('dashboard');
    } else if (!isAuthenticated && currentView !== 'landing' && currentView !== 'login' && currentView !== 'register') {
      navigate('landing');
    }
  }, [isAuthenticated, currentView, navigate]);

  return null;
}

export default AppRouter;
