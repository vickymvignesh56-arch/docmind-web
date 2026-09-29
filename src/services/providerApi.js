import api from './api';

export const providerApi = {
  // Create or update LLM provider configuration
  upsertProvider: async ({ provider, apiKey, embeddingModel, chatModel, isActive }) => {
    const payload = {
      provider,
      embeddingModel,
      chatModel,
    };
    if (apiKey && apiKey.trim()) {
      payload.apiKey = apiKey.trim();
    }
    if (typeof isActive === 'boolean') {
      payload.isActive = isActive;
    }
    const response = await api.put('/llm-provider', payload);
    const data = response.data?.data || response.data || {};
    if (response.data?.message && typeof data === 'object') {
      data.message = response.data.message;
    }
    return data;
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

  // Activate or deactivate provider (PUT /api/llm-provider/status with { isActive: boolean })
  updateStatus: async (isActive) => {
    const payload = {
      isActive: Boolean(isActive),
    };
    const response = await api.put('/llm-provider/status', payload);
    const data = response.data?.data || response.data || {};
    if (response.data?.message && typeof data === 'object') {
      data.message = response.data.message;
    }
    return data;
  },
};
