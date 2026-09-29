import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { validateFile } from '../../../utils/validators';
import './FileUpload.css';

export const FileUpload = ({ onUpload, uploading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (uploading || !file) return;
    setError(null);

    const validationErr = validateFile(file);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    try {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <div
        className={`file-upload-dropzone ${isDragging ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading) fileInputRef.current?.click();
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          disabled={uploading}
        />

        <div className="file-upload-icon-box">
          {uploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <UploadCloud size={24} />
          )}
        </div>

        <h4 className="file-upload-title">
          {uploading ? 'Uploading and vectorizing document...' : 'Click to upload or drag & drop'}
        </h4>
        <p className="file-upload-subtitle">
          {uploading
            ? 'Please wait while file chunks and vector embeddings are generated'
            : 'Add PDF or DOCX documents to index knowledge into this channel'}
        </p>

        <div className="file-upload-limits">
          <FileCheck size={13} color="var(--color-primary)" />
          <span>Supported: PDF, DOCX (Max 10 MB per file)</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
