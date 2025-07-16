'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api-client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateAuthState = async () => {
      const token = Cookies.get('token');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Validate token with backend
        await authApi.validateToken();
        setIsAuthenticated(true);
      } catch (error) {
        console.warn('Token validation failed:', error);
        // Clear invalid token
        Cookies.remove('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuthState();
  }, []);

  // Set up axios interceptor to handle 401 responses globally
  useEffect(() => {
    const interceptor = authApi.setupAuthInterceptor(() => {
      // This callback runs when a 401 is received
      Cookies.remove('token');
      setIsAuthenticated(false);
      router.push('/login');
    });

    return () => {
      // Clean up interceptor on unmount
      interceptor();
    };
  }, [router]);

  const login = (token: string) => {
    // Make sure the token is set in cookies
    Cookies.set('token', token, { expires: 1 });
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn(
        'Backend logout failed, but continuing frontend logout',
        err
      );
    }

    Cookies.remove('token');
    window.localStorage.clear();
    window.sessionStorage.clear();
    setIsAuthenticated(false);
    router.push('/login?loggedOut=true');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}