import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, FolderGit2, Cpu, Plus, ArrowRight, FolderPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApps } from '../../hooks/useApps';
import { useChannels } from '../../hooks/useChannels';
import { useProviders } from '../../hooks/useProviders';
import { AppList } from '../../components/app/AppList/AppList';
import { Button } from '../../components/common/Button/Button';
import { AppContext } from '../../context/AppContext';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { apps, loading: loadingApps, deleteApp } = useApps();
  const { channels, loading: loadingChannels } = useChannels();
  const { providers, loading: loadingProviders } = useProviders();
  const { showConfirm } = useContext(AppContext);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const activeProvidersCount = providers.filter((p) => p.isActive).length;

  const handleDeleteApp = (app) => {
    showConfirm({
      title: `Delete "${app.name}"?`,
      message: 'This will permanently remove the application and all associated chat sessions. The mapped channels and original files will NOT be deleted.',
      confirmText: 'Delete App',
      onConfirm: async () => {
        await deleteApp(app.id);
      },
    });
  };

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Card */}
      <div className="dashboard-hero">
        <div>
          <h1 className="dashboard-greeting-title">
            {getGreeting()}, {user?.name || 'Explorer'}
          </h1>
          <p className="dashboard-greeting-sub">Your knowledge. Your AI.</p>
        </div>

        <div className="dashboard-quick-actions">
          <Button
            variant="secondary"
            size="md"
            icon={FolderPlus}
            onClick={() => navigate('/channels/create')}
          >
            Create Channel
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/apps/create')}
          >
            Create App
          </Button>
        </div>
      </div>

      {/* Real Platform Stats (All populated from real backend API) */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Bot size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loadingApps ? '—' : apps.length}</span>
            <span className="stat-label">AI Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <FolderGit2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loadingChannels ? '—' : channels.length}</span>
            <span className="stat-label">Knowledge Channels</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
            <Cpu size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loadingProviders ? '—' : activeProvidersCount > 0 ? 'Active' : 'Not configured'}
            </span>
            <span className="stat-label">LLM Provider Status</span>
          </div>
        </div>
      </div>

      {/* My Applications Section */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">My Applications</h2>
          {apps.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              iconRight={ArrowRight}
              onClick={() => navigate('/apps')}
            >
              View All ({apps.length})
            </Button>
          )}
        </div>

        <AppList
          apps={apps.slice(0, 6)}
          loading={loadingApps}
          onDelete={handleDeleteApp}
          onEdit={(app) => navigate(`/apps/${app.id}`)}
        />
      </div>
    </div>
  );
};
