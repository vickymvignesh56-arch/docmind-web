import React, { useState, useContext } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { useProviders } from '../../hooks/useProviders';
import { ProviderCard } from '../../components/provider/ProviderCard/ProviderCard';
import { ProviderLogo } from '../../components/provider/ProviderLogo/ProviderLogo';
import { Loader } from '../../components/common/Loader/Loader';
import { LLM_PROVIDERS } from '../../utils/constants';
import { AppContext } from '../../context/AppContext';

export const LLMProviderSettings = () => {
  const {
    providers,
    loading,
    savingProvider,
    activatingProvider,
    saveProvider,
    toggleStatus,
    fetchProviders,
  } = useProviders();

  const { showConfirm } = useContext(AppContext);
  const [statusError, setStatusError] = useState(null);

  if (loading) {
    return <Loader message="Loading LLM provider connections..." />;
  }

  // Find currently active provider from backend data
  const activeProvider = providers.find((p) => p.isActive);

  // Find configuration for each provider from backend data
  const getProviderConfig = (type) => {
    return providers.find((p) => p.provider === type) || null;
  };

  const geminiConfig = getProviderConfig(LLM_PROVIDERS.GEMINI);
  const openAiConfig = getProviderConfig(LLM_PROVIDERS.OPENAI);
  const anthropicConfig = getProviderConfig(LLM_PROVIDERS.ANTHROPIC);

  const getDisplayName = (type) => {
    if (type === LLM_PROVIDERS.GEMINI) return 'Google Gemini';
    if (type === LLM_PROVIDERS.OPENAI) return 'OpenAI';
    return 'Anthropic Claude';
  };

  const handleToggleStatus = async (targetProviderType, willBeActive) => {
    setStatusError(null);

    // If activating and another provider is currently active, prompt confirmation
    if (willBeActive && activeProvider && activeProvider.provider !== targetProviderType) {
      const currentActiveName = getDisplayName(activeProvider.provider);
      const targetName = getDisplayName(targetProviderType);

      showConfirm({
        title: 'Switch LLM Provider',
        message: `${currentActiveName} is currently active.\nDo you want to switch to ${targetName}?`,
        confirmText: 'Switch Provider',
        cancelText: 'Cancel',
        type: 'primary',
        onConfirm: async () => {
          try {
            await toggleStatus(true);
          } catch (err) {
            setStatusError(err.message || 'Failed to switch provider');
          } finally {
            await fetchProviders();
          }
        },
      });
      return;
    }

    try {
      await toggleStatus(willBeActive);
    } catch (err) {
      setStatusError(err.message || 'Failed to update provider status');
    } finally {
      await fetchProviders();
    }
  };

  const providerList = [
    { type: LLM_PROVIDERS.GEMINI, name: 'Google Gemini', sub: 'Gemini', config: geminiConfig },
    { type: LLM_PROVIDERS.OPENAI, name: 'OpenAI', sub: 'OpenAI', config: openAiConfig },
    { type: LLM_PROVIDERS.ANTHROPIC, name: 'Anthropic Claude', sub: 'Claude', config: anthropicConfig },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3>LLM & Vector Model Providers</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Configure API credentials, chat generation models, and vector embedding models for your RAG pipeline.
        </p>
      </div>

      {/* Backend Architecture Notice */}
      <div
        style={{
          background: 'var(--color-info-light)',
          border: '1px solid #bae6fd',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
        }}
      >
        <Info size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: 'var(--font-size-xs)', color: '#0369a1', lineHeight: 1.5 }}>
          <strong>Provider Architecture:</strong> DocMind allows configuring Gemini, OpenAI, or Anthropic.
          Your API keys are encrypted at rest using AES-256 before being stored. Only one provider can be active at a time to power vector embeddings and chat responses.
        </div>
      </div>

      {/* Backend Error Display in Settings UI */}
      {statusError && (
        <div
          style={{
            background: 'var(--color-error-light)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{statusError}</span>
          <button
            type="button"
            onClick={() => setStatusError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-error)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Provider Status Section */}
      <div className="provider-status-section">
        <div className="provider-status-section-header">
          <div>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>
              Provider Status
            </h4>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Real-time backend activation status. Only one provider active at a time.
            </span>
          </div>
          {activeProvider && (
            <span className="badge badge-ready">
              Active: {getDisplayName(activeProvider.provider)}
            </span>
          )}
        </div>

        <div className="provider-status-table">
          {providerList.map(({ type, name, sub, config }) => {
            const isConfigured = Boolean(config);
            const isActive = Boolean(config?.isActive);

            return (
              <div key={type} className="provider-status-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="provider-status-logo-box">
                    <ProviderLogo provider={type} size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {sub} • {isConfigured ? 'Configured' : 'Not configured'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span className={`badge ${isActive ? 'badge-ready' : 'badge-default'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    type="button"
                    className={`status-toggle-btn ${isActive ? 'is-on' : 'is-off'}`}
                    disabled={activatingProvider || !isConfigured}
                    onClick={() => handleToggleStatus(type, !isActive)}
                    title={
                      !isConfigured
                        ? 'Configure credentials below to activate'
                        : isActive
                        ? `Turn OFF ${name}`
                        : `Turn ON ${name}`
                    }
                  >
                    {activatingProvider ? '...' : isActive ? '[ ON ]' : '[ OFF ]'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Provider Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Gemini Provider */}
        <ProviderCard
          providerType={LLM_PROVIDERS.GEMINI}
          displayName="Google Gemini"
          configuredData={geminiConfig}
          onSave={saveProvider}
          onToggleStatus={(status) => handleToggleStatus(LLM_PROVIDERS.GEMINI, status)}
          isSaving={savingProvider === LLM_PROVIDERS.GEMINI}
          isActivating={activatingProvider}
        />

        {/* OpenAI Provider */}
        <ProviderCard
          providerType={LLM_PROVIDERS.OPENAI}
          displayName="OpenAI"
          configuredData={openAiConfig}
          onSave={saveProvider}
          onToggleStatus={(status) => handleToggleStatus(LLM_PROVIDERS.OPENAI, status)}
          isSaving={savingProvider === LLM_PROVIDERS.OPENAI}
          isActivating={activatingProvider}
        />

        {/* Anthropic Provider */}
        <ProviderCard
          providerType={LLM_PROVIDERS.ANTHROPIC}
          displayName="Anthropic Claude"
          configuredData={anthropicConfig}
          onSave={saveProvider}
          onToggleStatus={(status) => handleToggleStatus(LLM_PROVIDERS.ANTHROPIC, status)}
          isSaving={savingProvider === LLM_PROVIDERS.ANTHROPIC}
          isActivating={activatingProvider}
        />
      </div>
    </div>
  );
};
