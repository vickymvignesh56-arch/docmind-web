import React, { useState } from 'react';
import { User, Cpu } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { LLMProviderSettings } from './LLMProviderSettings';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'providers'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2>Platform Settings</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Configure your user profile, credentials, and LLM model providers
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`app-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={16} />
          <span>Profile & Account</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('providers')}
          className={`app-tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
        >
          <Cpu size={16} />
          <span>LLM Providers</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' ? <ProfileSettings /> : <LLMProviderSettings />}
    </div>
  );
};
