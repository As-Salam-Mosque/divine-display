import { useCallback, useRef, useState } from "react";

const SAMPLE_SIZE = 32;
const EDGE_THICKNESS = 3;
const ALPHA_THRESHOLD = 200;

/**
 * Estimates the background color of an image by averaging the pixels along
 * its border rather than the whole image. Sponsor/ad images are usually
 * framed by a solid (or near-solid) background, so sampling the edge — as
 * opposed to a dominant-color palette, which can be skewed by a logo or
 * product in the center — gives a color that visually blends the image into
 * its surrounding container.
 */
function getEdgeColor(img: HTMLImageElement): string | undefined {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return undefined;

  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let x = 0; x < SAMPLE_SIZE; x++) {
      const onEdge =
        x < EDGE_THICKNESS ||
        x >= SAMPLE_SIZE - EDGE_THICKNESS ||
        y < EDGE_THICKNESS ||
        y >= SAMPLE_SIZE - EDGE_THICKNESS;
      if (!onEdge) continue;

      const i = (y * SAMPLE_SIZE + x) * 4;
      const alpha = data[i + 3];
      if (alpha < ALPHA_THRESHOLD) continue;

      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  if (count === 0) return undefined;
  return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
}

/**
 * Hook to estimate the background color of an <img> element once it loads,
 * so a surrounding container can be tinted to blend with the image instead
 * of showing a hard edge. Returns a ref to attach to the <img>, the computed
 * CSS color string (or undefined), and an onLoad handler to call when the
 * image finishes loading.
 *
 * Note: color extraction requires the image to be CORS-enabled (server must
 * allow canvas readback). If extraction fails we log a debug message and
 * leave the background undefined so callers can fall back to a gradient or
 * default color.
 */
export function useDominantColor() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [bgCss, setBgCss] = useState<string | undefined>(undefined);

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    try {
      const color = getEdgeColor(img);
      if (color) setBgCss(color);
    } catch (err) {
      console.debug("Background color extraction failed:", err);
    }
  }, []);

  return { imgRef, bgCss, handleImageLoad } as const;
}
