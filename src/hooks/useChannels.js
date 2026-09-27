import { useState, useEffect, useCallback, useContext } from 'react';
import { channelApi } from '../services/channelApi';
import { AppContext } from '../context/AppContext';

export const useChannels = (autoFetch = true) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const appContext = useContext(AppContext);
  const toast = appContext?.toast;

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await channelApi.getChannels();
      setChannels(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      toast?.error(err.message, 'Failed to load channels');
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (autoFetch) {
      fetchChannels();
    }
  }, [autoFetch, fetchChannels]);

  const createChannel = useCallback(
    async (channelData) => {
      try {
        const newChannel = await channelApi.createChannel(channelData);
        setChannels((prev) => [newChannel, ...prev]);
        toast?.success(`Channel "${newChannel.name}" created successfully`);
        return newChannel;
      } catch (err) {
        toast?.error(err.message, 'Create Channel Failed');
        throw err;
      }
    },
    [toast]
  );

  const updateChannel = useCallback(
    async (id, channelData) => {
      try {
        const updated = await channelApi.updateChannel(id, channelData);
        setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
        toast?.success('Channel updated successfully');
        return updated;
      } catch (err) {
        toast?.error(err.message, 'Update Failed');
        throw err;
      }
    },
    [toast]
  );

  const deleteChannel = useCallback(
    async (channelId) => {
      try {
        await channelApi.deleteChannel(channelId);
        setChannels((prev) => prev.filter((c) => c.id !== channelId));
        toast?.success('Channel deleted successfully');
        return true;
      } catch (err) {
        toast?.error(err.message, 'Delete Failed');
        throw err;
      }
    },
    [toast]
  );

  return {
    channels,
    loading,
    error,
    fetchChannels,
    createChannel,
    updateChannel,
    deleteChannel,
  };
};
