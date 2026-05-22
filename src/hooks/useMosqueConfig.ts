import { useEffect, useState } from "react";
import type { MosqueConfig, MosqueConfigState } from "../types";
import fallbackConfig from "../../mosque.config";

interface InternalConfigState {
  config: MosqueConfig;
  error: string | null;
  source: MosqueConfigState["source"];
  sourceUrl: string | null;
}

export function useMosqueConfig(url: string = ""): MosqueConfigState {
  const resolvedUrl = url?.trim() || undefined;

  const [state, setState] = useState<InternalConfigState>(() => ({
    config: fallbackConfig,
    error: null,
    source: "default",
    sourceUrl: null,
  }));

  useEffect(() => {
    if (!resolvedUrl) return;

    const controller = new AbortController();

    fetch(resolvedUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Config request failed: ${response.status} ${response.statusText}`,
          );
        }
        return (await response.json()) as MosqueConfig;
      })
      .then((config) => {
        setState({
          config,
          error: null,
          source: "remote",
          sourceUrl: resolvedUrl,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          config: fallbackConfig,
          error: String(err),
          source: "default",
          sourceUrl: resolvedUrl,
        });
      });

    return () => controller.abort();
  }, [resolvedUrl]);

  const hasUrl = Boolean(resolvedUrl);
  const isCurrent = resolvedUrl ? state.sourceUrl === resolvedUrl : false;

  const config = hasUrl && isCurrent ? state.config : fallbackConfig;
  const error = hasUrl && isCurrent ? state.error : null;
  const source = hasUrl && isCurrent ? state.source : "default";
  const loading = hasUrl && !isCurrent && error === null;

  return { config, loading, error, source };
}
