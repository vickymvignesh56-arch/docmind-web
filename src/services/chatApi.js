import api from './api';

export const chatApi = {
  // Send message: if chatId is omitted, backend creates a new chat session and returns new chatId
  sendMessage: async (appId, message, chatId = null) => {
    const payload = { message: message.trim() };
    if (chatId) {
      payload.chatId = chatId;
    }
    const response = await api.post(`/user/app/${appId}/chat`, payload);
    return response.data?.data || response.data;
  },

  // Get chat sessions for an app
  getChats: async (appId) => {
    try {
      const response = await api.get(`/user/app/${appId}/chat`);
      return response.data?.data || response.data || [];
    } catch (error) {
      // Backend throws "chat not found" if there are 0 chats
      if (
        error.message?.toLowerCase().includes('chat not found') ||
        error.message?.toLowerCase().includes('not found') ||
        error.status === 404 ||
        error.status === 500
      ) {
        return [];
      }
      throw error;
    }
  },

  // Get message history for a specific chat
  getChatMessages: async (appId, chatId) => {
    try {
      const response = await api.get(`/user/app/${appId}/chat/${chatId}/message`);
      return response.data?.data || response.data || [];
    } catch (error) {
      if (
        error.message?.toLowerCase().includes('chat not found') ||
        error.message?.toLowerCase().includes('not found') ||
        error.status === 404
      ) {
        return [];
      }
      throw error;
    }
  },

  // Delete a chat session
  deleteChat: async (appId, chatId) => {
    const response = await api.delete(`/user/app/${appId}/chat/${chatId}`);
    return response.data;
  },

  // Update chat title or pin status
  updateChat: async (appId, chatId, updateData) => {
    const payload = {};
    if (updateData.title !== undefined) {
      payload.title = updateData.title;
    }
    if (updateData.isPinned !== undefined) {
      payload.isPinned = updateData.isPinned;
    }
    const response = await api.put(`/user/app/${appId}/chat/${chatId}`, payload);
    return response.data?.data || response.data;
  },
};
