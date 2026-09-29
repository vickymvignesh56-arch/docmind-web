import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appApi } from '../../services/appApi';
import { channelApi } from '../../services/channelApi';
import { appChannelApi } from '../../services/appChannelApi';
import { resourceApi } from '../../services/resourceApi';
import { useChat } from '../../hooks/useChat';
import { ChatSidebar } from '../../components/chat/ChatSidebar/ChatSidebar';
import { ChatHeader } from '../../components/chat/ChatHeader/ChatHeader';
import { ChatWindow } from '../../components/chat/ChatWindow/ChatWindow';
import { Loader } from '../../components/common/Loader/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { AppContext } from '../../context/AppContext';
import { validateFile } from '../../utils/validators';
import './Chat.css';

export const Chat = () => {
  const { appId, chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  const { showConfirm, toast } = useContext(AppContext);

  const [app, setApp] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  // App mapped resources for in-chat display & RAG visibility
  const [appResources, setAppResources] = useState([]);
  const [inFlightUpload, setInFlightUpload] = useState(null);
  const isUploadingRef = useRef(false);

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

  // Load app details and its mapped channel resources
  const fetchAppAndResources = useCallback(async () => {
    if (!appId) return;
    setAppLoading(true);
    setAppError(null);
    try {
      const data = await appApi.getAppDetails(appId);
      setApp(data);

      // Collect all resources mapped to this app
      const mappedDocs = [];
      if (Array.isArray(data?.userAppChannels)) {
        for (const ac of data.userAppChannels) {
          if (Array.isArray(ac.resources)) {
            for (const r of ac.resources) {
              const resObj = r.channelResource || r;
              if (resObj && !mappedDocs.some((existing) => existing.id === resObj.id)) {
                mappedDocs.push(resObj);
              }
            }
          }
        }
      }
      setAppResources(mappedDocs);
    } catch (err) {
      setAppError(err.message);
    } finally {
      setAppLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchAppAndResources();
  }, [fetchAppAndResources]);

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

  // Handle sending a message: first message navigates to real chatId exactly once
  const handleSendMessage = async (text) => {
    const result = await sendMessage(text);
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

  // In-Context Document Upload (Sections 15, 16, 17, 18, 19, 57, 58)
  // ZERO REDIRECTS! STAYS IN CHAT! NO PAGE RELOAD! IDEMPOTENT!
  const handleInChatUpload = async (file) => {
    if (!file || isUploadingRef.current) return;

    // 1. Client file validation
    const validationErr = validateFile(file);
    if (validationErr) {
      toast?.error(validationErr, 'File Validation');
      return;
    }

    // 2. Idempotency Check (Section 17): Check if file already exists in this app's knowledge
    const existing = appResources.find(
      (r) => r.fileName?.toLowerCase() === file.name.toLowerCase()
    );
    if (existing) {
      toast?.info(`"${file.name}" is already indexed in this application's knowledge base.`);
      setInFlightUpload({
        fileName: existing.fileName,
        size: existing.size,
        status: 'ready',
      });
      setTimeout(() => setInFlightUpload(null), 3500);
      return;
    }

    // 3. Mark in-flight upload state
    isUploadingRef.current = true;
    setInFlightUpload({
      fileName: file.name,
      size: file.size,
      status: 'uploading',
    });

    try {
      // 4. Resolve destination channel & appChannel mapping
      let targetChannelId = null;
      let targetAppChannelId = null;

      if (app?.userAppChannels && app.userAppChannels.length > 0) {
        targetChannelId = app.userAppChannels[0].channelId;
        targetAppChannelId = app.userAppChannels[0].id;
      } else {
        // Query existing channels
        const allChannels = await channelApi.getChannels();
        if (allChannels && allChannels.length > 0) {
          targetChannelId = allChannels[0].id;
        } else {
          // Create default repository channel for this app
          const createdChannel = await channelApi.createChannel({
            name: `${app?.name || 'Workspace'} Knowledge`,
            description: `Auto-configured knowledge repository for ${app?.name || 'DocMind'}`,
            channelType: 'files',
          });
          targetChannelId = createdChannel.id;
        }
        // Map to app
        const appChannelRecord = await appChannelApi.addAppChannel(appId, targetChannelId);
        targetAppChannelId = appChannelRecord.id;
      }

      // 5. Upload file to channel
      const uploadedResource = await resourceApi.uploadResource(targetChannelId, file);

      // Transition to processing state
      setInFlightUpload({
        fileName: file.name,
        size: file.size,
        status: 'processing',
        id: uploadedResource.id,
      });

      // 6. Map uploaded resource to app channel
      try {
        await appChannelApi.addAppChannelResource(
          appId,
          targetAppChannelId,
          uploadedResource.id
        );
      } catch (mapErr) {
        console.warn('Auto-mapping warning:', mapErr.message);
      }

      // 7. Poll resource processing status until completed
      let pollCount = 0;
      const MAX_POLLS = 30; // 30 * 2.5s = ~75s
      const pollTimer = setInterval(async () => {
        pollCount++;
        try {
          const latestResources = await resourceApi.getResources(targetChannelId);
          const currentStatus = latestResources.find((r) => r.id === uploadedResource.id);

          if (
            currentStatus?.status === 'ready' ||
            currentStatus?.status === 'completed' ||
            pollCount >= MAX_POLLS
          ) {
            clearInterval(pollTimer);
            setInFlightUpload({
              fileName: file.name,
              size: file.size,
              status: 'ready',
              id: uploadedResource.id,
            });
            // Refresh app resources
            await fetchAppAndResources();
            toast?.success(`"${file.name}" indexed and ready for questions!`);
            setTimeout(() => setInFlightUpload(null), 3500);
          } else if (currentStatus?.status === 'failed') {
            clearInterval(pollTimer);
            setInFlightUpload({
              fileName: file.name,
              size: file.size,
              status: 'failed',
              error: currentStatus.error || 'Vector indexing failed',
            });
            toast?.error(`Failed to process "${file.name}"`);
          }
        } catch {
          // ignore transient poll error
        }
      }, 2500);
    } catch (uploadErr) {
      setInFlightUpload({
        fileName: file.name,
        size: file.size,
        status: 'failed',
        error: uploadErr.message,
      });
      toast?.error(uploadErr.message, 'Upload Failed');
    } finally {
      isUploadingRef.current = false;
    }
  };

  if (appLoading) {
    return <Loader message="Connecting to AI assistant workspace..." />;
  }

  if (appError || !app) {
    return (
      <ErrorMessage
        title="Application Unavailable"
        message={appError || 'Could not connect to the specified application.'}
        onRetry={fetchAppAndResources}
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
          onUploadFile={handleInChatUpload}
          inFlightUpload={inFlightUpload}
          appResources={appResources}
        />
      </div>
    </div>
  );
};
