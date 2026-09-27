import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppForm } from '../../components/app/AppForm/AppForm';
import { useApps } from '../../hooks/useApps';
import { Button } from '../../components/common/Button/Button';

export const CreateApp = () => {
  const navigate = useNavigate();
  const { createApp } = useApps(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const created = await createApp(formData);
      navigate(`/apps/${created.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }} className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/apps')}
        >
          Back
        </Button>
        <div>
          <h2>Create AI Assistant</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Configure a new standalone application. You can link knowledge channels to it later.
          </p>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-bg-surface)',
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <AppForm
          onSubmit={handleSubmit}
          loading={submitting}
          submitLabel="Create Assistant"
          onCancel={() => navigate('/apps')}
        />
      </div>
    </div>
  );
};
