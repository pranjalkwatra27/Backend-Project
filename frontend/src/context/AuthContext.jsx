import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('kuvora_token') || localStorage.getItem('talentpulse_token') || null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('kuvora_token') || localStorage.getItem('talentpulse_token');
      if (storedToken) {
        try {
          const res = await apiClient('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.token) {
      localStorage.setItem('kuvora_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (userData) => {
    const res = await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (res.success && res.token) {
      localStorage.setItem('kuvora_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const demoLogin = async (role = 'candidate') => {
    const res = await apiClient('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });

    if (res.success && res.token) {
      localStorage.setItem('kuvora_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('kuvora_token');
    localStorage.removeItem('talentpulse_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.warn('[Auth] Failed to refresh user:', err.message);
    }
  };

  const toggleSavedJob = async (jobId) => {
    try {
      const res = await apiClient(`/profile/save-job/${jobId}`, { method: 'POST' });
      if (res.success && user) {
        setUser({
          ...user,
          savedJobs: res.savedJobs,
        });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const isJobSaved = (jobId) => {
    if (!user || !user.savedJobs) return false;
    return user.savedJobs.some((id) => (typeof id === 'string' ? id === jobId : id._id === jobId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        toggleSavedJob,
        isJobSaved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
