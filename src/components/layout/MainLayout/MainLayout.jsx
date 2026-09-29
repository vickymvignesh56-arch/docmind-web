import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { Toast } from '../../common/Toast/Toast';
import { ConfirmDialog } from '../../common/ConfirmDialog/ConfirmDialog';
import { AppContext } from '../../../context/AppContext';
import './MainLayout.css';

export const MainLayout = () => {
  const { toasts, removeToast, confirmDialog, closeConfirm } = useContext(AppContext);
  const location = useLocation();
  const isChatWorkspace = location.pathname.includes('/chat');

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <Header />
        <main className={`main-page-content ${isChatWorkspace ? 'is-chat-workspace' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Global Toast Stack */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
      />
    </div>
  );
};
