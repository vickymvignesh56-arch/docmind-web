import { useState, useEffect, useCallback, useContext } from 'react';
import { chatApi } from '../services/chatApi';
import { AppContext } from '../context/AppContext';

// Helper to normalize message objects from backend or optimistically generated
export const normalizeMessage = (msg) => ({
  id: msg?.id || 'msg-' + Math.random().toString(36).substring(2, 9),
  chatId: msg?.chatId || null,
  role: msg?.role || (msg?.sender === 'user' ? 'user' : 'assistant'),
  content: msg?.content || msg?.answer || msg?.message || msg?.text || '',
  createdAt: msg?.createdAt || new Date().toISOString(),
});

export const useChat = (appId, initialChatId = null) => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(Boolean(appId));
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const appContext = useContext(AppContext);
  const toast = appContext?.toast;

  // Fetch list of chats for the app from backend
  const fetchChats = useCallback(async () => {
    if (!appId) return [];
    setLoadingChats(true);
    try {
      const data = await chatApi.getChats(appId);
      // Sort pinned chats first, then newest createdAt descending
      const sorted = (data || []).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setChats(sorted);
      return sorted;
    } catch (err) {
      console.warn('Failed to load chat history:', err.message);
      setChats([]);
      return [];
    } finally {
      setLoadingChats(false);
    }
  }, [appId]);

  // Start a new conversation state - STRICTLY NO BACKEND CALL!
  const startNewChat = useCallback(() => {
    setActiveChatId(null);
    setActiveChat(null);
    setMessages([]);
    setLoadingMessages(false);
    setError(null);
  }, []);

  // Fetch messages for a specific existing chat
  const fetchMessages = useCallback(
    async (chatIdToFetch) => {
      const targetId = chatIdToFetch || activeChatId;
      if (!appId || !targetId) {
        setMessages([]);
        setLoadingMessages(false);
        return [];
      }

      setLoadingMessages(true);
      try {
        const rawData = await chatApi.getChatMessages(appId, targetId);
        const normalized = (rawData || []).map(normalizeMessage);
        setMessages(normalized);
        return normalized;
      } catch (err) {
        console.warn('Failed to load messages for chat:', err.message);
        setMessages([]);
        return [];
      } finally {
        setLoadingMessages(false);
      }
    },
    [appId, activeChatId]
  );

  // Select an existing chat from history
  const selectChat = useCallback(
    async (chatIdToSelect) => {
      if (!chatIdToSelect) {
        startNewChat();
        return;
      }
      setActiveChatId(chatIdToSelect);
      const found = chats.find((c) => c.id === chatIdToSelect);
      if (found) {
        setActiveChat(found);
      }
      setMessages([]); // Clear current messages before loading to prevent bleed-through
      await fetchMessages(chatIdToSelect);
    },
    [chats, fetchMessages, startNewChat]
  );

  // Initial load: Fetch chat history
  useEffect(() => {
    if (appId) {
      fetchChats();
    }
  }, [appId, fetchChats]);

  // Keep activeChat object synchronized with chats array
  useEffect(() => {
    if (activeChatId) {
      const match = chats.find((c) => c.id === activeChatId);
      if (match) {
        setActiveChat(match);
      }
    } else {
      setActiveChat(null);
    }
  }, [chats, activeChatId]);

  // If initialChatId was provided, load its messages
  useEffect(() => {
    if (initialChatId) {
      selectChat(initialChatId);
    } else {
      startNewChat();
    }
  }, [initialChatId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send message state machine
  const sendMessage = useCallback(
    async (messageText) => {
      const trimmed = messageText?.trim();
      if (!trimmed || sending) return null;

      setSending(true);
      setError(null);

      const isNewChat = !activeChatId;
      const currentChatId = activeChatId;

      // Optimistic user message for immediate UI feedback
      const tempUserMsg = {
        id: 'temp-' + Date.now(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      try {
        // CASE 1: New conversation -> DO NOT send chatId (chatId is null)
        // CASE 2: Existing conversation -> Send activeChatId
        const responseData = await chatApi.sendMessage(
          appId,
          trimmed,
          isNewChat ? null : currentChatId
        );

        const resolvedChatId = responseData?.chatId || currentChatId;

        // Assistant response message
        const assistantMsg = {
          id: responseData?.id || 'res-' + Date.now(),
          chatId: resolvedChatId,
          role: 'assistant',
          content: responseData?.answer || responseData?.content || '',
          createdAt: responseData?.createdAt || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // If this was a new chat, immediately store the returned real backend chatId
        if (isNewChat && resolvedChatId) {
          setActiveChatId(resolvedChatId);
          // Refresh backend chat history so new chat item appears
          const refreshedChats = await fetchChats();
          const newlyCreatedChat = (refreshedChats || []).find((c) => c.id === resolvedChatId);
          if (newlyCreatedChat) {
            setActiveChat(newlyCreatedChat);
          } else {
            setActiveChat({
              id: resolvedChatId,
              title: responseData?.title || trimmed.slice(0, 30),
              createdAt: new Date().toISOString(),
            });
          }
        }

        return responseData;
      } catch (err) {
        // Backend error (e.g. "No active LLM provider configured")
        // STRICT REQUIREMENT 16:
        // Do NOT use toast for chat errors.
        // Do NOT show a red error box.
        // Display as a normal temporary assistant-style chat message.
        // Do NOT persist that error as a ChatMessage.
        // If before real chat exists, keep activeChatId as null.
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.data?.answer ||
          err.response?.data?.error ||
          err.message ||
          "Sorry, I couldn't process your request. Please try again.";

        const assistantErrorMsg = {
          id: 'res-err-' + Date.now(),
          role: 'assistant',
          content: errorMessage,
          createdAt: new Date().toISOString(),
          isError: true,
        };

        setMessages((prev) => [...prev, assistantErrorMsg]);
        return null;
      } finally {
        setSending(false);
      }
    },
    [appId, activeChatId, sending, fetchChats]
  );

  // Pin or Rename chat via existing PUT /api/user/app/:appId/chat/:chatId
  const updateChat = useCallback(
    async (chatIdToUpdate, updateData) => {
      try {
        const updated = await chatApi.updateChat(appId, chatIdToUpdate, updateData);
        setChats((prev) =>
          prev
            .map((c) => (c.id === chatIdToUpdate ? { ...c, ...updateData, ...(updated || {}) } : c))
            .sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.createdAt) - new Date(a.createdAt);
            })
        );
        if (activeChatId === chatIdToUpdate) {
          setActiveChat((prev) => (prev ? { ...prev, ...updateData, ...(updated || {}) } : prev));
        }
        if (updateData.isPinned !== undefined) {
          toast?.success(updateData.isPinned ? 'Chat pinned' : 'Chat unpinned');
        } else if (updateData.title) {
          toast?.success('Chat renamed successfully');
        }
        return updated;
      } catch (err) {
        toast?.error(err.message, 'Update Failed');
        throw err;
      }
    },
    [appId, activeChatId, toast]
  );

  // Delete chat via existing DELETE /api/user/app/:appId/chat/:chatId
  const deleteChat = useCallback(
    async (chatIdToDelete) => {
      try {
        await chatApi.deleteChat(appId, chatIdToDelete);
        setChats((prev) => prev.filter((c) => c.id !== chatIdToDelete));
        if (activeChatId === chatIdToDelete) {
          startNewChat();
        }
        toast?.success('Chat deleted successfully');
        return true;
      } catch (err) {
        toast?.error(err.message, 'Delete Chat Failed');
        throw err;
      }
    },
    [appId, activeChatId, startNewChat, toast]
  );

  return {
    chats,
    activeChatId,
    activeChat,
    messages,
    loadingChats,
    loadingMessages,
    sending,
    error,
    fetchChats,
    fetchMessages,
    selectChat,
    startNewChat,
    sendMessage,
    updateChat,
    deleteChat,
    clearError: () => setError(null),
  };
};
