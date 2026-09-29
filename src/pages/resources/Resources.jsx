import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, ArrowRight, FileText, Plus } from 'lucide-react';
import { channelApi } from '../../services/channelApi';
import { resourceApi } from '../../services/resourceApi';
import { ResourceCard } from '../../components/resource/ResourceCard/ResourceCard';
import { ResourcePreviewModal } from '../../components/resource/ResourcePreviewModal/ResourcePreviewModal';
import { Loader } from '../../components/common/Loader/Loader';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { Button } from '../../components/common/Button/Button';

export const Resources = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [channelResourcesMap, setChannelResourcesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState(null);
  const [previewChannelId, setPreviewChannelId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedChannels = await channelApi.getChannels();
      setChannels(fetchedChannels || []);

      // Load channel documents in parallel instead of sequential waterfall
      const map = {};
      await Promise.all(
        (fetchedChannels || []).map(async (ch) => {
          try {
            const res = await resourceApi.getResources(ch.id);
            map[ch.id] = res || [];
          } catch {
            map[ch.id] = [];
          }
        })
      );
      setChannelResourcesMap(map);
    } catch (err) {
      console.warn('Failed to load all resources:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handlePreview = (resource, chId) => {
    setPreviewResource(resource);
    setPreviewChannelId(chId);
    setPreviewOpen(true);
  };

  if (loading) {
    return <Loader message="Loading knowledge documents across all channels..." />;
  }

  const totalDocuments = Object.values(channelResourcesMap).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Knowledge Documents ({totalDocuments})</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Overview of uploaded and indexed files across your knowledge channels
          </p>
        </div>

        <Button
          variant="primary"
          icon={FolderGit2}
          onClick={() => navigate('/channels')}
        >
          Manage Channels
        </Button>
      </div>

      {channels.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No channels or documents found"
          description="Create a knowledge channel and upload documents to begin indexing your knowledge."
          actionLabel="Create Channel"
          onAction={() => navigate('/channels/create')}
        />
      ) : totalDocuments === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded yet"
          description="Select a knowledge channel to upload PDF or DOCX files."
          actionLabel="View Channels"
          onAction={() => navigate('/channels')}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {channels.map((channel) => {
            const docs = channelResourcesMap[channel.id] || [];
            return (
              <div
                key={channel.id}
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FolderGit2 size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                        {channel.name}
                      </h3>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {docs.length} {docs.length === 1 ? 'document' : 'documents'} indexed
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    iconRight={ArrowRight}
                    onClick={() => navigate(`/channels/${channel.id}`)}
                  >
                    Open Channel
                  </Button>
                </div>

                {docs.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                    No files in this channel yet.{' '}
                    <span
                      style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => navigate(`/channels/${channel.id}`)}
                    >
                      Upload files now
                    </span>
                  </p>
                ) : (
                  <div className="resource-grid-container">
                    {docs.map((doc) => (
                      <ResourceCard
                        key={doc.id}
                        resource={doc}
                        channelId={channel.id}
                        onDownload={() =>
                          resourceApi.downloadResource(channel.id, doc.id, doc.fileName)
                        }
                        onPreview={() => handlePreview(doc, channel.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* In-Place Document Preview Modal */}
      <ResourcePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resource={previewResource}
        channelId={previewChannelId}
        onDownload={(resId, fName) =>
          resourceApi.downloadResource(previewChannelId, resId, fName)
        }
      />
    </div>
  );
};
