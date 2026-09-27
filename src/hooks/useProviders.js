import { useState, useEffect, useCallback, useContext } from 'react';
import { providerApi } from '../services/providerApi';
import { AppContext } from '../context/AppContext';

export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState(null); // provider type being saved
  const [activatingProvider, setActivatingProvider] = useState(false);
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
        toast?.success(`${provider} provider saved successfully`);
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
    async (isActive) => {
      setActivatingProvider(true);
      try {
        const updated = await providerApi.updateStatus(isActive);
        toast?.success(
          isActive ? 'Provider activated successfully' : 'Provider deactivated'
        );
        await fetchProviders();
        return updated;
      } catch (err) {
        toast?.error(err.message, 'Status Update Failed');
        throw err;
      } finally {
        setActivatingProvider(false);
      }
    },
    [fetchProviders, toast]
  );

  return {
    providers,
    loading,
    savingProvider,
    activatingProvider,
    error,
    fetchProviders,
    saveProvider,
    toggleStatus,
  };
};
