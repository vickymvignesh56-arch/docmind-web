import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderGit2, ArrowLeft, RefreshCw, Upload, FileText } from 'lucide-react';
import { channelApi } from '../../services/channelApi';
import { useResources } from '../../hooks/useResources';
import { FileUpload } from '../../components/resource/FileUpload/FileUpload';
import { ResourceList } from '../../components/resource/ResourceList/ResourceList';
import { ResourcePreviewModal } from '../../components/resource/ResourcePreviewModal/ResourcePreviewModal';
import { Button } from '../../components/common/Button/Button';
import { Loader } from '../../components/common/Loader/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { AppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export const ChannelDetails = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { showConfirm } = useContext(AppContext);

  const [channel, setChannel] = useState(null);
  const [channelLoading, setChannelLoading] = useState(true);
  const [channelError, setChannelError] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    resources,
    loading: resourcesLoading,
    uploading,
    deletingResourceId,
    fetchResources,
    uploadResource,
    deleteResource,
    downloadResource,
  } = useResources(channelId);

  const fetchChannelData = useCallback(async () => {
    setChannelLoading(true);
    setChannelError(null);
    try {
      const data = await channelApi.getChannelById(channelId);
      setChannel(data);
    } catch (err) {
      setChannelError(err.message);
    } finally {
      setChannelLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    if (channelId) {
      fetchChannelData();
    }
  }, [channelId, fetchChannelData]);

  const handleDeleteResource = (resource, explicitChannelId, explicitResourceId) => {
    const targetChannelId = explicitChannelId || channelId || resource?.channelId;
    const targetResourceId = explicitResourceId || resource?.id;

    if (!targetChannelId || !targetResourceId) {
      return;
    }

    showConfirm({
      title: `Delete "${resource?.fileName || 'Document'}"?`,
      message: 'This will remove the file and delete its vector embeddings from Qdrant. Applications using this document will no longer have access to it.',
      confirmText: 'Delete Document',
      onConfirm: async () => {
        await deleteResource(targetChannelId, targetResourceId);
      },
    });
  };


  const handlePreviewResource = (resource) => {
    setPreviewResource(resource);
    setPreviewOpen(true);
  };

  const handleEmptyUploadAction = () => {
    const fileInput = document.querySelector('.file-upload-dropzone input[type="file"]');
    if (fileInput) {
      fileInput.click();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (channelLoading) {
    return <Loader message="Loading knowledge channel..." />;
  }

  if (channelError || !channel) {
    return (
      <ErrorMessage
        title="Channel Not Found"
        message={channelError || 'Could not locate the requested channel.'}
        onRetry={fetchChannelData}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Back Nav */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/channels')}
        >
          All Channels
        </Button>
      </div>

      {/* Channel Header Banner */}
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
        <div className="flex items-center gap-4">
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FolderGit2 size={28} />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2>{channel.name}</h2>
              <span className="badge badge-files">{channel.channelType || 'files'}</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {channel.description || 'Independent document repository.'}
            </p>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Created {formatDate(channel.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchResources()}
            title="Refresh document status"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Upload Documents</h3>
        <FileUpload onUpload={uploadResource} uploading={uploading} />
      </div>

      {/* Channel Documents Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3>Resources ({resources.length})</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Processed files are ready to be mapped to any AI application.
            </p>
          </div>
        </div>

        <ResourceList
          resources={resources}
          loading={resourcesLoading}
          channelId={channelId}
          deletingResourceId={deletingResourceId}
          onDelete={handleDeleteResource}
          onDownload={downloadResource}
          onPreview={handlePreviewResource}
          onEmptyAction={handleEmptyUploadAction}
        />

      </div>

      {/* Document Preview Modal */}
      <ResourcePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resource={previewResource}
        channelId={channelId}
        onDownload={downloadResource}
      />
    </div>
  );
};
