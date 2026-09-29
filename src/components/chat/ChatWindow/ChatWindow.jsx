import React, { useRef, useEffect } from 'react';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
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
  onUploadFile,
  inFlightUpload = null,
  appResources = [],
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const examplePrompts = [
    'Summarize the core topics covered in the connected documents.',
    'What are the key policy requirements or guidelines?',
    'Extract key action items and critical findings.',
  ];

  return (
    <div className="chat-window">
      <div className="chat-messages-area">
        {loading ? (
          <div style={{ margin: 'auto' }}>
            <Loader message="Loading conversation history..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state animate-fade-in">
            <div className="chat-empty-icon-box">
              <RagFishLogo size={36} withText={false} />
            </div>

            <h2 className="chat-empty-title">How can I assist you?</h2>
            <p className="chat-empty-subtitle">
              Ask questions about your connected knowledge base. {appName} synthesizes grounded, cited responses from your vector embeddings.
            </p>

            <div className="chat-empty-examples">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  className="chat-example-card"
                  onClick={() => onSendMessage?.(prompt)}
                  disabled={sending}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span>{prompt}</span>
                  </div>
                  <ArrowRight size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {sending && (
              <div className="thinking-indicator">
                <RagFishLogo size={18} withText={false} />
                <span className="thinking-text">DocMind is analyzing knowledge...</span>
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
        onUploadFile={onUploadFile}
        inFlightUpload={inFlightUpload}
        appResources={appResources}
      />
    </div>
  );
};
