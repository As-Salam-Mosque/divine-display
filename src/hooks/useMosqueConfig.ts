import { useEffect, useState } from "react";
import type { MosqueConfig, MosqueConfigState } from "../types";
import fallbackConfig from "../../mosque.config";

const DEFAULT_CONFIG_URL = import.meta.env.VITE_MOSQUE_CONFIG_URL || "";

interface InternalConfigState {
  config: MosqueConfig | null;
  error: string | null;
  sourceUrl: string | null;
}

export function useMosqueConfig(
  url: string = DEFAULT_CONFIG_URL,
): MosqueConfigState {
  const resolvedUrl = url?.trim() || undefined;

  const [state, setState] = useState<InternalConfigState>(() => ({
    config: null,
    error: null,
    sourceUrl: null,
  }));

  useEffect(() => {
    if (!resolvedUrl) return;

    let isUnmounted = false;
    let currentController: AbortController | null = null;

    const fetchConfig = async () => {
      // abort any in-flight fetch to avoid overlapping requests
      if (currentController) {
        currentController.abort();
      }
      currentController = new AbortController();

      try {
        const response = await fetch(resolvedUrl, {
          signal: currentController.signal,
        });
        if (!response.ok) {
          throw new Error(
            `Config request failed: ${response.status} ${response.statusText}`,
          );
        }
        const config = (await response.json()) as MosqueConfig;
        if (!isUnmounted) {
          setState({
            config,
            error: null,
            sourceUrl: resolvedUrl,
          });
        }
      } catch (err: unknown) {
        // If aborted, just exit silently
        if (currentController?.signal.aborted) return;
        if (!isUnmounted) {
          setState({
            config: null,
            error: String(err),
            sourceUrl: resolvedUrl,
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
  }, [resolvedUrl]);

  const hasUrl = Boolean(resolvedUrl);
  const isCurrent = resolvedUrl ? state.sourceUrl === resolvedUrl : false;
  const hasConfig = state.config !== null;

  // If URL is provided and we don't have config yet and no error, we're loading
  const loading = hasUrl && !hasConfig && state.error === null;

  // Use remote config if we have it and it's current, otherwise fall back
  const config: MosqueConfig =
    hasConfig && isCurrent ? (state.config as MosqueConfig) : fallbackConfig;
  const error = isCurrent ? state.error : null;
  const source = hasConfig && isCurrent ? "remote" : "default";

  return { config, loading, error, source };
}
