import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Table,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Modal } from '../../common/Modal/Modal';
import { Button } from '../../common/Button/Button';
import { ResourceStatus } from '../ResourceStatus/ResourceStatus';
import { resourceApi } from '../../../services/resourceApi';
import { formatFileSize, formatDate } from '../../../utils/formatters';
import './ResourcePreviewModal.css';

export const ResourcePreviewModal = ({
  isOpen,
  onClose,
  resource,
  channelId,
  onDownload,
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadingBlob, setLoadingBlob] = useState(false);
  const [blobError, setBlobError] = useState(null);

  const fileName = resource?.fileName || 'Document';
  const fileType = (resource?.fileType || '').toLowerCase();
  const ext = fileName.split('.').pop().toLowerCase();

  const isPdf = fileType === 'pdf' || ext === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || fileType.includes('image');
  const isDocx = fileType === 'docx' || ext === 'docx' || ext === 'doc';
  const isXlsx = fileType === 'xlsx' || ext === 'xlsx' || ext === 'xls' || ext === 'csv';

  useEffect(() => {
    let active = true;
    let createdUrl = null;

    if (isOpen && resource && channelId && (isPdf || isImage)) {
      setLoadingBlob(true);
      setBlobError(null);

      resourceApi
        .getResourceBlob(channelId, resource.id)
        .then((blobData) => {
          if (!active) return;
          const mimeType = isPdf ? 'application/pdf' : blobData.type || 'image/png';
          const blob = new Blob([blobData], { type: mimeType });
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
        })
        .catch((err) => {
          if (!active) return;
          console.warn('Preview blob fetch error:', err.message);
          setBlobError(err.message || 'Unable to render inline preview');
        })
        .finally(() => {
          if (active) setLoadingBlob(false);
        });
    } else {
      setBlobUrl(null);
      setLoadingBlob(false);
      setBlobError(null);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, resource, channelId, isPdf, isImage]);

  if (!resource) return null;

  const renderViewer = () => {
    if (loadingBlob) {
      return (
        <div className="flex flex-col items-center justify-center p-8 gap-3" style={{ minHeight: '360px' }}>
          <Loader2 size={32} className="status-spinner text-primary" />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Loading document preview...
          </span>
        </div>
      );
    }

    // PDF Preview
    if (isPdf) {
      if (blobUrl && !blobError) {
        return (
          <iframe
            src={`${blobUrl}#toolbar=0`}
            title={fileName}
            className="preview-iframe"
          />
        );
      }
      return (
        <div className="preview-doc-card">
          <div className="preview-doc-icon-box preview-doc-icon-pdf">
            <FileText size={36} />
          </div>
          <h4 className="preview-doc-title">{fileName}</h4>
          <p className="preview-doc-desc">
            {blobError
              ? 'Inline browser preview is currently unavailable for this document. You can download the file to view its full content.'
              : 'PDF document indexed into vector store.'}
          </p>
          <div className="preview-doc-details">
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">File Type</span>
              <span className="preview-doc-detail-value">PDF Document</span>
            </div>
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">Size</span>
              <span className="preview-doc-detail-value">{formatFileSize(resource.size)}</span>
            </div>
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">Status</span>
              <span className="preview-doc-detail-value">{resource.status || 'Ready'}</span>
            </div>
          </div>
          {onDownload && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => onDownload(resource.id, fileName)}
            >
              Download PDF
            </Button>
          )}
        </div>
      );
    }

    // Image Preview
    if (isImage) {
      if (blobUrl && !blobError) {
        return (
          <img src={blobUrl} alt={fileName} className="preview-image" />
        );
      }
      return (
        <div className="preview-doc-card">
          <div className="preview-doc-icon-box preview-doc-icon-generic">
            <ImageIcon size={36} />
          </div>
          <h4 className="preview-doc-title">{fileName}</h4>
          <p className="preview-doc-desc">Image file attached to channel.</p>
        </div>
      );
    }

    // DOCX Preview (Document Overview Card)
    if (isDocx) {
      return (
        <div className="preview-doc-card">
          <div className="preview-doc-icon-box preview-doc-icon-docx">
            <FileText size={36} />
          </div>
          <h4 className="preview-doc-title">{fileName}</h4>
          <p className="preview-doc-desc">
            Microsoft Word document processed and chunked for AI semantic search.
          </p>

          <div className="preview-doc-details">
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">File Format</span>
              <span className="preview-doc-detail-value">Microsoft Word (.docx)</span>
            </div>
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">File Size</span>
              <span className="preview-doc-detail-value">{formatFileSize(resource.size)}</span>
            </div>
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">Processing Status</span>
              <span className="preview-doc-detail-value">{resource.status || 'Ready'}</span>
            </div>
            {resource.createdAt && (
              <div className="preview-doc-detail-row">
                <span className="preview-doc-detail-label">Uploaded Date</span>
                <span className="preview-doc-detail-value">{formatDate(resource.createdAt)}</span>
              </div>
            )}
          </div>

          {onDownload && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => onDownload(resource.id, fileName)}
            >
              Download Word Document
            </Button>
          )}
        </div>
      );
    }

    // XLSX / Excel Preview
    if (isXlsx) {
      return (
        <div className="preview-doc-card">
          <div className="preview-doc-icon-box preview-doc-icon-xlsx">
            <Table size={36} />
          </div>
          <h4 className="preview-doc-title">{fileName}</h4>
          <p className="preview-doc-desc">
            Spreadsheet document indexed for tabular data parsing and semantic query retrieval.
          </p>

          <div className="preview-doc-details">
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">File Format</span>
              <span className="preview-doc-detail-value">Excel Spreadsheet (.xlsx)</span>
            </div>
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">File Size</span>
              <span className="preview-doc-detail-value">{formatFileSize(resource.size)}</span>
            </div>
            <div className="preview-doc-detail-row">
              <span className="preview-doc-detail-label">Processing Status</span>
              <span className="preview-doc-detail-value">{resource.status || 'Ready'}</span>
            </div>
            {resource.createdAt && (
              <div className="preview-doc-detail-row">
                <span className="preview-doc-detail-label">Uploaded Date</span>
                <span className="preview-doc-detail-value">{formatDate(resource.createdAt)}</span>
              </div>
            )}
          </div>

          {onDownload && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => onDownload(resource.id, fileName)}
            >
              Download Spreadsheet
            </Button>
          )}
        </div>
      );
    }

    // Generic / Other Document
    return (
      <div className="preview-doc-card">
        <div className="preview-doc-icon-box preview-doc-icon-generic">
          <FileText size={36} />
        </div>
        <h4 className="preview-doc-title">{fileName}</h4>
        <p className="preview-doc-desc">
          File stored in knowledge channel and indexed for RAG queries.
        </p>

        <div className="preview-doc-details">
          <div className="preview-doc-detail-row">
            <span className="preview-doc-detail-label">File Type</span>
            <span className="preview-doc-detail-value" style={{ textTransform: 'uppercase' }}>
              {fileType || ext || 'FILE'}
            </span>
          </div>
          <div className="preview-doc-detail-row">
            <span className="preview-doc-detail-label">File Size</span>
            <span className="preview-doc-detail-value">{formatFileSize(resource.size)}</span>
          </div>
          <div className="preview-doc-detail-row">
            <span className="preview-doc-detail-label">Status</span>
            <span className="preview-doc-detail-value">{resource.status || 'Ready'}</span>
          </div>
        </div>

        {onDownload && (
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => onDownload(resource.id, fileName)}
          >
            Download File
          </Button>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fileName}
      maxWidth="780px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => onDownload(resource.id, fileName)}
              >
                Download
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="preview-modal-content">
        <div className="preview-meta-bar">
          <div className="preview-meta-info">
            <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>
              {fileType || ext || 'DOCUMENT'}
            </span>
            <span>•</span>
            <span>{formatFileSize(resource.size)}</span>
            {resource.createdAt && (
              <>
                <span>•</span>
                <span>Uploaded {formatDate(resource.createdAt)}</span>
              </>
            )}
          </div>
          <ResourceStatus status={resource.status} />
        </div>

        <div className="preview-viewer-container">{renderViewer()}</div>
      </div>
    </Modal>
  );
};
