import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { resourceApi } from '../services/resourceApi';
import { AppContext } from '../context/AppContext';

export const useResources = (channelId) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(Boolean(channelId));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingResourceId, setDeletingResourceId] = useState(null);
  const pollTimerRef = useRef(null);
  const appContext = useContext(AppContext);
  const toast = appContext?.toast;

  const fetchResources = useCallback(
    async (isPolling = false) => {
      if (!channelId) return [];
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        const data = await resourceApi.getResources(channelId);
        setResources(data || []);
        return data || [];
      } catch (err) {
        if (!isPolling) {
          setError(err.message);
          toast?.error(err.message, 'Failed to fetch resources');
        }
        return [];
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [channelId, toast]
  );

  // Initial fetch on channelId change
  useEffect(() => {
    if (channelId) {
      fetchResources();
    } else {
      setResources([]);
      setLoading(false);
    }
  }, [channelId, fetchResources]);

  // Polling management: Poll only if any resource is 'pending' or 'processing'
  useEffect(() => {
    // Clear any existing poll timer
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    const hasProcessing = resources.some(
      (r) => r.status === 'pending' || r.status === 'processing'
    );

    if (hasProcessing && channelId) {
      let pollCount = 0;
      const MAX_POLLS = 60; // 60 iterations * 3s = 3 minutes max

      pollTimerRef.current = setInterval(async () => {
        pollCount += 1;
        if (pollCount > MAX_POLLS) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          return;
        }

        const updated = await fetchResources(true);
        const stillProcessing = updated.some(
          (r) => r.status === 'pending' || r.status === 'processing'
        );

        if (!stillProcessing && pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }, 3000);
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [resources, channelId, fetchResources]);

  const uploadResource = useCallback(
    async (file) => {
      if (!channelId) throw new Error('Channel ID is required');
      setUploading(true);
      try {
        const newResource = await resourceApi.uploadResource(channelId, file);
        toast?.success(`File "${file.name}" uploaded. Processing started...`);

        // Immediately update resources with new resource (marked as pending/processing)
        setResources((prev) => [newResource, ...prev.filter((r) => r.id !== newResource.id)]);
        // Refetch to ensure sync
        fetchResources(true);
        return newResource;
      } catch (err) {
        toast?.error(err.message, 'Upload Failed');
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [channelId, toast, fetchResources]
  );

  const deleteResource = useCallback(
    async (targetChannelId, targetResourceId) => {
      // Support both (channelId, resourceId) and (resourceId) with hook's channelId
      const finalChannelId = targetResourceId ? targetChannelId : channelId;
      const finalResourceId = targetResourceId ? targetResourceId : targetChannelId;

      if (!finalChannelId || !finalResourceId) {
        toast?.error('Cannot delete: Missing channelId or resourceId');
        return;
      }

      setDeletingResourceId(finalResourceId);
      try {
        await resourceApi.deleteResource(finalChannelId, finalResourceId);
        await fetchResources(true);
        toast?.success('Resource deleted successfully');
      } catch (err) {
        let userMessage = 'Unable to delete this file. Please try again.';
        if (
          err.message?.toLowerCase().includes('not found') ||
          err.status === 404 ||
          err.status === 400
        ) {
          userMessage = 'Unable to delete this file. The resource could not be found.';
        } else if (err.message && !err.message.includes('Error') && !err.message.includes(':\\')) {
          userMessage = err.message;
        }
        toast?.error(userMessage, 'Delete Failed');
        throw err;
      } finally {
        setDeletingResourceId(null);
      }
    },
    [channelId, toast, fetchResources]
  );

  const downloadResource = useCallback(
    async (resourceId, fileName, targetChannelId = null) => {
      const finalChannelId = targetChannelId || channelId;
      if (!finalChannelId) return;
      try {
        await resourceApi.downloadResource(finalChannelId, resourceId, fileName);
      } catch (err) {
        toast?.error(err.message, 'Download Failed');
      }
    },
    [channelId, toast]
  );

  return {
    resources,
    loading,
    uploading,
    deletingResourceId,
    error,
    fetchResources,
    uploadResource,
    deleteResource,
    downloadResource,
  };
};

