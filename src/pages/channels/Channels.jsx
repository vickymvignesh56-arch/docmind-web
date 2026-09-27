import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderGit2 } from 'lucide-react';
import { useChannels } from '../../hooks/useChannels';
import { ChannelList } from '../../components/channel/ChannelList/ChannelList';
import { Button } from '../../components/common/Button/Button';
import { AppContext } from '../../context/AppContext';

export const Channels = () => {
  const navigate = useNavigate();
  const { channels, loading, deleteChannel } = useChannels();
  const [searchTerm, setSearchTerm] = useState('');
  const { showConfirm } = useContext(AppContext);

  const filteredChannels = channels.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (channel) => {
    showConfirm({
      title: `Delete "${channel.name}"?`,
      message:
        'This will permanently delete this knowledge channel and remove its documents from all mapped applications.',
      confirmText: 'Delete Channel',
      onConfirm: async () => {
        await deleteChannel(channel.id);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2>Knowledge Channels</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Independent, reusable document repositories that can be mapped to multiple AI assistants
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="input-wrapper" style={{ width: '240px' }}>
            <div className="input-icon-left">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field input-with-icon-left"
              style={{ height: '38px' }}
            />
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/channels/create')}
          >
            Create Channel
          </Button>
        </div>
      </div>

      {/* Channels Grid */}
      <ChannelList
        channels={filteredChannels}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(channel) => navigate(`/channels/${channel.id}`)}
      />
    </div>
  );
};
