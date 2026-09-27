import api from './api';

export const channelApi = {
  createChannel: async (channelData) => {
    const payload = {
      name: channelData.name,
      description: channelData.description || '',
      channelType: channelData.channelType || 'files',
    };
    const response = await api.post('/channels', payload);
    return response.data?.data;
  },

  getChannels: async () => {
    try {
      const response = await api.get('/channels');
      return response.data?.data || [];
    } catch (error) {
      // Backend returns 404 when no channels exist
      if (error.status === 404 || error.message?.includes('No channels found')) {
        return [];
      }
      throw error;
    }
  },

  getChannelById: async (id) => {
    try {
      const response = await api.get(`/channels/${id}`);
      return response.data?.data;
    } catch (error) {
      // Known Backend Issue Handling:
      // In ChannelController.ts, @Get("/:id") has @Param("channelId"), causing req.params.channelId to be undefined.
      // As a client-side recovery to prevent crashing, look up the channel from getChannels list:
      const allChannels = await channelApi.getChannels();
      const found = allChannels.find((c) => c.id === id);
      if (found) {
        return found;
      }
      throw error;
    }
  },

  updateChannel: async (id, channelData) => {
    const response = await api.put(`/channels/${id}`, {
      name: channelData.name,
      description: channelData.description,
    });
    return response.data?.data;
  },

  deleteChannel: async (channelId) => {
    // Route in backend is DELETE /channels/:channelId
    const response = await api.delete(`/channels/${channelId}`);
    return response.data;
  },
};
