import { useEffect, useState } from "react";
import type { MosqueConfig, MosqueConfigState } from "../types";
import fallbackConfig from "../../mosque.config";

const DEFAULT_CONFIG_URL = import.meta.env.VITE_MOSQUE_CONFIG_URL || "";

interface InternalConfigState {
  config: MosqueConfig;
  error: string | null;
  source: MosqueConfigState["source"];
  sourceUrl: string | null;
}

export function useMosqueConfig(
  url: string = DEFAULT_CONFIG_URL,
): MosqueConfigState {
  const resolvedUrl = url?.trim() || undefined;

  const [state, setState] = useState<InternalConfigState>(() => ({
    config: fallbackConfig,
    error: null,
    source: "default",
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
            source: "remote",
            sourceUrl: resolvedUrl,
          });
        }
      } catch (err: unknown) {
        // If aborted, just exit silently
        if (currentController?.signal.aborted) return;
        if (!isUnmounted) {
          setState({
            config: fallbackConfig,
            error: String(err),
            source: "default",
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

  const config = hasUrl && isCurrent ? state.config : fallbackConfig;
  const error = hasUrl && isCurrent ? state.error : null;
  const source = hasUrl && isCurrent ? state.source : "default";
  const loading = hasUrl && !isCurrent && error === null;

  return { config, loading, error, source };
}
