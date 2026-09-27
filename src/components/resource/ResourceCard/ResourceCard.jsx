import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Table,
  Image as ImageIcon,
  Download,
  Info,
  Trash2,
  Check,
  MoreVertical,
} from 'lucide-react';
import { ResourceStatus } from '../ResourceStatus/ResourceStatus';
import { Modal } from '../../common/Modal/Modal';
import { Button } from '../../common/Button/Button';
import { formatFileSize, formatDate } from '../../../utils/formatters';
import './ResourceCard.css';

export const ResourceCard = ({
  resource,
  channelId = null,
  isDeleting = false,
  onDelete,
  onDownload,
  onPreview,
  // Props for AppChannel mapping view:
  isMappingView = false,
  isMapped = false,
  onMapToApp,
  mappingLoading = false,
  // Selection mode for batch mapping:
  selectable = false,
  isSelected = false,
  onToggleSelect,
  showMappedIndicator = false,
}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Ensure only one resource card dropdown menu is open at a time
  useEffect(() => {
    const handleCloseOthers = (e) => {
      if (e.detail !== resource.id) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('ragfish-close-other-menus', handleCloseOthers);
    return () => {
      window.removeEventListener('ragfish-close-other-menus', handleCloseOthers);
    };
  }, [resource.id]);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        window.dispatchEvent(
          new CustomEvent('ragfish-close-other-menus', { detail: resource.id })
        );
      }
      return next;
    });
  };


  const fileName = resource?.fileName || 'Document';
  const fileType = (resource?.fileType || '').toLowerCase();
  const ext = fileName.split('.').pop().toLowerCase();

  // Categorize document format for visual preview
  const isPdf = fileType === 'pdf' || ext === 'pdf';
  const isDocx = fileType === 'docx' || ext === 'docx' || ext === 'doc';
  const isXlsx = fileType === 'xlsx' || ext === 'xlsx' || ext === 'xls' || ext === 'csv';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || fileType.includes('image');

  let bannerClass = 'type-generic';
  let typeTag = ext.toUpperCase() || 'FILE';
  let SheetIcon = FileText;

  if (isPdf) {
    bannerClass = 'type-pdf';
    typeTag = 'PDF';
    SheetIcon = FileText;
  } else if (isDocx) {
    bannerClass = 'type-docx';
    typeTag = 'DOCX';
    SheetIcon = FileText;
  } else if (isXlsx) {
    bannerClass = 'type-xlsx';
    typeTag = 'XLSX';
    SheetIcon = Table;
  } else if (isImage) {
    bannerClass = 'type-image';
    typeTag = 'IMG';
    SheetIcon = ImageIcon;
  }

  // Display size formatting
  const displaySize =
    typeof resource?.size === 'string' && resource.size.includes('B')
      ? resource.size
      : formatFileSize(resource?.size);

  const handleCardClick = (e) => {
    // Prevent triggering preview when clicking button, menu or input
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.resource-menu-dropdown')) {
      return;
    }
    if (selectable && onToggleSelect) {
      onToggleSelect(resource.id);
    } else if (onPreview) {
      onPreview(resource);
    }
  };

  const handleDownloadFromMenu = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDownload) {
      const targetChannelId = channelId || resource?.channelId;
      const targetResourceId = resource?.id;
      await onDownload(targetResourceId, fileName, targetChannelId);
    }
  };

  const handleInfoFromMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setInfoModalOpen(true);
  };

  const handleDeleteFromMenu = (e) => {
    e.stopPropagation();
    if (isDeleting) return;
    setMenuOpen(false);
    if (onDelete) {
      const targetChannelId = channelId || resource?.channelId;
      const targetResourceId = resource?.id;
      onDelete(resource, targetChannelId, targetResourceId);
    }
  };


  return (
    <>
      <div
        className={`resource-card ${isMapped ? 'is-mapped' : ''} ${isSelected ? 'is-selected' : ''} ${menuOpen ? 'has-menu-open' : ''}`}
        onClick={handleCardClick}
        style={{ cursor: selectable || onPreview ? 'pointer' : 'default' }}
      >
        {/* Visual Top Preview Area with Three-Dot Menu at Top-Right */}
        <div className={`resource-preview-banner ${bannerClass}`}>
          <span className="resource-type-tag">{typeTag}</span>

          {/* Top-Right: Selection checkbox & Three-dot menu button */}
          <div className="resource-top-actions" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            {selectable && (
              <input
                type="checkbox"
                checked={Boolean(isSelected)}
                onChange={() => onToggleSelect && onToggleSelect(resource.id)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary)',
                }}
              />
            )}

            <button
              type="button"
              className="resource-menu-trigger-btn"
              onClick={handleToggleMenu}
              aria-label="Document options"
              title="Options"
            >
              <MoreVertical size={16} />
            </button>


            {/* Three-Dot Dropdown Menu: Download, File Info (and Delete if provided) */}
            {menuOpen && (
              <div className="resource-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                {onDownload && (
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={handleDownloadFromMenu}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                )}

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleInfoFromMenu}
                >
                  <Info size={14} />
                  <span>File Info</span>
                </button>

                {onDelete && (
                  <button
                    type="button"
                    className="dropdown-item danger"
                    onClick={handleDeleteFromMenu}
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                )}

              </div>
            )}
          </div>

          <div className="mini-doc-sheet">
            <div className="mini-doc-fold" />
            <div className="mini-doc-icon">
              <SheetIcon size={20} />
            </div>
            <div className="mini-doc-lines">
              <div className="mini-line" />
              <div className="mini-line medium" />
              <div className="mini-line short" />
            </div>
          </div>
        </div>

        {/* Middle Information Area */}
        <div className="resource-card-body">
          <h4 className="resource-card-title" title={fileName}>
            {fileName}
          </h4>

          <div className="resource-card-meta">
            <span>{displaySize}</span>
            <span>•</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{typeTag}</span>
          </div>

          {/* Bottom Row: Status badge (and App Mapping button if in mapping view) */}
          <div className="resource-bottom-row" onClick={(e) => e.stopPropagation()}>
            <div className="resource-status-box">
              <ResourceStatus status={resource.status} />

              {showMappedIndicator && (
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                  {isMapped ? (
                    <span style={{ color: 'var(--color-success)' }}>✓ Mapped</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>○ Available</span>
                  )}
                </span>
              )}
            </div>

            {isMappingView && (
              <div>
                {isMapped ? (
                  <span className="badge badge-ready flex items-center gap-1">
                    <Check size={13} />
                    <span>Mapped</span>
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onMapToApp && onMapToApp(resource.id)}
                    loading={mappingLoading}
                    disabled={resource.status !== 'ready' && resource.status !== 'completed'}
                    title={
                      resource.status !== 'ready' && resource.status !== 'completed'
                        ? 'Resource must be ready before mapping'
                        : ''
                    }
                  >
                    Add to App
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Information Modal */}
      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="File Information"
        maxWidth="460px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="secondary" size="sm" onClick={() => setInfoModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="file-info-modal-content">
          <div className="file-info-field">
            <span className="file-info-label">File Name</span>
            <span className="file-info-value" title={fileName}>
              {fileName}
            </span>
          </div>

          <div className="file-info-field">
            <span className="file-info-label">File Size</span>
            <span className="file-info-value">{displaySize}</span>
          </div>

          <div className="file-info-field">
            <span className="file-info-label">File Type</span>
            <span className="file-info-value">{typeTag}</span>
          </div>

          <div className="file-info-field">
            <span className="file-info-label">Status</span>
            <div className="file-info-value" style={{ marginTop: '2px' }}>
              <ResourceStatus status={resource?.status} />
            </div>
          </div>

          {(resource?.error || resource?.errorMessage) && (
            <div className="file-info-field">
              <span className="file-info-label" style={{ color: 'var(--color-error)' }}>
                Reason
              </span>
              <span
                className="file-info-value"
                style={{ color: 'var(--color-error)', wordBreak: 'break-word' }}
              >
                {resource.error || resource.errorMessage}
              </span>
            </div>
          )}

          {resource?.createdAt && (
            <div className="file-info-field">
              <span className="file-info-label">Uploaded</span>
              <span className="file-info-value">{formatDate(resource.createdAt)}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
