import { useEffect, useRef, useState } from "react";
import type { PrayerTime } from "../types";
import { cn } from "../utils/cn";
import { PrayerCard } from "./PrayerCard";

interface PrayerTableProps {
  prayers: PrayerTime[];
  activePrayerIndex: number | null;
}

import { useSettings } from "../context/SettingsContext";

export function PrayerTable({ prayers, activePrayerIndex }: PrayerTableProps) {
  const { settings } = useSettings();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const updateScrollable = () => {
      const nextIsScrollable =
        container.scrollHeight > container.clientHeight + 1;

      setIsScrollable((currentIsScrollable) =>
        currentIsScrollable === nextIsScrollable
          ? currentIsScrollable
          : nextIsScrollable,
      );
    };

    updateScrollable();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollable();
    });

    resizeObserver.observe(container);

    const content = container.firstElementChild;
    if (content instanceof HTMLElement) {
      resizeObserver.observe(content);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        "prayer-table-scroll-region h-full min-h-0 overflow-visible",
        isScrollable &&
          "prayer-table-scroll-region--active overflow-y-scroll overflow-x-hidden",
      )}
    >
      <ul
        className="grid w-full min-h-full gap-2 py-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]"
        aria-label="Prayer times"
      >
        {prayers.map((prayer, index) => {
          const isActive = activePrayerIndex === index;
          const backgroundVariant = settings.alternatePrayerCardColors
            ? index % 2 === 0
              ? "a"
              : "b"
            : "a";

          return (
            <PrayerCard
              key={`${prayer.name}-${index}`}
              prayer={prayer}
              isActive={isActive}
              backgroundVariant={backgroundVariant}
            />
          );
        })}
      </ul>
    </div>
  );
}
