import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../../common/Button/Button';
import './ChatHeader.css';

export const ChatHeader = ({ app, currentChat, onNewChat }) => {
  const navigate = useNavigate();

  // Dynamic Chat Header:
  // If no active chat: Title: "New Conversation", Subtitle: "Start a new conversation"
  // If existing chat selected: Title: chat.title, Subtitle: "Conversation"
  const title = currentChat?.title ? currentChat.title : 'New Conversation';
  const subtitle = currentChat ? 'Conversation' : 'Start a new conversation';

  return (
    <div className="chat-header-bar">
      <div className="chat-header-info">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/apps/${app?.id || ''}`)}
          title="Back to App details"
          style={{ padding: '4px' }}
        >
          <ArrowLeft size={18} />
        </button>

        <div className="chat-header-icon">
          <Bot size={20} />
        </div>

        <div className="chat-header-titles">
          <span className="chat-header-app-name">{title}</span>
          <span className="chat-header-chat-title">{subtitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={onNewChat}
        >
          New Chat
        </Button>
      </div>
    </div>
  );
};
