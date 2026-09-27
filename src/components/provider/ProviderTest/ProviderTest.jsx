import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import './ProviderTest.css';

export const ProviderTest = ({ providerName, isConnected, statusMessage }) => {
  return (
    <div className="provider-test-card">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <CheckCircle2 size={16} color="var(--color-success)" />
        ) : (
          <XCircle size={16} color="var(--color-error)" />
        )}
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
          {providerName}: {isConnected ? 'Active & Ready' : 'Disconnected'}
        </span>
      </div>

      {statusMessage && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {statusMessage}
        </span>
      )}
    </div>
  );
};
