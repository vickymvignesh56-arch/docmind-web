import React, { createContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../services/authApi';
import { userApi } from '../services/userApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = storage.getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await userApi.getProfile();
        setUser(profile);
        storage.setUser(profile);
      } catch (error) {
        // If profile fetch fails (e.g. expired or invalid token), clear session
        console.warn('Session restoration failed:', error.message);
        storage.clearAll();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await authApi.login({ email, password });
    if (response.token) {
      storage.setToken(response.token);
      setToken(response.token);

      const userData = response.data;
      storage.setUser(userData);
      setUser(userData);
      return response;
    }
    throw new Error('Authentication succeeded but no token returned');
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const response = await authApi.register({ name, email, password });
    return response;
  }, []);

  const logout = useCallback(() => {
    storage.clearAll();
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  }, []);

  const updateProfileState = useCallback((updatedUserData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedUserData };
      storage.setUser(nextUser);
      return nextUser;
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    updateProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
