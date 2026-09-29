import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FolderGit2,
  FileText,
  Settings,
  Cpu,
  User,
  X,
} from 'lucide-react';
import { RagFishLogo } from '../../common/RagFishLogo';
import { useAuth } from '../../../hooks/useAuth';
import { AppContext } from '../../../context/AppContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useContext(AppContext);

  const workspaceNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/apps', label: 'Applications', icon: Bot },
    { to: '/channels', label: 'Knowledge Channels', icon: FolderGit2 },
    { to: '/resources', label: 'All Documents', icon: FileText },
  ];

  const settingsNav = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const initial = (
    user?.name?.trim()?.charAt(0) ||
    user?.email?.trim()?.charAt(0) ||
    'U'
  ).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
            <RagFishLogo size={28} />
          </NavLink>
          <button
            type="button"
            className="sidebar-close-mobile"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-group">
            <span className="sidebar-section-title">Workspace</span>
            {workspaceNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={17} className="sidebar-nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="sidebar-group">
            <span className="sidebar-section-title">Settings & System</span>
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={17} className="sidebar-nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Minimal Bottom Account Profile Bar */}
        <div className="sidebar-footer">
          <NavLink
            to="/profile"
            className="sidebar-account-row"
            onClick={() => setSidebarOpen(false)}
            title="Manage Profile"
          >
            <div className="sidebar-avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initial
              )}
            </div>
            <div className="sidebar-account-info">
              <span className="sidebar-account-name">{user?.name || 'DocMind User'}</span>
              <span className="sidebar-account-role">Workspace Admin</span>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
