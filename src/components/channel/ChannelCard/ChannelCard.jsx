import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, ArrowRight, Trash2, Edit2, FileText } from 'lucide-react';
import { Button } from '../../common/Button/Button';
import { formatDate } from '../../../utils/formatters';
import './ChannelCard.css';

export const ChannelCard = ({ channel, onDelete, onEdit }) => {
  const navigate = useNavigate();

  return (
    <div className="channel-card">
      <div>
        <div className="channel-card-header">
          <div className="channel-card-icon">
            <FolderGit2 size={24} />
          </div>
          <span className="badge badge-files">
            {channel.channelType || 'files'}
          </span>
        </div>

        <div className="channel-card-title-box">
          <h3 className="channel-card-title">{channel.name}</h3>
          <span className="channel-card-meta">
            Created {formatDate(channel.createdAt)}
          </span>
        </div>

        <p className="channel-card-desc">
          {channel.description || 'Independent document knowledge channel.'}
        </p>
      </div>

      <div className="channel-card-footer">
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onEdit(channel)}
              aria-label="Edit channel"
              title="Edit"
            >
              <Edit2 size={15} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onDelete(channel)}
              aria-label="Delete channel"
              title="Delete"
              style={{ color: 'var(--color-error)' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          iconRight={ArrowRight}
          onClick={() => navigate(`/channels/${channel.id}`)}
        >
          Open Channel
        </Button>
      </div>
    </div>
  );
};
