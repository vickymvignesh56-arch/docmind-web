import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Settings, Cpu, LogOut, ChevronDown } from 'lucide-react';
import { AppContext } from '../../../context/AppContext';
import { useAuth } from '../../../hooks/useAuth';
import './Header.css';

const ROUTE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your knowledge platform' },
  '/apps': { title: 'AI Applications', subtitle: 'Manage your autonomous RAG assistants' },
  '/apps/create': { title: 'Create Application', subtitle: 'Configure a new autonomous RAG assistant' },
  '/channels': { title: 'Knowledge Channels', subtitle: 'Independent repositories for your documents' },
  '/channels/create': { title: 'Create Channel', subtitle: 'Create a new independent document channel' },
  '/resources': { title: 'Knowledge Documents', subtitle: 'All channel documents and processing status' },
  '/profile': { title: 'Profile', subtitle: 'Manage your personal profile and account details' },
  '/settings': { title: 'Settings', subtitle: 'Manage workspace configuration and LLM providers' },
  '/settings/profile': { title: 'Profile', subtitle: 'Manage your personal profile and account details' },
  '/settings/providers': { title: 'Settings', subtitle: 'Manage workspace configuration and LLM providers' },
};

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useContext(AppContext);
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Derive route info
  const path = location.pathname;
  let currentInfo = ROUTE_TITLES[path];

  if (!currentInfo) {
    if (path.includes('/apps/') && path.includes('/chat')) {
      currentInfo = { title: 'AI Assistant Chat', subtitle: 'Interact with connected knowledge' };
    } else if (path.includes('/apps/') && path.includes('/channel/')) {
      currentInfo = { title: 'Channel Resource Mapping', subtitle: 'Manage resources mapped to application' };
    } else if (path.startsWith('/apps/')) {
      currentInfo = { title: 'Application Details', subtitle: 'Manage app channels and configuration' };
    } else if (path.startsWith('/channels/')) {
      currentInfo = { title: 'Channel Details', subtitle: 'Manage documents and vector embeddings' };
    } else {
      currentInfo = { title: 'DocMind', subtitle: 'Intelligent Knowledge & RAG Platform' };
    }
  }

  const initial = (
    user?.name?.trim()?.charAt(0) ||
    user?.email?.trim()?.charAt(0) ||
    'U'
  ).toUpperCase();

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={toggleSidebar}
          aria-label="Open sidebar navigation"
        >
          <Menu size={18} />
        </button>

        <div className="header-title-box">
          <h1 className="header-title">{currentInfo.title}</h1>
          <span className="header-subtitle">{currentInfo.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Subtle System Status Indicator */}
        <div className="system-status-indicator" title="System operational and connected to vector backend">
          <span className="system-status-dot connected" />
          <span className="system-status-text">Connected</span>
        </div>

        {/* Profile Dropdown Menu */}
        <div className="header-profile-wrapper" ref={menuRef}>
          <button
            type="button"
            className="header-profile-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="User account menu"
          >
            <div className="header-avatar">
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
            <span className="header-user-name hide-on-mobile">{user?.name || 'User'}</span>
            <ChevronDown size={14} className="header-chevron hide-on-mobile" />
          </button>

          {menuOpen && (
            <div className="header-profile-dropdown animate-fade-in" role="menu">
              <div className="profile-dropdown-header">
                <span className="dropdown-user-name">{user?.name || 'DocMind User'}</span>
                <span className="dropdown-user-email">{user?.email || 'admin@docmind.ai'}</span>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
              >
                <User size={15} />
                <span>Profile</span>
              </button>

              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
              >
                <Settings size={15} />
                <span>Settings</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-menu-item danger"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
