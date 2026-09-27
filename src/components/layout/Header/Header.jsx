import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, Bot, FolderPlus } from 'lucide-react';
import { Button } from '../../common/Button/Button';
import { AppContext } from '../../../context/AppContext';
import './Header.css';

const ROUTE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your AI applications & knowledge' },
  '/apps': { title: 'AI Applications', subtitle: 'Manage your autonomous RAG assistants' },
  '/apps/create': { title: 'Create Application', subtitle: 'Configure a new autonomous RAG assistant' },
  '/channels': { title: 'Knowledge Channels', subtitle: 'Independent repositories for your documents' },
  '/channels/create': { title: 'Create Channel', subtitle: 'Create a new independent document channel' },
  '/resources': { title: 'Knowledge Documents', subtitle: 'All channel resources and processing status' },
  '/settings': { title: 'Platform Settings', subtitle: 'Manage profile and LLM provider connections' },
};

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useContext(AppContext);

  // Derive route info
  const path = location.pathname;
  let currentInfo = ROUTE_TITLES[path];

  if (!currentInfo) {
    if (path.includes('/apps/') && path.includes('/chat')) {
      currentInfo = { title: 'AI Assistant Chat', subtitle: 'Interact with your connected knowledge' };
    } else if (path.includes('/apps/') && path.includes('/channel/')) {
      currentInfo = { title: 'App Channel Mapping', subtitle: 'Select channel resources available to this app' };
    } else if (path.startsWith('/apps/')) {
      currentInfo = { title: 'Application Details', subtitle: 'Configure app channels and knowledge mapping' };
    } else if (path.startsWith('/channels/')) {
      currentInfo = { title: 'Channel Details', subtitle: 'Manage and upload documents to this channel' };
    } else {
      currentInfo = { title: 'Ragfish', subtitle: 'Intelligent Knowledge & RAG Platform' };
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={toggleSidebar}
          aria-label="Open sidebar navigation"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-box">
          <h1 className="header-title">{currentInfo.title}</h1>
          <span className="header-subtitle">{currentInfo.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-status-badge hide-on-mobile">
          <span className="header-status-dot animate-pulse" />
          <span>API Connected</span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={FolderPlus}
          onClick={() => navigate('/channels/create')}
          className="hide-on-mobile"
        >
          New Channel
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/apps/create')}
        >
          New App
        </Button>
      </div>
    </header>
  );
};
