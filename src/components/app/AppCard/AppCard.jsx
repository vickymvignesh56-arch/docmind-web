import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../../common/Button/Button';
import { formatDate } from '../../../utils/formatters';
import './AppCard.css';

export const AppCard = ({ app, onDelete, onEdit }) => {
  const navigate = useNavigate();

  return (
    <div className="app-card">
      <div>
        <div className="app-card-header">
          <div className="app-card-icon">
            <Bot size={24} />
          </div>
          <span className={`badge ${app.status ? 'badge-ready' : 'badge-inactive'}`}>
            {app.status ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="app-card-title-box">
          <h3 className="app-card-title">{app.name}</h3>
          <span className="app-card-meta">Created {formatDate(app.createdAt)}</span>
        </div>

        <p className="app-card-description">
          {app.description || 'No description provided for this assistant.'}
        </p>
      </div>

      <div className="app-card-footer">
        <div className="app-card-actions">
          {onEdit && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onEdit(app)}
              aria-label="Edit app"
              title="Edit"
            >
              <Edit2 size={15} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onDelete(app)}
              aria-label="Delete app"
              title="Delete"
              style={{ color: 'var(--color-error)' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={MessageSquare}
            onClick={() => navigate(`/apps/${app.id}/chat`)}
          >
            Chat
          </Button>

          <Button
            variant="primary"
            size="sm"
            iconRight={ArrowRight}
            onClick={() => navigate(`/apps/${app.id}`)}
          >
            Open App
          </Button>
        </div>
      </div>
    </div>
  );
};
