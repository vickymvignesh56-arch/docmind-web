import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Plus } from 'lucide-react';
import { ChannelCard } from '../ChannelCard/ChannelCard';
import { CardSkeleton } from '../../common/Loader/Loader';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import './ChannelList.css';

export const ChannelList = ({
  channels = [],
  loading = false,
  onDelete,
  onEdit,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="channel-grid">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!channels.length) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No channels created yet"
        description="Channels are independent document repositories that you can map to multiple AI applications."
        actionLabel="Create Channel"
        actionIcon={Plus}
        onAction={() => navigate('/channels/create')}
      />
    );
  }

  return (
    <div className="channel-grid">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
