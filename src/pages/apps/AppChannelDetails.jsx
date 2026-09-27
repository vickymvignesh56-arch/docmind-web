import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, FolderGit2, Upload } from 'lucide-react';
import { appApi } from '../../services/appApi';
import { appChannelApi } from '../../services/appChannelApi';
import { resourceApi } from '../../services/resourceApi';
import { ResourceList } from '../../components/resource/ResourceList/ResourceList';
import { Button } from '../../components/common/Button/Button';
import { Loader } from '../../components/common/Loader/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { AppContext } from '../../context/AppContext';

export const AppChannelDetails = () => {
  const { appId, appChannelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [app, setApp] = useState(null);
  const [appChannel, setAppChannel] = useState(null);
  const [channelResources, setChannelResources] = useState([]);
  const [mappedResourceIds, setMappedResourceIds] = useState([]);
  const [mappingLoadingId, setMappingLoadingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch App
      const appData = await appApi.getAppDetails(appId);
      setApp(appData);

      // 2. Fetch AppChannel (returns AppChannel with relations)
      const appChannelData = await appChannelApi.getAppChannel(appId, appChannelId);
      setAppChannel(appChannelData);

      const targetChannelId = appChannelData.channelId;

      // 3. Fetch all Resources belonging to this Channel
      const resources = await resourceApi.getResources(targetChannelId);
      setChannelResources(resources || []);

      // 4. Identify mapped resources from backend
      let mappedIds = [];
      if (Array.isArray(appChannelData.resources) && appChannelData.resources.length > 0) {
        mappedIds = appChannelData.resources.map((r) => r.channelResourceId || r.id);
      } else if (resources.length > 0) {
        // Query backend for each resource's mapping status
        const checks = await Promise.allSettled(
          resources.map((r) => appChannelApi.getAppChannelResource(appId, appChannelId, r.id))
        );
        mappedIds = checks
          .map((chk, idx) => (chk.status === 'fulfilled' && chk.value ? resources[idx].id : null))
          .filter(Boolean);
      }
      setMappedResourceIds(mappedIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [appId, appChannelId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle mapping an individual ChannelResource to this AppChannel
  const handleMapResource = async (channelResourceId) => {
    setMappingLoadingId(channelResourceId);
    try {
      // POST /api/apps/:appId/channel/:appChannelId/resource with { channelResourceId }
      await appChannelApi.addAppChannelResource(appId, appChannelId, channelResourceId);
      toast?.success('Resource mapped to this application');
      // Always refresh from backend
      await loadData();
    } catch (err) {
      toast?.error(err.message, 'Failed to map resource');
    } finally {
      setMappingLoadingId(null);
    }
  };

  if (loading) {
    return <Loader message="Loading channel resources and mapping..." />;
  }

  if (error || !appChannel) {
    return (
      <ErrorMessage
        title="App Channel Not Found"
        message={error || 'Could not load app channel mapping details.'}
        onRetry={loadData}
      />
    );
  }

  const channelInfo = appChannel.channel || {};
  const mappedResources = channelResources.filter((r) => mappedResourceIds.includes(r.id));
  const availableResources = channelResources.filter((r) => !mappedResourceIds.includes(r.id));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Back Nav */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(`/apps/${appId}`)}
        >
          Back to {app?.name || 'App'}
        </Button>
      </div>

      {/* Mapping Header Card */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="badge badge-info flex items-center gap-1">
              <Bot size={12} /> {app?.name}
            </span>
            <span>→</span>
            <span className="badge badge-files flex items-center gap-1">
              <FolderGit2 size={12} /> {channelInfo.name || 'Channel'}
            </span>
          </div>

          <h2 style={{ marginTop: 'var(--space-2)' }}>
            Knowledge Mapping: {channelInfo.name}
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Configuring document access for <strong>{app?.name}</strong> from <strong>{channelInfo.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => navigate(`/channels/${appChannel.channelId}`)}
          >
            Upload More to Channel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/apps/${appId}/chat`)}
          >
            Open Chat
          </Button>
        </div>
      </div>

      {/* SECTION 1: Mapped Resources */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3>Mapped Resources</h3>
            <span className="badge badge-ready">{mappedResources.length}</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            ✓ These documents are currently indexed and available to {app?.name} for answering chat questions.
          </p>
        </div>

        {mappedResources.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-bg-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            No documents are currently mapped to this application. Select documents from the Available Resources section below.
          </div>
        ) : (
          <ResourceList
            resources={mappedResources}
            isMappingView={true}
            mappedResourceIds={mappedResourceIds}
            showMappedIndicator={true}
          />
        )}
      </div>

      {/* SECTION 2: Available Resources */}
      <div className="flex flex-col gap-3" style={{ marginTop: 'var(--space-4)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h3>Available Resources</h3>
            <span className="badge badge-default">{availableResources.length}</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            ○ Documents in {channelInfo.name} that are NOT yet mapped to {app?.name}. Click "Add to App" to grant this application access.
          </p>
        </div>

        {availableResources.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-bg-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {channelResources.length === 0
              ? 'No documents in this channel yet. Upload documents to this channel first.'
              : 'All documents from this channel are already mapped to this application.'}
          </div>
        ) : (
          <ResourceList
            resources={availableResources}
            isMappingView={true}
            mappedResourceIds={mappedResourceIds}
            onMapToApp={handleMapResource}
            mappingLoadingId={mappingLoadingId}
            showMappedIndicator={true}
            emptyActionLabel="Upload Documents to Channel"
            onEmptyAction={() => navigate(`/channels/${appChannel.channelId}`)}
          />
        )}
      </div>
    </div>
  );
};
