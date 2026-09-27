import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../ChatMessage/ChatMessage';
import { ChatInput } from '../ChatInput/ChatInput';
import { RagFishLogo } from '../../common/RagFishLogo';
import { Loader } from '../../common/Loader/Loader';
import './ChatWindow.css';

export const ChatWindow = ({
  messages = [],
  loading = false,
  sending = false,
  onSendMessage,
  appName = 'DocMind Assistant',
  activeChatId = null,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  return (
    <div className="chat-window">
      <div className="chat-messages-area">
        {loading ? (
          <div style={{ margin: 'auto' }}>
            <Loader message="Loading chat conversation..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">🐟</div>
            <h2 className="chat-empty-title">How can I help?</h2>
            <p className="chat-empty-subtitle">
              Ask questions about your connected knowledge base and {appName} will generate accurate, cited answers.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {sending && (
              <div className="thinking-indicator">
                <RagFishLogo size={20} withText={false} />
                <span className="thinking-text">DocMind is thinking...</span>
                <div className="thinking-dots">
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput
        onSend={onSendMessage}
        sending={sending}
        activeChatId={activeChatId}
      />
    </div>
  );
};
