import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Plus } from 'lucide-react';
import { AppCard } from '../AppCard/AppCard';
import { CardSkeleton } from '../../common/Loader/Loader';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import './AppList.css';

export const AppList = ({
  apps = [],
  loading = false,
  onDelete,
  onEdit,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="app-grid">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!apps.length) {
    return (
      <EmptyState
        icon={Bot}
        title="No AI applications yet"
        description="Create your first AI assistant to connect knowledge channels and start asking questions."
        actionLabel="Create Application"
        actionIcon={Plus}
        onAction={() => navigate('/apps/create')}
      />
    );
  }

  return (
    <div className="app-grid">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
