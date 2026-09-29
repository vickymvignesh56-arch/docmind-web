import { useState, useEffect, useCallback, useContext } from 'react';
import { providerApi } from '../services/providerApi';
import { AppContext } from '../context/AppContext';

export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState(null); // provider type being saved
  const [togglingProvider, setTogglingProvider] = useState(null); // provider type being toggled
  const [error, setError] = useState(null);

  const appContext = useContext(AppContext);
  const toast = appContext?.toast;

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await providerApi.getProvider();
      setProviders(data || []);
      return data || [];
    } catch (err) {
      console.warn('LLM Provider fetch:', err.message);
      setProviders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const saveProvider = useCallback(
    async ({ provider, apiKey, embeddingModel, chatModel }) => {
      setSavingProvider(provider);
      setError(null);
      try {
        const saved = await providerApi.upsertProvider({
          provider,
          apiKey,
          embeddingModel,
          chatModel,
        });
        await fetchProviders();
        return saved;
      } catch (err) {
        setError(err.message);
        toast?.error(err.message, `Failed to save ${provider}`);
        throw err;
      } finally {
        setSavingProvider(null);
      }
    },
    [fetchProviders, toast]
  );

  const toggleStatus = useCallback(
    async (isActive, providerType) => {
      setTogglingProvider(providerType || true);
      try {
        const updated = await providerApi.updateStatus(isActive);
        await fetchProviders();
        return updated;
      } catch (err) {
        toast?.error(err.message, 'Status Update Failed');
        throw err;
      } finally {
        setTogglingProvider(null);
      }
    },
    [fetchProviders, toast]
  );

  return {
    providers,
    setProviders,
    loading,
    savingProvider,
    togglingProvider,
    activatingProvider: Boolean(togglingProvider),
    error,
    fetchProviders,
    saveProvider,
    toggleStatus,
  };
};
