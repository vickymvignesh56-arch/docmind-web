import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  FolderGit2,
  MessageSquare,
  Settings,
  Plus,
  ArrowRight,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
} from 'lucide-react';
import { appApi } from '../../services/appApi';
import { channelApi } from '../../services/channelApi';
import { appChannelApi } from '../../services/appChannelApi';
import { resourceApi } from '../../services/resourceApi';
import { Button } from '../../components/common/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';
import { Loader } from '../../components/common/Loader/Loader';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { AppForm } from '../../components/app/AppForm/AppForm';
import { AppContext } from '../../context/AppContext';
import { formatDate, formatFileSize } from '../../utils/formatters';

import './AppDetails.css';

export const AppDetails = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { toast } = useContext(AppContext);

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'channels' | 'settings'

  // Channels state
  const [allChannels, setAllChannels] = useState([]);
  const [mappedChannels, setMappedChannels] = useState([]);
  const [addChannelModalOpen, setAddChannelModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('select-channel'); // 'select-channel' | 'select-resources'
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelResources, setChannelResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [selectedResourceIds, setSelectedResourceIds] = useState([]); // Default 0 selected!
  const [mappingLoading, setMappingLoading] = useState(false);

  // App edit state
  const [updating, setUpdating] = useState(false);

  const fetchApp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appApi.getAppDetails(appId);
      setApp(data);
      // If backend returns userAppChannels relation, store it
      const cacheKey = `ragfish_mapped_channels_${appId}`;
      let cached = [];
      try {
        cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      } catch {
        // ignore parse error
      }

      if (Array.isArray(data?.userAppChannels) && data.userAppChannels.length > 0) {
        setMappedChannels(data.userAppChannels);
      } else if (cached.length > 0) {
        setMappedChannels(cached);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  const fetchChannels = useCallback(async () => {
    try {
      const channels = await channelApi.getChannels();
      setAllChannels(channels || []);
    } catch (err) {
      console.warn('Failed to load channels for modal:', err.message);
    }
  }, []);

  useEffect(() => {
    if (appId) {
      fetchApp();
      fetchChannels();
    }
  }, [appId, fetchApp, fetchChannels]);

  const handleOpenAddChannelModal = () => {
    setModalStep('select-channel');
    setSelectedChannel(null);
    setSelectedResourceIds([]);
    setChannelResources([]);
    setAddChannelModalOpen(true);
    fetchChannels();
  };

  const handleSelectChannel = async (channel) => {
    setSelectedChannel(channel);
    setModalStep('select-resources');
    setSelectedResourceIds([]); // ALWAYS 0 selected by default!
    setLoadingResources(true);
    try {
      const resources = await resourceApi.getResources(channel.id);
      setChannelResources(resources || []);
    } catch (err) {
      toast?.error(err.message, 'Failed to load channel resources');
      setChannelResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleToggleResource = (channelResourceId) => {
    setSelectedResourceIds((prev) =>
      prev.includes(channelResourceId)
        ? prev.filter((id) => id !== channelResourceId)
        : [...prev, channelResourceId]
    );
  };

  const handleSelectAllResources = () => {
    setSelectedResourceIds(channelResources.map((r) => r.id));
  };

  const handleUnselectAllResources = () => {
    setSelectedResourceIds([]);
  };

  const handleMapSelectedResources = async () => {
    if (!selectedChannel || selectedResourceIds.length === 0) {
      toast?.error('Please select at least one resource to map');
      return;
    }

    setMappingLoading(true);
    try {
      // 1. Ensure UserAppChannel exists
      const appChannel = await appChannelApi.addAppChannel(appId, selectedChannel.id);
      const appChannelId = appChannel.id;

      // 2. Map ONLY the selected resources to this AppChannel
      // Calling POST /api/apps/:appId/channel/:appChannelId/resource with { channelResourceId }
      const mapPromises = selectedResourceIds.map((channelResourceId) =>
        appChannelApi.addAppChannelResource(appId, appChannelId, channelResourceId)
      );

      const results = await Promise.allSettled(mapPromises);
      const successCount = results.filter((r) => r.status === 'fulfilled').length;

      toast?.success(`Mapped ${successCount} of ${selectedResourceIds.length} resource(s) to ${app.name}`);

      // Add to mapped channels list in state
      setMappedChannels((prev) => {
        const exists = prev.some((c) => c.id === appChannelId || c.channelId === selectedChannel.id);
        if (exists) return prev;
        return [...prev, { ...appChannel, channel: selectedChannel }];
      });

      // Cache locally
      try {
        const cacheKey = `ragfish_mapped_channels_${appId}`;
        const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        if (!cached.some((c) => c.id === appChannelId)) {
          cached.push({ ...appChannel, channel: selectedChannel });
          localStorage.setItem(cacheKey, JSON.stringify(cached));
        }
      } catch {
        // ignore cache write error
      }

      // Reset modal state
      setAddChannelModalOpen(false);
      setSelectedChannel(null);
      setSelectedResourceIds([]);
      setModalStep('select-channel');

      // Refresh app details from backend
      await fetchApp();
    } catch (err) {
      toast?.error(err.message, 'Failed to map resources');
    } finally {
      setMappingLoading(false);
    }
  };

  const handleUpdateApp = async (formData) => {
    setUpdating(true);
    try {
      const updated = await appApi.updateApp(appId, formData);
      setApp(updated);
      toast?.success('Application updated successfully');
    } catch (err) {
      toast?.error(err.message, 'Update Failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader message="Loading application details..." />;
  }

  if (error || !app) {
    return (
      <ErrorMessage
        title="Application not found"
        message={error || 'Could not find the requested application.'}
        onRetry={fetchApp}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/apps')}
        >
          All Apps
        </Button>
      </div>

      <div className="app-details-header">
        <div className="app-details-info">
          <div className="app-details-avatar">
            <Bot size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2>{app.name}</h2>
              <span className={`badge ${app.status ? 'badge-ready' : 'badge-inactive'}`}>
                {app.status ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Created {formatDate(app.createdAt)} • Slug: <code style={{ color: 'var(--color-primary)' }}>{app.slug}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={MessageSquare}
            onClick={() => navigate(`/apps/${app.id}/chat`)}
          >
            Open Chat
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="app-details-tabs">
        <button
          type="button"
          className={`app-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`app-tab-btn ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          <FolderGit2 size={16} />
          <span>Connected Channels</span>
        </button>

        <button
          type="button"
          className={`app-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          <span>Configuration</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Description</h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {app.description || 'No description provided.'}
            </p>
          </div>

          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <h3 style={{ marginBottom: 'var(--space-2)' }}>System Prompt & Instructions</h3>
            {app.systemPrompt ? (
              <pre
                style={{
                  background: 'var(--color-bg-subtle)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  border: '1px solid var(--color-border)',
                }}
              >
                {app.systemPrompt}
              </pre>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No custom instructions set. This assistant uses default system behavior.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Channels (App-Channel Mapping) */}
      {activeTab === 'channels' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3>Mapped Knowledge Channels</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Channels connected to {app.name}. Click on a channel to choose which of its documents this app can access.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddChannelModal}
            >
              Add Channel
            </Button>
          </div>

          {mappedChannels.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No channels connected to this app"
              description="Connect an independent knowledge channel to allow this assistant to answer questions using your documents."
              actionLabel="Add Knowledge Channel"
              actionIcon={Plus}
              onAction={handleOpenAddChannelModal}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {mappedChannels.map((appChannel) => {
                const channelData =
                  appChannel.channel ||
                  allChannels.find((c) => c.id === appChannel.channelId) ||
                  {};
                return (
                  <div
                    key={appChannel.id}
                    className="mapped-channel-card"
                    onClick={() => navigate(`/apps/${app.id}/channel/${appChannel.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="channel-card-icon" style={{ width: '40px', height: '40px' }}>
                        <FolderGit2 size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                          {channelData.name || 'Connected Channel'}
                        </h4>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          Type: {channelData.channelType || 'files'} • Connected: {formatDate(appChannel.createdAt)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      iconRight={ArrowRight}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/apps/${app.id}/channel/${appChannel.id}`);
                      }}
                    >
                      Manage Resources
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div
          style={{
            maxWidth: '680px',
            background: 'var(--color-bg-surface)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Update Application Details</h3>
          <AppForm
            initialData={app}
            onSubmit={handleUpdateApp}
            loading={updating}
            submitLabel="Save Changes"
          />
        </div>
      )}

      {/* Add Channel Modal (2-Step: Select Channel -> Select Specific Channel Resources) */}
      <Modal
        isOpen={addChannelModalOpen}
        onClose={() => setAddChannelModalOpen(false)}
        title={
          modalStep === 'select-channel'
            ? `Add Channel to ${app.name}`
            : `Channel: ${selectedChannel?.name || 'Knowledge Channel'}`
        }
        maxWidth={modalStep === 'select-resources' ? '700px' : '520px'}
        footer={
          modalStep === 'select-channel' ? (
            <Button
              variant="secondary"
              onClick={() => setAddChannelModalOpen(false)}
            >
              Cancel
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={() => setModalStep('select-channel')}
                disabled={mappingLoading}
              >
                Back to Channels
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddChannelModalOpen(false)}
                  disabled={mappingLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMapSelectedResources}
                  loading={mappingLoading}
                  disabled={selectedResourceIds.length === 0}
                >
                  Map Selected Resources ({selectedResourceIds.length})
                </Button>
              </div>
            </div>
          )
        }
      >
        {modalStep === 'select-channel' ? (
          <div className="flex flex-col gap-4">
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                Available Channels
              </h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Select an existing knowledge channel from the list below to inspect and select its resources for <strong>{app.name}</strong>.
              </p>
            </div>

            {allChannels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                No knowledge channels found. Create an independent channel under Channels first.
              </div>
            ) : (
              <div className="flex flex-col gap-2" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {allChannels.map((c) => (
                  <div
                    key={c.id}
                    className="channel-selection-item"
                    onClick={() => handleSelectChannel(c)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="channel-card-icon" style={{ width: '38px', height: '38px' }}>
                        <FolderGit2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{c.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {c.channelType || 'Files'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                        Select Channel
                      </span>
                      <ArrowRight size={14} color="var(--color-primary)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Selected Channel Summary and Counter */}
            <div
              className="flex items-center justify-between flex-wrap gap-2"
              style={{
                background: 'var(--color-bg-subtle)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Channel: </span>
                <strong style={{ fontSize: 'var(--font-size-sm)' }}>{selectedChannel?.name}</strong>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                  ({channelResources.length} total resources)
                </span>
              </div>

              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 700,
                  color: selectedResourceIds.length > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                Selected Resources: {selectedResourceIds.length} / {channelResources.length}
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Select only required resources. Unselected resources will NOT be accessible by this App.
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleSelectAllResources}
                  disabled={loadingResources || channelResources.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleUnselectAllResources}
                  disabled={loadingResources || selectedResourceIds.length === 0}
                >
                  Unselect All
                </Button>
              </div>
            </div>

            {/* Clean Clickable Resource Rows */}
            {loadingResources ? (
              <Loader message="Loading documents in this channel..." />
            ) : channelResources.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                No documents found in this channel. Upload documents to this channel first.
              </div>
            ) : (
              <div
                style={{
                  maxHeight: '340px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '2px',
                }}
              >
                {channelResources.map((resource) => {
                  const isSelected = selectedResourceIds.includes(resource.id);
                  const fileName = resource.fileName || 'Document';
                  const ext = fileName.split('.').pop().toUpperCase() || 'FILE';
                  const size =
                    typeof resource.size === 'string' && resource.size.includes('B')
                      ? resource.size
                      : formatFileSize(resource.size);

                  return (
                    <div
                      key={resource.id}
                      onClick={() => handleToggleResource(resource.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '1px solid #93c5fd'
                          : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? '#eff6ff' : 'var(--color-bg-surface)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        userSelect: 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                          {isSelected ? (
                            <CheckCircle2 size={18} color="#2563eb" fill="#dbeafe" />
                          ) : (
                            <Circle size={18} color="#94a3b8" />
                          )}
                        </div>

                        <FileText
                          size={16}
                          color={isSelected ? '#2563eb' : 'var(--color-text-muted)'}
                          style={{ flexShrink: 0 }}
                        />

                        <span
                          style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? '#1e40af' : 'var(--color-text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={fileName}
                        >
                          {fileName}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          flexShrink: 0,
                          marginLeft: '12px',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? '#dbeafe' : 'var(--color-bg-subtle)',
                            color: isSelected ? '#1d4ed8' : 'var(--color-text-secondary)',
                            fontSize: '10px',
                          }}
                        >
                          {ext}
                        </span>
                        <span>{size}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </Modal>
    </div>
  );
};
