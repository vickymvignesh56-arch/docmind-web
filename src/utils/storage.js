import { AUTH_TOKEN_KEY, USER_INFO_KEY } from './constants';

export const storage = {
  getToken: () => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to save token to storage', e);
    }
  },

  clearToken: () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {
      console.error('Failed to clear token', e);
    }
  },

  getUser: () => {
    try {
      const data = localStorage.getItem(USER_INFO_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_INFO_KEY);
      }
    } catch (e) {
      console.error('Failed to save user to storage', e);
    }
  },

  clearAll: () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};
