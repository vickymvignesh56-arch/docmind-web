import React from 'react';
import { Button } from '../Button/Button';
import './EmptyState.css';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  children,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state-icon-box">
          <Icon size={28} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}

      {actionLabel && onAction && (
        <Button
          variant="primary"
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  );
};
