import { useEffect, useMemo } from "react";

/**
 * Creates a browser object URL (`blob:...`) for a single `File`/`Blob` so it
 * can be rendered as a local preview before it's uploaded anywhere. The URL
 * is automatically revoked when the file changes or the component unmounts,
 * so callers never need to manage `URL.revokeObjectURL` themselves.
 *
 * Returns `null` when no file is provided.
 */
export function useObjectUrl(
  file: File | Blob | null | undefined,
): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}

/**
 * Same idea as `useObjectUrl`, but for a dynamic keyed collection of files
 * (e.g. one pending image per sponsor row, keyed by sponsor id). Whenever the
 * collection changes, a fresh set of object URLs is derived and the
 * previous batch is revoked once React commits the new one.
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
