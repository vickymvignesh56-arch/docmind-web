import api from './api';

export const appChannelApi = {
  // Map an independent Channel to an App (creates UserAppChannel)
  addAppChannel: async (appId, channelId) => {
    const response = await api.post(`/apps/${appId}/channel`, {
      channelId,
    });
    return response.data?.data;
  },

  // Get details of a mapped AppChannel (including channel entity and resources relation)
  getAppChannel: async (appId, appChannelId) => {
    const response = await api.get(`/apps/${appId}/channel/${appChannelId}`);
    return response.data?.data;
  },

  // Map a specific ChannelResource to an AppChannel (creates UserAppChannelResource)
  addAppChannelResource: async (appId, appChannelId, channelResourceId) => {
    const response = await api.post(`/apps/${appId}/channel/${appChannelId}/resource`, {
      channelResourceId,
    });
    return response.data?.data;
  },

  // Retrieve an individual mapped resource (backend uses POST for this endpoint)
  getAppChannelResource: async (appId, appChannelId, channelResourceId) => {
    const response = await api.post(
      `/apps/${appId}/channel/${appChannelId}/resource/${channelResourceId}`
    );
    return response.data?.data;
  },
};
