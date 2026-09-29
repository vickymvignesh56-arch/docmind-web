import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../../common/Button/Button';
import './ChatHeader.css';

export const ChatHeader = ({ app, currentChat, onNewChat }) => {
  const navigate = useNavigate();

  const chatTitle = currentChat?.title || 'New Conversation';
  const appTitle = app?.name || 'AI Assistant';

  return (
    <div className="chat-header-bar">
      <div className="chat-header-info">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/apps/${app?.id || ''}`)}
          title="Back to App details"
          style={{ padding: '6px' }}
        >
          <ArrowLeft size={16} />
        </button>

        <div className="chat-header-icon">
          <Bot size={18} />
        </div>

        <div className="chat-header-titles">
          <div className="flex items-center gap-2">
            <span className="chat-header-app-name">{appTitle}</span>
            <span className="badge badge-default" style={{ fontSize: '0.6875rem' }}>
              RAG Workspace
            </span>
          </div>
          <span className="chat-header-chat-title">{chatTitle}</span>
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
