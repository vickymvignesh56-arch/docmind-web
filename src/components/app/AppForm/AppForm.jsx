import React, { useState, useEffect } from 'react';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import './AppForm.css';

export const AppForm = ({
  initialData = null,
  onSubmit,
  loading = false,
  submitLabel = 'Create Application',
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    status: true,
    llmProvider: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        systemPrompt: initialData.systemPrompt || '',
        status: initialData.status !== undefined ? initialData.status : true,
        llmProvider: initialData.llmProvider !== undefined ? initialData.llmProvider : false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Application name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
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
    <form onSubmit={handleSubmit} className="app-form">
      <Input
        label="Application Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. HR Assistant, Customer Support Bot"
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
        placeholder="Describe the purpose and scope of this AI assistant..."
        error={errors.description}
        helperText="Brief summary visible on application cards (max 500 characters)"
      />

      <Input
        label="System Instructions (Prompt)"
        name="systemPrompt"
        as="textarea"
        rows={4}
        value={formData.systemPrompt}
        onChange={handleChange}
        placeholder="e.g. You are an expert HR assistant. Answer questions clearly using the provided document sources only."
        helperText="Defines the behavior and persona of this assistant during chat"
      />

      <div className="form-toggle-row">
        <div className="form-toggle-info">
          <span className="form-toggle-label">Active Status</span>
          <span className="form-toggle-desc">Enable or disable interactions with this assistant</span>
        </div>
        <label className="form-switch">
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleChange}
          />
          <span className="form-slider" />
        </label>
      </div>

      <div className="form-toggle-row">
        <div className="form-toggle-info">
          <span className="form-toggle-label">Dedicated LLM Provider</span>
          <span className="form-toggle-desc">Enable dedicated model configuration for this application</span>
        </div>
        <label className="form-switch">
          <input
            type="checkbox"
            name="llmProvider"
            checked={formData.llmProvider}
            onChange={handleChange}
          />
          <span className="form-slider" />
        </label>
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
