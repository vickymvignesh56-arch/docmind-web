import React from 'react';
import { FileText, Check } from 'lucide-react';
import './ResourceSelector.css';

export const ResourceSelector = ({
  resources = [],
  selectedIds = [],
  onToggle,
  title = 'Active Resources',
}) => {
  return (
    <div className="resource-selector">
      <div className="resource-selector-header">
        <span>{title}</span>
        <span>
          {selectedIds.length} / {resources.length}
        </span>
      </div>

      <div className="resource-selector-list">
        {resources.map((res) => {
          const isSelected = selectedIds.includes(res.id);
          return (
            <div
              key={res.id}
              className={`resource-selector-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggle?.(res.id)}
            >
              <FileText size={14} color={isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
              <span className="truncate flex-1">{res.fileName}</span>
              {isSelected && <Check size={14} color="var(--color-primary)" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
