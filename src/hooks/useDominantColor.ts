import { useCallback, useRef, useState } from "react";
import { getColorSync } from "colorthief";

/**
 * Hook to extract the dominant color from an <img> element when it loads.
 * Returns a ref to attach to the <img>, the computed CSS color string (or
 * undefined), and an onLoad handler to call when the image finishes loading.
 *
 * Note: color extraction requires the image to be CORS-enabled (server must
 * allow canvas readback). If extraction fails we log a debug message and
 * leave the background undefined so callers can fall back to a gradient or
 * default color.
 */
export function useDominantColor(ignoreWhite = true) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [bgCss, setBgCss] = useState<string | undefined>(undefined);

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    try {
      const color = getColorSync(img, { ignoreWhite });
      if (color) setBgCss(color.css());
    } catch (err) {
      console.debug("Dominant color extraction failed:", err);
    }
  }, [ignoreWhite]);

  return { imgRef, bgCss, handleImageLoad } as const;
}
