import api from './api';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/user-profile');
    return response.data?.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/user-profile', userData);
    const data = response.data?.data || response.data || {};
    if (userData.avatar !== undefined && data.avatar === undefined) {
      data.avatar = userData.avatar;
    }
    return data;
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    try {
      // 1. First call existing /user-profile/change-password API
      const response = await api.put('/user-profile/change-password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (err) {
      // 2. If endpoint returns 404 on the backend, verify credentials and update password via /user-profile
      if (err.status === 404) {
        const user = storage.getUser();
        if (user?.email && oldPassword) {
          try {
            await axios.post(`${API_BASE_URL}/auth/login`, {
              email: user.email,
              password: oldPassword,
            });
          } catch (loginErr) {
            const loginStatus = loginErr.response?.status;
            if (loginStatus === 400 || loginStatus === 401) {
              const customErr = new Error('Current password is incorrect');
              customErr.status = 400;
              throw customErr;
            }
          }
        }

        const updateRes = await api.put('/user-profile', {
          password: newPassword,
        });
        return updateRes.data;
      }
      throw err;
    }
  },
};


