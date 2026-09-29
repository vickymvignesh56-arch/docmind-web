import React, { useState } from 'react';
import { Copy, Check, User, Code, FileText, CheckCircle2 } from 'lucide-react';
import { RagFishLogo } from '../../common/RagFishLogo';
import { formatDate } from '../../../utils/formatters';
import './ChatMessage.css';

// Code block with copy action
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chat-code-block">
      <div className="chat-code-header">
        <span className="chat-code-lang">
          <Code size={13} />
          {language || 'code'}
        </span>
        <button
          type="button"
          className="chat-code-copy-btn"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check size={12} color="var(--color-success)" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="chat-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Markdown block parser and renderer
const renderMarkdownContent = (content) => {
  if (!content) return null;

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // Check if fenced code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineEnd = part.indexOf('\n');
      let lang = 'code';
      let codeContent = '';

      if (firstLineEnd !== -1) {
        lang = part.slice(3, firstLineEnd).trim() || 'code';
        codeContent = part.slice(firstLineEnd + 1, -3);
      } else {
        codeContent = part.slice(3, -3);
      }

      return <CodeBlock key={index} language={lang} code={codeContent.trim()} />;
    }

    // Process normal text with lists, paragraphs, citations
    const lines = part.split('\n');
    const elements = [];
    let currentList = [];
    let isOrderedList = false;

    const flushList = () => {
      if (currentList.length > 0) {
        if (isOrderedList) {
          elements.push(
            <ol key={`ol-${elements.length}`} className="chat-msg-ol">
              {currentList.map((item, i) => (
                <li key={i}>{formatInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="chat-msg-ul">
              {currentList.map((item, i) => (
                <li key={i}>{formatInline(item)}</li>
              ))}
            </ul>
          );
        }
        currentList = [];
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Check unordered list item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (isOrderedList) flushList();
        isOrderedList = false;
        currentList.push(trimmed.slice(2));
        return;
      }

      // Check ordered list item (e.g. "1. ")
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (orderedMatch) {
        if (!isOrderedList) flushList();
        isOrderedList = true;
        currentList.push(orderedMatch[2]);
        return;
      }

      // Not a list item: flush any pending list
      flushList();

      if (!trimmed) {
        // Empty line: paragraph separator
        elements.push(<div key={`sp-${lineIdx}`} className="chat-msg-para-spacer" />);
        return;
      }

      // Check blockquote
      if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${lineIdx}`} className="chat-msg-quote">
            {formatInline(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      // Check heading markdown (### or ##)
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h4-${lineIdx}`} className="chat-msg-h4">
            {formatInline(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h3-${lineIdx}`} className="chat-msg-h3">
            {formatInline(trimmed.slice(3))}
          </h3>
        );
        return;
      }

      // Standard paragraph line
      elements.push(
        <p key={`p-${lineIdx}`} className="chat-msg-paragraph">
          {formatInline(line)}
        </p>
      );
    });

    flushList();
    return <React.Fragment key={index}>{elements}</React.Fragment>;
  });
};

// Inline formatter for bold, italic, and inline code
const formatInline = (text) => {
  if (!text) return null;

  // Split by inline code first: `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="chat-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting: **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return <strong key={`${i}-${bIdx}`}>{bPart.slice(2, -2)}</strong>;
      }

      // Italic formatting: *italic*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((itPart, itIdx) => {
        if (itPart.startsWith('*') && itPart.endsWith('*') && itPart.length > 2) {
          return <em key={`${i}-${bIdx}-${itIdx}`}>{itPart.slice(1, -1)}</em>;
        }
        return itPart;
      });
    });
  });
};

export const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = Boolean(message.isError);

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
        {isUser ? <User size={16} /> : <RagFishLogo size={24} withText={false} />}
      </div>

      <div className="chat-msg-bubble-container">
        <div
          className={`chat-msg-bubble ${isUser ? 'user' : 'assistant'} ${
            isError ? 'is-error-msg' : ''
          }`}
        >
          {isUser ? (
            <div className="chat-user-text">{message.content}</div>
          ) : (
            <div className="chat-assistant-markdown">
              {renderMarkdownContent(message.content)}
            </div>
          )}
        </div>

        <div className="chat-msg-meta">
          <span>{formatDate(message.createdAt)}</span>
          {!isUser && message.content && (
            <button
              type="button"
              className="chat-copy-btn"
              onClick={handleCopy}
              title={copied ? 'Copied to clipboard' : 'Copy response'}
            >
              {copied ? (
                <>
                  <Check size={12} color="var(--color-success)" />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-success)' }}>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span style={{ fontSize: '0.6875rem' }}>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
