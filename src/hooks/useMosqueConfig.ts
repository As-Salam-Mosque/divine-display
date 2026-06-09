import { useEffect, useState } from "react";
import type { MosqueConfig, MosqueConfigState } from "../types";
import fallbackConfig from "../../mosque.config";

const DEFAULT_CONFIG_URL = import.meta.env.VITE_MOSQUE_CONFIG_URL || "";
const DEFAULT_API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

interface InternalConfigState {
  config: MosqueConfig | null;
  error: string | null;
  sourceUrl: string | null;
}

export interface UseMosqueConfigOptions {
  /** URL to fetch config from. If provided, takes precedence over apiBase + slug. */
  url?: string;
  /** Base URL of the API (e.g., "http://localhost:8000") */
  apiBase?: string;
  /** Mosque slug to fetch from API. Used if apiBase is provided. */
  slug?: string;
}

export function useMosqueConfig(
  options?: UseMosqueConfigOptions | string,
): MosqueConfigState {
  // Support both legacy string parameter and new options object
  const opts: UseMosqueConfigOptions =
    typeof options === "string" ? { url: options } : options || {};
  const resolvedUrl = opts.url?.trim() || DEFAULT_CONFIG_URL || undefined;
  const resolvedApiBase =
    opts.apiBase?.trim() || DEFAULT_API_BASE_URL || undefined;
  const resolvedSlug = opts.slug?.trim() || undefined;

  // Determine which URL to use: explicit URL takes precedence over API-based fetching
  const useApi = Boolean(resolvedApiBase && resolvedSlug && !resolvedUrl);
  const fetchUrl = useApi
    ? `${resolvedApiBase}/api/v1/mosques?name=${encodeURIComponent(resolvedSlug as string)}`
    : resolvedUrl;

  const [state, setState] = useState<InternalConfigState>(() => ({
    config: null,
    error: null,
    sourceUrl: null,
  }));

  useEffect(() => {
    if (!fetchUrl) return;

    let isUnmounted = false;
    let currentController: AbortController | null = null;

    const fetchConfig = async () => {
      // abort any in-flight fetch to avoid overlapping requests
      if (currentController) {
        currentController.abort();
      }
      currentController = new AbortController();

      try {
        const response = await fetch(fetchUrl, {
          signal: currentController.signal,
        });
        if (!response.ok) {
          throw new Error(
            `Config request failed: ${response.status} ${response.statusText}`,
          );
        }

        // If fetching from the API, extract configuration from the response
        const data = (await response.json()) as Record<string, unknown>;
        const config = useApi
          ? (data.configuration as unknown as MosqueConfig)
          : (data as unknown as MosqueConfig);

        if (!isUnmounted) {
          setState({
            config,
            error: null,
            sourceUrl: fetchUrl,
          });
        }
      } catch (err: unknown) {
        // If aborted, just exit silently
        if (currentController?.signal.aborted) return;
        if (!isUnmounted) {
          setState({
            config: null,
            error: String(err),
            sourceUrl: fetchUrl,
          });
        }
      } finally {
        currentController = null;
      }
    };

    // initial fetch
    fetchConfig();

    // poll every 30 minutes
    const intervalId = window.setInterval(fetchConfig, 30 * 60 * 1000);

    return () => {
      isUnmounted = true;
      if (currentController) currentController.abort();
      clearInterval(intervalId);
    };
  }, [fetchUrl, useApi]);

  const hasFetchUrl = Boolean(fetchUrl);
  const isCurrent = fetchUrl ? state.sourceUrl === fetchUrl : false;
  const hasConfig = state.config !== null;

  // If URL is provided and we don't have config yet and no error, we're loading
  const loading = hasFetchUrl && !hasConfig && state.error === null;

  // Use remote config if we have it and it's current, otherwise fall back
  const config: MosqueConfig =
    hasConfig && isCurrent ? (state.config as MosqueConfig) : fallbackConfig;
  const error = isCurrent ? state.error : null;
  const source = hasConfig && isCurrent ? "remote" : "default";

  return { config, loading, error, source };
}
