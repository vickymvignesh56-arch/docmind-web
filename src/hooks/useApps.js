import { useState, useEffect, useCallback } from 'react';
import { appApi } from '../services/appApi';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useApps = (autoFetch = true) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const appContext = useContext(AppContext);
  const toast = appContext?.toast;

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appApi.getApps();
      setApps(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      toast?.error(err.message, 'Failed to load apps');
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (autoFetch) {
      fetchApps();
    }
  }, [autoFetch, fetchApps]);

  const createApp = useCallback(
    async (appData) => {
      try {
        const newApp = await appApi.createApp(appData);
        setApps((prev) => [newApp, ...prev]);
        toast?.success(`App "${newApp.name}" created successfully`);
        return newApp;
      } catch (err) {
        toast?.error(err.message, 'Create App Failed');
        throw err;
      }
    },
    [toast]
  );

  const updateApp = useCallback(
    async (id, appData) => {
      try {
        const updated = await appApi.updateApp(id, appData);
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
        toast?.success('App updated successfully');
        return updated;
      } catch (err) {
        toast?.error(err.message, 'Update Failed');
        throw err;
      }
    },
    [toast]
  );

  const deleteApp = useCallback(
    async (id) => {
      try {
        await appApi.deleteApp(id);
        setApps((prev) => prev.filter((a) => a.id !== id));
        toast?.success('App deleted successfully');
        return true;
      } catch (err) {
        toast?.error(err.message, 'Delete Failed');
        throw err;
      }
    },
    [toast]
  );

  return {
    apps,
    loading,
    error,
    fetchApps,
    createApp,
    updateApp,
    deleteApp,
  };
};
