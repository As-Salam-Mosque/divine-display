export function useDebugPromo(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;

  const value = new URLSearchParams(window.location.search)
    .get("debugPromo")
    ?.toLowerCase();

  return value === "true" || value === "1";
}
