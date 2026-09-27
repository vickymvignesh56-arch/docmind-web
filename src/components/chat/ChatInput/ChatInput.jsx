import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../common/Button/Button';
import './ChatInput.css';

export const ChatInput = ({
  onSend,
  sending = false,
  activeChatId = null,
  placeholder = 'Ask something about your knowledge...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-clear input when active conversation changes or resets to new chat
  useEffect(() => {
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [activeChatId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || sending) return;
    onSend(message.trim());
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-box">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={sending}
          className="chat-textarea"
        />

        <Button
          variant="primary"
          size="sm"
          icon={Send}
          onClick={handleSend}
          disabled={!message.trim() || sending}
          loading={sending}
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
