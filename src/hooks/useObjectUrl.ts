import { useEffect, useMemo } from "react";

/**
 * Creates browser object URLs for a dynamic keyed collection of files (e.g.
 * one pending image per sponsor row). Whenever the collection changes, a
 * fresh set of object URLs is derived and the previous batch is revoked once
 * React commits the new one.
 */
export function useObjectUrlMap(
  files: Record<string, File | Blob | null | undefined>,
): Record<string, string> {
  const urls = useMemo(() => {
    const next: Record<string, string> = {};
    for (const [key, file] of Object.entries(files)) {
      if (file) next[key] = URL.createObjectURL(file);
    }
    return next;
  }, [files]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(urls)) URL.revokeObjectURL(url);
    };
  }, [urls]);

  return urls;
}
