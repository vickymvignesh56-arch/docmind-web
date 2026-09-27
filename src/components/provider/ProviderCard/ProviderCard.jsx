import React, { useState, useEffect } from 'react';
import { Power, Save } from 'lucide-react';
import { ProviderLogo } from '../ProviderLogo/ProviderLogo';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { LLM_DEFAULT_MODELS } from '../../../utils/constants';
import './ProviderCard.css';

export const ProviderCard = ({
  providerType, // 'GEMINI' | 'OPENAI' | 'ANTHROPIC'
  displayName,
  configuredData,
  onSave,
  onToggleStatus,
  isSaving = false,
  isActivating = false,
}) => {
  const defaults = LLM_DEFAULT_MODELS[providerType] || {
    chatModel: '',
    embeddingModel: '',
    chatOptions: [],
    embeddingOptions: [],
  };

  const [apiKey, setApiKey] = useState('');
  const [chatModel, setChatModel] = useState(
    configuredData?.chatModel || defaults.chatModel
  );
  const [embeddingModel, setEmbeddingModel] = useState(
    configuredData?.embeddingModel || defaults.embeddingModel
  );

  useEffect(() => {
    if (configuredData) {
      if (configuredData.chatModel) setChatModel(configuredData.chatModel);
      if (configuredData.embeddingModel) setEmbeddingModel(configuredData.embeddingModel);
    }
  }, [configuredData]);

  const isConfigured = Boolean(configuredData);
  const isActive = Boolean(configuredData?.isActive);

  const handleSave = async (e) => {
    e.preventDefault();
    await onSave({
      provider: providerType,
      apiKey: apiKey.trim() || undefined, // only send if user entered a new one
      chatModel: chatModel.trim(),
      embeddingModel: embeddingModel.trim(),
    });
    // Clear the sensitive input field after submission
    setApiKey('');
  };

  const getIconClass = () => {
    if (providerType === 'GEMINI') return 'provider-icon-gemini';
    if (providerType === 'OPENAI') return 'provider-icon-openai';
    return 'provider-icon-anthropic';
  };

  return (
    <div className={`provider-card ${isActive ? 'is-active-provider' : ''}`}>
      <div>
        <div className="provider-card-header">
          <div className="provider-badge-box">
            <div className={`provider-icon ${getIconClass()}`}>
              <ProviderLogo provider={providerType} size={28} />
            </div>
            <div>
              <h3 className="provider-card-title">{displayName}</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {providerType === 'GEMINI' ? 'Gemini' : providerType === 'OPENAI' ? 'OpenAI' : 'Claude'} • {isConfigured ? 'Configured' : 'Not configured'}
              </span>
            </div>
          </div>

          <span className={`badge ${isActive ? 'badge-ready' : 'badge-default'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Provider Status Bar & Switch Control */}
        <div className="provider-status-bar">
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              Provider Status
            </div>
            <div className={`provider-status-indicator ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className={`status-toggle-btn ${isActive ? 'is-on' : 'is-off'}`}
              disabled={isActivating || !isConfigured}
              onClick={() => onToggleStatus(!isActive)}
              title={
                !isConfigured
                  ? 'Save configuration first to activate'
                  : isActive
                  ? 'Turn OFF provider'
                  : 'Turn ON provider'
              }
            >
              {isActivating ? '...' : isActive ? '[ ON ]' : '[ OFF ]'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="provider-card-form">
          <Input
            label="API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              isConfigured && configuredData?.apiKey
                ? configuredData.apiKey
                : `Enter your ${displayName} API Key`
            }
            helperText={
              isConfigured
                ? 'Leave blank to preserve existing encrypted API key'
                : 'Key is securely validated and encrypted in backend'
            }
          />

          <Input
            label="Chat Generation Model"
            value={chatModel}
            onChange={(e) => setChatModel(e.target.value)}
            placeholder="e.g. gemini-2.5-flash"
            required
            helperText={`Suggested: ${defaults.chatOptions.join(', ')}`}
          />

          <Input
            label="Vector Embedding Model"
            value={embeddingModel}
            onChange={(e) => setEmbeddingModel(e.target.value)}
            placeholder="e.g. gemini-embedding-2"
            required
            helperText={`Suggested: ${defaults.embeddingOptions.join(', ')}`}
          />

          <div style={{ marginTop: 'var(--space-2)' }}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              icon={Save}
              loading={isSaving}
              className="w-full"
            >
              {isConfigured ? 'Update Configuration' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </div>

      <div className="provider-card-footer">
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {isActive ? 'Currently handling RAG chats' : 'Standby'}
        </span>

        {isConfigured && (
          <Button
            variant={isActive ? 'ghost' : 'outline'}
            size="sm"
            icon={Power}
            loading={isActivating}
            onClick={() => onToggleStatus(!isActive)}
            style={
              isActive
                ? { color: 'var(--color-error)' }
                : { color: 'var(--color-primary)' }
            }
          >
            {isActive ? 'Deactivate' : 'Set as Active'}
          </Button>
        )}
      </div>
    </div>
  );
};
