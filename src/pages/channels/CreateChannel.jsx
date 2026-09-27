import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ChannelForm } from '../../components/channel/ChannelForm/ChannelForm';
import { useChannels } from '../../hooks/useChannels';
import { Button } from '../../components/common/Button/Button';

export const CreateChannel = () => {
  const navigate = useNavigate();
  const { createChannel } = useChannels(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const created = await createChannel(formData);
      navigate(`/channels/${created.id}`);
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
          onClick={() => navigate('/channels')}
        >
          Back
        </Button>
        <div>
          <h2>Create Knowledge Channel</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Channels store documents independently and can be linked to any assistant later.
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
        <ChannelForm
          onSubmit={handleSubmit}
          loading={submitting}
          submitLabel="Create Knowledge Channel"
          onCancel={() => navigate('/channels')}
        />
      </div>
    </div>
  );
};
