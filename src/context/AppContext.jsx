import React, { createContext, useState, useCallback } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {},
  });

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast = {
      id,
      type: toast.type || 'info', // success, error, info, warning
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4500,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

  const showToast = {
    success: (message, title = 'Success') => addToast({ type: 'success', message, title }),
    error: (message, title = 'Error') => addToast({ type: 'error', message, title }),
    info: (message, title = 'Info') => addToast({ type: 'info', message, title }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', message, title }),
  };

  const showConfirm = useCallback(({ title, message, confirmText, cancelText, type = 'danger', onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title: title || 'Are you sure?',
      message: message || 'This action cannot be undone.',
      confirmText: confirmText || 'Delete',
      cancelText: cancelText || 'Cancel',
      type,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (onConfirm) await onConfirm();
      },
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    toast: showToast,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    confirmDialog,
    showConfirm,
    closeConfirm,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
