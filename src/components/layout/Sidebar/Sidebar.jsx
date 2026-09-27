import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FolderGit2,
  Settings,
  LogOut,
  X,
  FileText,
} from 'lucide-react';
import { RagFishLogo } from '../../common/RagFishLogo';
import { useAuth } from '../../../hooks/useAuth';
import { AppContext } from '../../../context/AppContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useContext(AppContext);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/apps', label: 'Applications', icon: Bot },
    { to: '/channels', label: 'Channels', icon: FolderGit2 },
    { to: '/resources', label: 'All Documents', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

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
            className="sidebar-close-mobile show-on-mobile"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            style={{ display: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">Navigation</span>
          {navItems.map((item) => {
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
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
