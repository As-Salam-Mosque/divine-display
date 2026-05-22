import { useEffect, useRef, useState } from "react";
import type { PrayerTime } from "../types";
import { PrayerCard } from "./PrayerCard";

interface PrayerTableProps {
  prayers: PrayerTime[];
  activePrayerIndex: number | null;
}

export function PrayerTable({ prayers, activePrayerIndex }: PrayerTableProps) {
  // Minimum card width in pixels. When cards reach this width they'll wrap to
  // the next row. Adjust this value to control when rows are created.
  const CARD_MIN_PX = 220;

  const containerRef = useRef<HTMLUListElement | null>(null);
  const [cols, setCols] = useState<number>(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recalc = () => {
      const width = Math.max(0, el.clientWidth - 1); // guard against zero
      const count = Math.max(1, prayers.length);
      // maximum number of columns that can fit at CARD_MIN_PX
      const maxCols = Math.max(1, Math.floor(width / CARD_MIN_PX));
      // If more columns can fit than items, cap to item count
      const cappedMax = Math.min(maxCols || 1, count);
      const rows = Math.ceil(count / cappedMax);
      const calculated =
        rows <= 1 ? Math.min(count, cappedMax) : Math.ceil(count / rows);
      setCols(calculated || 1);
    };

    // Initial measurement
    recalc();

    // Resize observer to handle container size changes (including rail show/hide)
    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);

    // Also listen for font load/layout changes via window resize as a fallback
    window.addEventListener("resize", recalc);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [prayers.length]);

  return (
    <ul
      ref={containerRef}
      className="grid gap-2 py-1"
      aria-label="Prayer times"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {prayers.map((prayer, index) => {
        const isActive = activePrayerIndex === index;

        return (
          <PrayerCard
            key={`${prayer.name}-${index}`}
            prayer={prayer}
            isActive={isActive}
          />
        );
      })}
    </ul>
  );
}
