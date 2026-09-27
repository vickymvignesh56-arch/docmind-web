import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appApi } from '../../services/appApi';
import { useChat } from '../../hooks/useChat';
import { ChatSidebar } from '../../components/chat/ChatSidebar/ChatSidebar';
import { ChatHeader } from '../../components/chat/ChatHeader/ChatHeader';
import { ChatWindow } from '../../components/chat/ChatWindow/ChatWindow';
import { Loader } from '../../components/common/Loader/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { AppContext } from '../../context/AppContext';
import './Chat.css';

export const Chat = () => {
  const { appId, chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  const { showConfirm } = useContext(AppContext);

  const [app, setApp] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  // useChat hook manages state machine for chats history, active chat, and message stream
  const {
    chats,
    activeChatId,
    activeChat,
    messages,
    loadingChats,
    loadingMessages,
    sending,
    sendMessage,
    selectChat,
    startNewChat,
    updateChat,
    deleteChat,
  } = useChat(appId, urlChatId);

  // Load app details
  const fetchApp = useCallback(async () => {
    setAppLoading(true);
    setAppError(null);
    try {
      const data = await appApi.getAppDetails(appId);
      setApp(data);
    } catch (err) {
      setAppError(err.message);
    } finally {
      setAppLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    if (appId) {
      fetchApp();
    }
  }, [appId, fetchApp]);

  // Synchronize browser back/forward or direct URL changes
  useEffect(() => {
    if (urlChatId) {
      if (urlChatId !== activeChatId) {
        selectChat(urlChatId);
      }
    } else if (activeChatId !== null) {
      startNewChat();
    }
  }, [urlChatId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle URL chat no longer existing after chats load
  useEffect(() => {
    if (urlChatId && !loadingChats && chats.length > 0) {
      const exists = chats.some((c) => c.id === urlChatId);
      if (!exists) {
        startNewChat();
        navigate(`/apps/${appId}/chat`, { replace: true });
      }
    }
  }, [urlChatId, loadingChats, chats, appId, navigate, startNewChat]);

  // Handle sending a message
  const handleSendMessage = async (text) => {
    const result = await sendMessage(text);
    // If a new conversation was created, synchronize URL with the returned real chatId
    if (result?.chatId && !urlChatId) {
      navigate(`/apps/${appId}/chat/${result.chatId}`, { replace: true });
    }
  };

  // Start new chat: ZERO backend API calls, clears messages and activeChatId
  const handleNewChat = () => {
    startNewChat();
    navigate(`/apps/${appId}/chat`);
  };

  // Select existing chat from history
  const handleSelectChat = (selectedId) => {
    if (selectedId === activeChatId) return;
    selectChat(selectedId);
    navigate(`/apps/${appId}/chat/${selectedId}`);
  };

  // Pin/Unpin chat
  const handlePinChat = async (targetChatId, isPinned) => {
    await updateChat(targetChatId, { isPinned });
  };

  // Rename chat
  const handleRenameChat = async (targetChatId, title) => {
    await updateChat(targetChatId, { title });
  };

  // Delete chat
  const handleDeleteChat = (chatToDelete) => {
    showConfirm({
      title: `Delete conversation "${chatToDelete.title || 'Untitled'}"?`,
      message: 'This conversation and all its message history will be permanently deleted.',
      confirmText: 'Delete Chat',
      onConfirm: async () => {
        const wasActive = activeChatId === chatToDelete.id;
        await deleteChat(chatToDelete.id);
        if (wasActive) {
          navigate(`/apps/${appId}/chat`);
        }
      },
    });
  };

  if (appLoading) {
    return <Loader message="Connecting to AI assistant workspace..." />;
  }

  if (appError || !app) {
    return (
      <ErrorMessage
        title="Application Unavailable"
        message={appError || 'Could not connect to the specified application.'}
        onRetry={fetchApp}
      />
    );
  }

  return (
    <div className="chat-page-container">
      {/* Left Chat History Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        loadingChats={loadingChats}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onPinChat={handlePinChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Stream Column */}
      <div className="chat-main-column">
        <ChatHeader
          app={app}
          currentChat={activeChat}
          onNewChat={handleNewChat}
        />

        <ChatWindow
          messages={messages}
          loading={loadingMessages}
          sending={sending}
          onSendMessage={handleSendMessage}
          appName={app.name}
          activeChatId={activeChatId}
        />
      </div>
    </div>
  );
};
