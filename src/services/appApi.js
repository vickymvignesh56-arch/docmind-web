import api from './api';

export const appApi = {
  createApp: async (appData) => {
    const payload = {
      name: appData.name,
      description: appData.description || '',
      systemPrompt: appData.systemPrompt || '',
      status: appData.status !== undefined ? appData.status : true,
      llmProvider: appData.llmProvider !== undefined ? appData.llmProvider : false,
    };
    const response = await api.post('/apps', payload);
    return response.data?.data;
  },

  getApps: async () => {
    const response = await api.get('/apps');
    return response.data?.data || [];
  },

  getAppDetails: async (id) => {
    const response = await api.get(`/apps/${id}`);
    return response.data?.data;
  },

  updateApp: async (id, appData) => {
    const response = await api.put(`/apps/${id}`, appData);
    return response.data?.data;
  },

  deleteApp: async (id) => {
    const response = await api.delete(`/apps/${id}`);
    return response.data;
  },
};
