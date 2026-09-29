import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  SlidersHorizontal,
  Check,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../common/Button/Button';
import { formatFileSize } from '../../../utils/formatters';
import './ChatInput.css';

export const ChatInput = ({
  onSend,
  sending = false,
  activeChatId = null,
  onUploadFile,
  inFlightUpload = null,
  appResources = [],
  placeholder = 'Ask a question about your documents...',
}) => {
  const [message, setMessage] = useState('');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [tools, setTools] = useState({
    documentSearch: true,
    knowledgeRetrieval: true,
    hallucinationGuard: true,
  });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const toolsMenuRef = useRef(null);

  // Close tools popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    if (toolsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [toolsOpen]);

  // Auto-clear input when active conversation changes
  useEffect(() => {
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [activeChatId]);

  // Auto-resize textarea up to 140px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (onUploadFile) {
        onUploadFile(selected);
      }
      e.target.value = '';
    }
  };

  const toggleTool = (toolKey) => {
    setTools((prev) => ({ ...prev, [toolKey]: !prev[toolKey] }));
  };

  const isUploading =
    inFlightUpload &&
    (inFlightUpload.status === 'uploading' || inFlightUpload.status === 'processing');

  return (
    <div className="chat-composer-container">
      {/* Real-time In-Chat Upload Status Banner (Sections 15 & 16) */}
      {inFlightUpload && (
        <div
          className={`chat-upload-status-bar ${inFlightUpload.status} animate-fade-in`}
        >
          <div className="flex items-center gap-2 min-width-0">
            <FileText size={15} className="chat-upload-file-icon" />
            <span className="chat-upload-filename truncate">
              {inFlightUpload.fileName}
            </span>
            {inFlightUpload.size && (
              <span className="chat-upload-size">
                ({formatFileSize(inFlightUpload.size)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {inFlightUpload.status === 'uploading' && (
              <span className="chat-upload-badge uploading">
                <Loader2 size={12} className="animate-spin" />
                <span>Uploading to channel...</span>
              </span>
            )}

            {inFlightUpload.status === 'processing' && (
              <span className="chat-upload-badge processing">
                <Loader2 size={12} className="animate-spin" />
                <span>Indexing vector embeddings...</span>
              </span>
            )}

            {inFlightUpload.status === 'ready' && (
              <span className="chat-upload-badge ready">
                <CheckCircle2 size={12} />
                <span>Indexed & Ready</span>
              </span>
            )}

            {inFlightUpload.status === 'failed' && (
              <span className="chat-upload-badge failed">
                <AlertCircle size={12} />
                <span>{inFlightUpload.error || 'Upload failed'}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active Knowledge Pills Bar (Section 20) */}
      {appResources.length > 0 && (
        <div className="chat-knowledge-bar">
          <div className="chat-knowledge-label">
            <Database size={12} />
            <span>Knowledge Base ({appResources.length})</span>
          </div>

          <div className="chat-knowledge-pills">
            {appResources.map((res) => (
              <div key={res.id} className="chat-resource-pill" title={res.fileName}>
                <FileText size={12} />
                <span className="chat-resource-name truncate">{res.fileName}</span>
                <span className="chat-resource-check">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="chat-composer-box">
        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          disabled={isUploading || sending}
        />

        <div className="chat-composer-textarea-row">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={sending}
            className="chat-composer-textarea"
          />
        </div>

        {/* Composer Controls Bottom Toolbar (Sections 12 & 14) */}
        <div className="chat-composer-toolbar">
          <div className="chat-composer-left-actions">
            {/* Attachment Button */}
            <button
              type="button"
              className="chat-composer-tool-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || sending}
              title="Attach PDF or Word document to this assistant"
            >
              {isUploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Paperclip size={15} />
              )}
              <span className="hide-on-mobile">Attach Document</span>
            </button>

            {/* Tools Control Popover (Section 12) */}
            <div className="chat-tools-wrapper" ref={toolsMenuRef}>
              <button
                type="button"
                className={`chat-composer-tool-btn ${toolsOpen ? 'active' : ''}`}
                onClick={() => setToolsOpen((prev) => !prev)}
                title="Configure assistant retrieval tools"
              >
                <SlidersHorizontal size={14} />
                <span>Tools</span>
              </button>

              {toolsOpen && (
                <div className="chat-tools-popover animate-fade-in">
                  <div className="chat-tools-header">
                    <span className="chat-tools-title">RAG Assistant Tools</span>
                    <button
                      type="button"
                      className="chat-tools-close"
                      onClick={() => setToolsOpen(false)}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="chat-tools-list">
                    <div
                      className="chat-tool-item"
                      onClick={() => toggleTool('documentSearch')}
                    >
                      <div className="chat-tool-info">
                        <div className="flex items-center gap-2">
                          <Search size={14} className="chat-tool-icon" />
                          <span className="chat-tool-name">Document Search</span>
                        </div>
                        <span className="chat-tool-desc">
                          Vector similarity search across connected documents
                        </span>
                      </div>
                      <div className={`chat-tool-switch ${tools.documentSearch ? 'on' : 'off'}`}>
                        {tools.documentSearch && <Check size={11} />}
                      </div>
                    </div>

                    <div
                      className="chat-tool-item"
                      onClick={() => toggleTool('knowledgeRetrieval')}
                    >
                      <div className="chat-tool-info">
                        <div className="flex items-center gap-2">
                          <Database size={14} className="chat-tool-icon" />
                          <span className="chat-tool-name">Knowledge Retrieval</span>
                        </div>
                        <span className="chat-tool-desc">
                          Extract relevant chunks from Qdrant vector store
                        </span>
                      </div>
                      <div
                        className={`chat-tool-switch ${tools.knowledgeRetrieval ? 'on' : 'off'}`}
                      >
                        {tools.knowledgeRetrieval && <Check size={11} />}
                      </div>
                    </div>

                    <div
                      className="chat-tool-item"
                      onClick={() => toggleTool('hallucinationGuard')}
                    >
                      <div className="chat-tool-info">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="chat-tool-icon" />
                          <span className="chat-tool-name">Grounding Guard</span>
                        </div>
                        <span className="chat-tool-desc">
                          Enforce fact-checking strictly against retrieved text
                        </span>
                      </div>
                      <div
                        className={`chat-tool-switch ${tools.hallucinationGuard ? 'on' : 'off'}`}
                      >
                        {tools.hallucinationGuard && <Check size={11} />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Send Button */}
          <div className="chat-composer-right-actions">
            <span className="chat-composer-hint hide-on-mobile">
              Enter to send, Shift + Enter for new line
            </span>

            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={handleSend}
              disabled={!message.trim() || sending}
              loading={sending}
              style={{ borderRadius: 'var(--radius-md)', height: '34px', padding: '0 12px' }}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
