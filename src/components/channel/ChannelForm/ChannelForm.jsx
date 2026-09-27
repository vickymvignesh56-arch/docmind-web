import React, { useState, useEffect } from 'react';
import { FileText, Database, Table } from 'lucide-react';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import './ChannelForm.css';

export const ChannelForm = ({
  initialData = null,
  onSubmit,
  loading = false,
  submitLabel = 'Create Channel',
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channelType: 'files',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        channelType: initialData.channelType || 'files',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeSelect = (type) => {
    if (type !== 'files') return; // only 'files' currently supported by backend
    setFormData((prev) => ({ ...prev, channelType: type }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Channel name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="channel-form">
      <Input
        label="Channel Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. HR Documents, Product Manuals, Legal Contracts"
        required
        error={errors.name}
      />

      <Input
        label="Description"
        name="description"
        as="textarea"
        rows={3}
        value={formData.description}
        onChange={handleChange}
        placeholder="Brief description of the documents and knowledge stored in this channel..."
      />

      <div className="input-group">
        <label className="input-label">
          <span>Channel Knowledge Type</span>
        </label>
        <div className="channel-type-grid">
          <div
            className={`channel-type-option ${formData.channelType === 'files' ? 'selected' : ''}`}
            onClick={() => handleTypeSelect('files')}
          >
            <FileText size={22} color="var(--color-primary)" />
            <span className="channel-type-title">Files (PDF, DOCX)</span>
            <span className="channel-type-badge" style={{ color: 'var(--color-success)' }}>
              Ready & Supported
            </span>
          </div>

          <div className="channel-type-option disabled" title="Database connector coming in next release">
            <Database size={22} color="var(--color-text-muted)" />
            <span className="channel-type-title">Database</span>
            <span className="channel-type-badge">Coming Soon</span>
          </div>

          <div className="channel-type-option disabled" title="Spreadsheet connector coming in next release">
            <Table size={22} color="var(--color-text-muted)" />
            <span className="channel-type-title">XLSX Spreadsheets</span>
            <span className="channel-type-badge">Coming Soon</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
