import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useApps } from '../../hooks/useApps';
import { AppList } from '../../components/app/AppList/AppList';
import { Button } from '../../components/common/Button/Button';
import { AppContext } from '../../context/AppContext';

export const Apps = () => {
  const navigate = useNavigate();
  const { apps, loading, deleteApp } = useApps();
  const [searchTerm, setSearchTerm] = useState('');
  const { showConfirm } = useContext(AppContext);

  const filteredApps = apps.filter(
    (app) =>
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (app) => {
    showConfirm({
      title: `Delete "${app.name}"?`,
      message:
        'This will permanently delete this application. All mapped channels will remain intact in your channel library.',
      confirmText: 'Delete App',
      onConfirm: async () => {
        await deleteApp(app.id);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2>AI Applications</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Build and manage autonomous assistants connected to your knowledge channels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="input-wrapper" style={{ width: '240px' }}>
            <div className="input-icon-left">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field input-with-icon-left"
              style={{ height: '38px' }}
            />
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/apps/create')}
          >
            Create App
          </Button>
        </div>
      </div>

      {/* Apps Grid */}
      <AppList
        apps={filteredApps}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(app) => navigate(`/apps/${app.id}`)}
      />
    </div>
  );
};
