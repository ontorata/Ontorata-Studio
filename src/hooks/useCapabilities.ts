import { useEffect, useState } from 'react';
import type { CapabilityManifestView } from '../api/ratary-client';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useOptionalStudioClient } from './useStudioClient';

export function useCapabilities() {
  const client = useOptionalStudioClient();
  const [manifest, setManifest] = useState<CapabilityManifestView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setManifest(null);
      setError('Ratary connection is not available for this tab.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    client
      .getCapabilities()
      .then((data) => {
        if (!cancelled) {
          setManifest(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(formatRataryApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  return { manifest, capabilities: manifest?.capabilities ?? {}, loading, error };
}
