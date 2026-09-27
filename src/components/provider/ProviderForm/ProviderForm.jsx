import React, { useState } from 'react';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Save } from 'lucide-react';
import './ProviderForm.css';

export const ProviderForm = ({
  providerType,
  initialData,
  onSave,
  loading = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [chatModel, setChatModel] = useState(initialData?.chatModel || '');
  const [embeddingModel, setEmbeddingModel] = useState(initialData?.embeddingModel || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      provider: providerType,
      apiKey: apiKey.trim() || undefined,
      chatModel: chatModel.trim(),
      embeddingModel: embeddingModel.trim(),
    });
    setApiKey('');
  };

  return (
    <form onSubmit={handleSubmit} className="provider-form">
      <Input
        label="API Key"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={initialData?.apiKey || 'Enter API Key'}
        helperText="Leave empty to retain existing key"
      />

      <Input
        label="Chat Model"
        value={chatModel}
        onChange={(e) => setChatModel(e.target.value)}
        placeholder="e.g. gemini-2.5-flash"
        required
      />

      <Input
        label="Embedding Model"
        value={embeddingModel}
        onChange={(e) => setEmbeddingModel(e.target.value)}
        placeholder="e.g. gemini-embedding-2"
        required
      />

      <Button type="submit" variant="primary" size="sm" icon={Save} loading={loading}>
        Save Provider
      </Button>
    </form>
  );
};
