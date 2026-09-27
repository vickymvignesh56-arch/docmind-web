import React from 'react';
import { FolderGit2, Upload } from 'lucide-react';
import { ResourceCard } from '../ResourceCard/ResourceCard';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import './ResourceList.css';

export const ResourceList = ({
  resources = [],
  loading = false,
  channelId = null,
  deletingResourceId = null,
  onDelete,
  onDownload,
  onPreview,
  // Props for AppChannel mapping view:
  isMappingView = false,
  mappedResourceIds = [],
  onMapToApp,
  mappingLoadingId = null,
  emptyActionLabel,
  onEmptyAction,
  // Props for batch selection:
  selectable = false,
  selectedResourceIds = [],
  onToggleSelect,
  showMappedIndicator = false,
}) => {
  if (loading) {
    return (
      <div className="resource-skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="resource-card-skeleton">
            <div className="resource-skeleton-banner" />
            <div className="resource-skeleton-body">
              <div className="resource-skeleton-line" style={{ width: '80%' }} />
              <div className="resource-skeleton-line" style={{ width: '50%' }} />
              <div className="resource-skeleton-line" style={{ width: '35%', marginTop: 'auto' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!resources.length) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No files uploaded yet"
        description="Upload files to this channel to start using them in your apps."
        actionLabel={emptyActionLabel || 'Upload File'}
        actionIcon={Upload}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="resource-grid-container">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          channelId={channelId || resource.channelId}
          isDeleting={deletingResourceId === resource.id}
          onDelete={onDelete}
          onDownload={onDownload}
          onPreview={onPreview}
          isMappingView={isMappingView}
          isMapped={mappedResourceIds.includes(resource.id)}
          onMapToApp={onMapToApp}
          mappingLoading={mappingLoadingId === resource.id}
          selectable={selectable}
          isSelected={selectedResourceIds.includes(resource.id)}
          onToggleSelect={onToggleSelect}
          showMappedIndicator={showMappedIndicator}
        />
      ))}
    </div>
  );
};

