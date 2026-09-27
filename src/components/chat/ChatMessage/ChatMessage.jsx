import React, { useState } from 'react';
import { Copy, Check, User } from 'lucide-react';
import { RagFishLogo } from '../../common/RagFishLogo';
import { formatDate } from '../../../utils/formatters';
import './ChatMessage.css';

export const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`chat-msg-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`chat-msg-avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? <User size={18} /> : <RagFishLogo size={28} withText={false} />}
      </div>

      <div className="chat-msg-bubble-container">
        <div className={`chat-msg-bubble ${isUser ? 'user' : 'assistant'}`}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        </div>

        <div className="chat-msg-meta">
          <span>{formatDate(message.createdAt)}</span>
          {!isUser && (
            <button
              type="button"
              className="chat-copy-btn"
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy response'}
            >
              {copied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
