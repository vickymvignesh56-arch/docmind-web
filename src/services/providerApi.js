import api from './api';

export const providerApi = {
  // Create or update LLM provider configuration
  upsertProvider: async ({ provider, apiKey, embeddingModel, chatModel }) => {
    const payload = {
      provider,
      embeddingModel,
      chatModel,
    };
    if (apiKey && apiKey.trim()) {
      payload.apiKey = apiKey.trim();
    }
    const response = await api.put('/llm-provider', payload);
    return response.data?.data;
  },

  // Get configured LLM providers for current user
  getProvider: async () => {
    try {
      const response = await api.get('/llm-provider');
      const data = response.data?.data;
      return Array.isArray(data) ? data : data ? [data] : [];
    } catch (error) {
      if (
        error.message?.toLowerCase().includes('not configured') ||
        error.status === 404 ||
        error.status === 500
      ) {
        return [];
      }
      throw error;
    }
  },

  // Activate or deactivate provider
  updateStatus: async (isActive) => {
    const response = await api.put('/llm-provider/status', {
      isActive: Boolean(isActive),
    });
    return response.data?.data;
  },
};
