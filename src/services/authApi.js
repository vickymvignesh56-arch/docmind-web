import api from './api';

export const authApi = {
  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async ({ name, email, password }) => {
    // Backend requires isActive: true explicitly in UserRequest
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      isActive: true,
    });
    return response.data;
  },
};
