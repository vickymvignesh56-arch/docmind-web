import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  MoreVertical,
} from 'lucide-react';
import { Button } from '../../common/Button/Button';
import { Loader } from '../../common/Loader/Loader';
import { formatRelativeTime } from '../../../utils/formatters';
import './ChatSidebar.css';

export const ChatSidebar = ({
  chats = [],
  activeChatId = null,
  loadingChats = false,
  onSelectChat,
  onNewChat,
  onPinChat,
  onRenameChat,
  onDeleteChat,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuDirection, setMenuDirection] = useState('down');

  const pinnedChats = chats.filter((c) => c.isPinned);
  const recentChats = chats.filter((c) => !c.isPinned);

  // Close 3-dot dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const toggleMenu = (chatId, e) => {
    e.stopPropagation();
    if (openMenuId === chatId) {
      setOpenMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      if (window.innerHeight - rect.bottom < 150) {
        setMenuDirection('up');
      } else {
        setMenuDirection('down');
      }
      setOpenMenuId(chatId);
    }
  };

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingId(chat.id);
    setEditTitle(chat.title || 'Untitled');
  };

  const saveEditing = (chatId, e) => {
    e?.stopPropagation();
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRenameChat(chatId, trimmed);
    }
    setEditingId(null);
  };

  const cancelEditing = (e) => {
    e?.stopPropagation();
    setEditingId(null);
  };

  const handleTogglePin = (chat, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    onPinChat(chat.id, !chat.isPinned);
  };

  const handleDelete = (chat, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    onDeleteChat(chat);
  };

  const renderChatItem = (chat) => {
    const isActive = chat.id === activeChatId;
    const isEditing = chat.id === editingId;
    const isMenuOpen = openMenuId === chat.id;

    return (
      <div
        key={chat.id}
        className={`chat-item ${isActive ? 'active' : ''} ${chat.isPinned ? 'pinned-item' : ''}`}
        onClick={() => {
          if (!isEditing) {
            onSelectChat(chat.id);
          }
        }}
      >
        <div className="chat-item-title-box">
          {chat.isPinned ? (
            <Pin size={14} className="chat-pin-icon" style={{ flexShrink: 0 }} />
          ) : (
            <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
          )}

          {isEditing ? (
            <div className="chat-item-edit-box" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditing(chat.id, e);
                  if (e.key === 'Escape') cancelEditing(e);
                }}
                autoFocus
                className="input-field chat-edit-input"
              />
              <button
                type="button"
                className="chat-item-action-btn"
                onClick={(e) => saveEditing(chat.id, e)}
                title="Save"
              >
                <Check size={13} color="var(--color-success)" />
              </button>
              <button
                type="button"
                className="chat-item-action-btn"
                onClick={cancelEditing}
                title="Cancel"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div className="chat-item-info">
              <span className="chat-item-title">{chat.title || 'Untitled Chat'}</span>
              {chat.createdAt && (
                <span className="chat-item-time">{formatRelativeTime(chat.createdAt)}</span>
              )}
            </div>
          )}
        </div>

        {/* 3-Dot More Actions Menu */}
        {!isEditing && (
          <div className="chat-item-actions-wrapper" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`chat-item-menu-btn ${isMenuOpen ? 'active' : ''}`}
              onClick={(e) => toggleMenu(chat.id, e)}
              title="More options"
            >
              <MoreVertical size={14} />
            </button>

            {isMenuOpen && (
              <div className={`chat-item-dropdown ${menuDirection}`}>
                <button
                  type="button"
                  className="chat-dropdown-item"
                  onClick={(e) => startEditing(chat, e)}
                >
                  <Edit2 size={13} />
                  <span>Rename</span>
                </button>

                <button
                  type="button"
                  className="chat-dropdown-item"
                  onClick={(e) => handleTogglePin(chat, e)}
                >
                  {chat.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                  <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                </button>

                <button
                  type="button"
                  className="chat-dropdown-item danger"
                  onClick={(e) => handleDelete(chat, e)}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            Chat History
          </h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={onNewChat}
          className="w-full"
        >
          New Conversation
        </Button>
      </div>

      <div className="chat-sidebar-list">
        {loadingChats ? (
          <div className="chat-sidebar-loading">
            <Loader inline size={16} message="Loading history..." />
          </div>
        ) : chats.length === 0 ? (
          <div className="chat-sidebar-empty">
            <p className="chat-sidebar-empty-title">No conversations yet.</p>
            <p className="chat-sidebar-empty-desc">Start a new chat to begin.</p>
          </div>
        ) : (
          <>
            {pinnedChats.length > 0 && (
              <div className="chat-history-section">
                <div className="chat-date-group-title">Pinned</div>
                {pinnedChats.map(renderChatItem)}
              </div>
            )}

            {recentChats.length > 0 && (
              <div className="chat-history-section">
                <div className="chat-date-group-title">Recent</div>
                {recentChats.map(renderChatItem)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
