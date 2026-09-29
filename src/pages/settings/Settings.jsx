import React, { useState, useContext } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  Loader2,
} from 'lucide-react';
import { useProviders } from '../../hooks/useProviders';
import { ProviderLogo } from '../../components/provider/ProviderLogo/ProviderLogo';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Modal } from '../../components/common/Modal/Modal';
import { Loader } from '../../components/common/Loader/Loader';
import { LLM_PROVIDERS, LLM_DEFAULT_MODELS } from '../../utils/constants';
import { AppContext } from '../../context/AppContext';
import './Settings.css';

export const Settings = () => {
  const {
    providers,
    setProviders,
    loading,
    savingProvider,
    togglingProvider,
    saveProvider,
    toggleStatus,
    fetchProviders,
  } = useProviders();

  const { toast } = useContext(AppContext);

  // Success / Error banners for update feedback
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Edit Modal State (Strictly separated from Status state)
  const [editingProvider, setEditingProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Edit Form Fields
  const [formChatModel, setFormChatModel] = useState('');
  const [formEmbeddingModel, setFormEmbeddingModel] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Helper to retrieve provider configuration from backend data
  const getProviderConfig = (type) => {
    return (
      providers.find(
        (p) =>
          p.provider?.toUpperCase() === type.toUpperCase() ||
          p.slug?.toUpperCase() === type.toUpperCase()
      ) || null
    );
  };

  // Safe API Key masking using actual API response
  const formatMaskedApiKey = (config) => {
    if (!config) return '••••••••••••••••';
    const key = config.apiKeyPreview || config.maskedApiKey || config.apiKey;
    if (!key || typeof key !== 'string' || !key.trim()) {
      return '••••••••••••••••';
    }
    const str = key.trim();
    // If backend already returned masked text with dots/asterisks
    if (str.includes('•') || str.includes('*')) {
      return str;
    }
    // Mask safely while preserving common API key prefix if present
    if (str.startsWith('AIza') && str.length >= 8) {
      return 'AIza••••••••••••';
    }
    if (str.startsWith('sk-') && str.length >= 7) {
      return 'sk-••••••••••••';
    }
    if (str.length > 8) {
      return `${str.slice(0, 4)}••••••••••••`;
    }
    return '••••••••••••••••';
  };

  const providerList = [
    {
      type: LLM_PROVIDERS.GEMINI,
      name: 'Gemini',
      fullName: 'Google Gemini',
      config: getProviderConfig(LLM_PROVIDERS.GEMINI),
      defaults: LLM_DEFAULT_MODELS.GEMINI,
    },
    {
      type: LLM_PROVIDERS.OPENAI,
      name: 'OpenAI',
      fullName: 'OpenAI',
      config: getProviderConfig(LLM_PROVIDERS.OPENAI),
      defaults: LLM_DEFAULT_MODELS.OPENAI,
    },
    {
      type: LLM_PROVIDERS.ANTHROPIC,
      name: 'Anthropic Claude',
      fullName: 'Anthropic Claude',
      config: getProviderConfig(LLM_PROVIDERS.ANTHROPIC),
      defaults: LLM_DEFAULT_MODELS.ANTHROPIC,
    },
  ];

  // Open Edit Modal
  const handleOpenEditModal = (provider) => {
    setEditingProvider(provider);
    setFormChatModel(provider.config?.chatModel || provider.defaults.chatModel || '');
    setFormEmbeddingModel(
      provider.config?.embeddingModel || provider.defaults.embeddingModel || ''
    );
    setFormApiKey('');
    setFieldErrors({});
    setModalError(null);
    setIsModalOpen(true);
  };

  // Close Edit Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
    setFieldErrors({});
    setModalError(null);
  };

  // Form Validation
  const validateEditForm = () => {
    const errors = {};
    if (!editingProvider?.type) {
      errors.provider = 'Provider is required.';
    }
    if (!formChatModel.trim()) {
      errors.chatModel = 'Chat Model is required.';
    }
    if (!formEmbeddingModel.trim()) {
      errors.embeddingModel = 'Embedding Model is required.';
    }
    // If configuring provider for the first time, API key is required
    const isAlreadyConfigured = Boolean(editingProvider?.config);
    if (!isAlreadyConfigured && !formApiKey.trim()) {
      errors.apiKey = 'API Key is required to configure this provider.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Provider Save (Edit Form Submission)
  const handleUpdateProvider = async (e) => {
    e.preventDefault();
    if (!editingProvider) return;

    if (!validateEditForm()) {
      return;
    }

    setModalSaving(true);
    setModalError(null);
    setErrorMessage(null);

    try {
      const payload = {
        provider: editingProvider.type,
        chatModel: formChatModel.trim(),
        embeddingModel: formEmbeddingModel.trim(),
      };
      if (formApiKey.trim()) {
        payload.apiKey = formApiKey.trim();
      }

      // 1. Call PUT /api/llm-provider (Do NOT call /api/llm-provider/status)
      const saved = await saveProvider(payload);

      // 2. Fetch fresh provider data from backend
      await fetchProviders();

      // 3. Close modal
      handleCloseModal();

      // 4. Show success notification
      const successText =
        saved?.message || `${editingProvider.name} configuration updated successfully`;
      setSuccessMessage(successText);
      toast?.success(successText);
    } catch (err) {
      setModalError(err.message || 'Failed to update LLM provider');
    } finally {
      setModalSaving(false);
    }
  };

  // Handle Status Toggle (Outside Edit Form, calls PUT /api/llm-provider/status)
  const handleToggleStatus = async (provider) => {
    if (!provider.config) {
      toast?.error('Please configure API credentials before enabling this provider.');
      return;
    }

    const previousStatus = Boolean(provider.config?.isActive);
    const targetStatus = !previousStatus;

    // Optimistically update the UI immediately
    setProviders((prev) =>
      prev.map((p) => {
        const isMatch =
          p.provider?.toUpperCase() === provider.type.toUpperCase() ||
          p.slug?.toUpperCase() === provider.type.toUpperCase();
        if (isMatch) {
          return { ...p, isActive: targetStatus };
        }
        // If activating this provider, others become inactive
        return targetStatus ? { ...p, isActive: false } : p;
      })
    );

    setErrorMessage(null);

    try {
      const response = await toggleStatus(targetStatus, provider.type);
      const msg =
        response?.message ||
        `${provider.name} ${targetStatus ? 'activated' : 'deactivated'} successfully`;
      setSuccessMessage(msg);
      toast?.success(msg);
    } catch (err) {
      // Revert optimistic update on failure
      setProviders((prev) =>
        prev.map((p) => {
          const isMatch =
            p.provider?.toUpperCase() === provider.type.toUpperCase() ||
            p.slug?.toUpperCase() === provider.type.toUpperCase();
          return isMatch ? { ...p, isActive: previousStatus } : p;
        })
      );
      const errorText = err.message || `Failed to update ${provider.name} status`;
      setErrorMessage(errorText);
    }
  };

  if (loading) {
    return <Loader message="Loading LLM provider settings..." />;
  }

  const isAnySaving = Boolean(savingProvider) || Boolean(togglingProvider);

  return (
    <div className="settings-page">
      {/* Settings Page Header */}
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage application configuration and provider connections</p>
      </div>

      {/* Dedicated LLM Provider Section */}
      <div className="llm-section-header">
        <h3>LLM Provider</h3>
        <p>Configure chat models, vector embedding models, API credentials, and status</p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="llm-success-banner animate-fade-in">
          <CheckCircle2 size={16} />
          <span>✓ {successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="llm-error-banner animate-fade-in">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* LLM Provider Cards List */}
      <div className="llm-provider-list">
        {providerList.map((provider) => {
          const isConfigured = Boolean(provider.config);
          const isActive = Boolean(provider.config?.isActive);
          const chatModel =
            provider.config?.chatModel || provider.defaults.chatModel;
          const embeddingModel =
            provider.config?.embeddingModel || provider.defaults.embeddingModel;
          const maskedApiKey = formatMaskedApiKey(provider.config);
          const isTogglingThis = togglingProvider === provider.type;

          return (
            <div key={provider.type} className="llm-provider-card">
              {/* Provider Card Header: Name + Logo on Left, [Edit] and [Status Toggle] on Right */}
              <div className="llm-provider-header">
                <div className="llm-provider-brand">
                  <div className="llm-provider-logo">
                    <ProviderLogo provider={provider.type} size={22} />
                  </div>
                  <div className="llm-provider-title-wrap">
                    <span className="llm-provider-name">{provider.name}</span>
                    <span className="llm-provider-tag">
                      {isConfigured ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                </div>

                {/* Actions: Edit button immediately next to Status Toggle */}
                <div className="llm-provider-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleOpenEditModal(provider)}
                    disabled={isAnySaving}
                    className="llm-edit-action-btn"
                    id={`btn-edit-${provider.type.toLowerCase()}`}
                  >
                    Edit
                  </Button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Toggle ${provider.name} status`}
                    disabled={!isConfigured || isTogglingThis || isAnySaving}
                    onClick={() => handleToggleStatus(provider)}
                    className={`llm-status-toggle ${isActive ? 'is-active' : 'is-inactive'} ${
                      !isConfigured ? 'is-disabled' : ''
                    }`}
                    title={
                      !isConfigured
                        ? 'Configure provider credentials before enabling'
                        : isActive
                        ? 'Click to deactivate'
                        : 'Click to activate'
                    }
                    id={`toggle-status-${provider.type.toLowerCase()}`}
                  >
                    <span className="llm-toggle-track">
                      <span className="llm-toggle-knob">
                        {isTogglingThis && <Loader2 size={10} className="animate-spin" />}
                      </span>
                    </span>
                    <span className="llm-toggle-state-text">
                      {isActive ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Provider Card Specs: API Key, Chat Model, Embedding Model, Status */}
              <div className="llm-provider-specs">
                <div className="llm-spec-row">
                  <span className="llm-spec-label">API Key</span>
                  <code className="llm-spec-key">{maskedApiKey}</code>
                </div>

                <div className="llm-spec-row">
                  <span className="llm-spec-label">Chat Model</span>
                  <span className="llm-spec-value">{chatModel}</span>
                </div>

                <div className="llm-spec-row">
                  <span className="llm-spec-label">Embedding Model</span>
                  <span className="llm-spec-value">{embeddingModel}</span>
                </div>

                <div className="llm-spec-row">
                  <span className="llm-spec-label">Status</span>
                  <div className="llm-status-indicator">
                    <span className={`llm-status-dot ${isActive ? 'active' : 'inactive'}`} />
                    <span className={`llm-status-text ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit LLM Provider Modal */}
      {editingProvider && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`Edit ${editingProvider.name}`}
          maxWidth="500px"
        >
          <form onSubmit={handleUpdateProvider} className="llm-edit-form" noValidate>
            {modalError && (
              <div className="llm-modal-error-banner">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{modalError}</span>
              </div>
            )}

            {/* Provider Identifier */}
            <div className="llm-edit-provider-badge">
              <ProviderLogo provider={editingProvider.type} size={24} />
              <div className="llm-edit-provider-info">
                <div className="llm-edit-provider-name">{editingProvider.fullName}</div>
                <div className="llm-edit-provider-status">
                  {editingProvider.config ? 'Configured provider' : 'Initial setup'}
                </div>
              </div>
            </div>

            {/* API Key Field */}
            <div className="llm-form-group">
              <Input
                label="API Key"
                id="edit-api-key"
                type="password"
                value={formApiKey}
                onChange={(e) => {
                  setFormApiKey(e.target.value);
                  if (fieldErrors.apiKey) {
                    setFieldErrors((prev) => ({ ...prev, apiKey: null }));
                  }
                }}
                placeholder={
                  editingProvider.config
                    ? formatMaskedApiKey(editingProvider.config)
                    : 'Enter API Key'
                }
                error={fieldErrors.apiKey}
                helperText={
                  editingProvider.config
                    ? `Current: ${formatMaskedApiKey(editingProvider.config)} (leave empty to keep existing key)`
                    : 'Your API key is securely encrypted on the backend'
                }
              />
            </div>

            {/* Chat Model Field */}
            <div className="llm-form-group">
              <Input
                label="Chat Model"
                id="edit-chat-model"
                value={formChatModel}
                onChange={(e) => {
                  setFormChatModel(e.target.value);
                  if (fieldErrors.chatModel) {
                    setFieldErrors((prev) => ({ ...prev, chatModel: null }));
                  }
                }}
                placeholder="e.g. gemini-2.5-flash"
                required
                error={fieldErrors.chatModel}
                helperText={`Suggested: ${editingProvider.defaults.chatOptions.join(', ')}`}
              />
              {editingProvider.defaults?.chatOptions?.length > 0 && (
                <div className="llm-chip-list">
                  {editingProvider.defaults.chatOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      className={`llm-chip ${formChatModel === opt ? 'active' : ''}`}
                      onClick={() => {
                        setFormChatModel(opt);
                        if (fieldErrors.chatModel) {
                          setFieldErrors((prev) => ({ ...prev, chatModel: null }));
                        }
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Embedding Model Field */}
            <div className="llm-form-group">
              <Input
                label="Embedding Model"
                id="edit-embedding-model"
                value={formEmbeddingModel}
                onChange={(e) => {
                  setFormEmbeddingModel(e.target.value);
                  if (fieldErrors.embeddingModel) {
                    setFieldErrors((prev) => ({ ...prev, embeddingModel: null }));
                  }
                }}
                placeholder="e.g. gemini-embedding-2"
                required
                error={fieldErrors.embeddingModel}
                helperText={`Suggested: ${editingProvider.defaults.embeddingOptions.join(', ')}`}
              />
              {editingProvider.defaults?.embeddingOptions?.length > 0 && (
                <div className="llm-chip-list">
                  {editingProvider.defaults.embeddingOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      className={`llm-chip ${formEmbeddingModel === opt ? 'active' : ''}`}
                      onClick={() => {
                        setFormEmbeddingModel(opt);
                        if (fieldErrors.embeddingModel) {
                          setFieldErrors((prev) => ({ ...prev, embeddingModel: null }));
                        }
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="llm-modal-actions">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                disabled={modalSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Save}
                loading={modalSaving}
                disabled={modalSaving}
                id="btn-save-provider"
              >
                Save
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
