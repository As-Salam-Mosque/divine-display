import { useEffect, useMemo, useState } from "react";
import type { AdRailSlotConfig, AdSlot } from "../types";
import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";
import { useDominantColor } from "../hooks/useDominantColor";
import { cn } from "../utils/cn";
import { getDynamicCandidates, resolveAdRailSlots } from "../utils/adRail";

const DEFAULT_DYNAMIC_ROTATION_MS = 10_000;

function AdSlotCard({ slot }: { slot: AdSlot }) {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const hasImage = Boolean(slot.image);
  const { imgRef, bgCss, handleImageLoad } = useDominantColor();

  const card = (
    <div
      className={cn(
        "flex-1 min-h-0 rounded-xl text-center overflow-hidden relative flex flex-col items-center justify-center",
        hasImage
          ? "ghost-border"
          : "bg-surface-panel ghost-border p-5 lg:p-6 xl:p-7 tv:p-8",
      )}
      style={hasImage && bgCss ? { backgroundColor: bgCss } : undefined}
    >
      {hasImage ? (
        <img
          ref={imgRef}
          src={slot.image ?? ""}
          alt={slot.label}
          className="w-full h-full object-contain abs-fill aspect-16-9"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
          decoding="async"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <span
            className="material-symbols-outlined text-text-muted opacity-30 text-4xl lg:text-5xl tv:text-6xl mb-2 select-none"
            aria-hidden="true"
          >
            storefront
          </span>
          <p className="font-label-caps text-[10px] md:text-label-caps lg:text-sm tv:text-base text-text-muted line-clamp-1">
            {slot.label}
          </p>
          <p className="font-body-md text-xs md:text-sm lg:text-base tv:text-lg text-text-muted opacity-70 italic">
            {t.available}
          </p>
        </div>
      )}
    </div>
  );

  if (slot.link) {
    return (
      <a
        href={slot.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-h-0 flex flex-col focus-ring rounded-xl no-underline hover:opacity-90 transition-opacity"
      >
        {card}
      </a>
    );
  }

  return card;
}

interface AdRailProps {
  sponsors: AdSlot[];
  railSlots: AdRailSlotConfig[];
  dynamicRotationMs?: number;
}

export function AdRail({
  sponsors,
  railSlots,
  dynamicRotationMs = DEFAULT_DYNAMIC_ROTATION_MS,
}: AdRailProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const [dynamicTick, setDynamicTick] = useState(0);

  const dynamicCandidates = useMemo(() => getDynamicCandidates(sponsors), [sponsors]);

  useEffect(() => {
    const hasDynamicSlot = railSlots.some((slot) => slot.mode === "dynamic");
    if (!hasDynamicSlot || dynamicCandidates.length < 2) return;

    const intervalMs = Math.max(1000, dynamicRotationMs);
    const intervalId = window.setInterval(() => {
      setDynamicTick((prev) => prev + 1);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [railSlots, dynamicCandidates.length, dynamicRotationMs]);

  const resolvedSlots = useMemo(() => {
    return resolveAdRailSlots({ sponsors, railSlots, dynamicTick });
  }, [sponsors, railSlots, dynamicTick]);

  return (
    <aside
      className="hidden lg:flex flex-col gap-2 lg:gap-3 tv:gap-stage-gap h-full w-full justify-self-stretch overflow-hidden"
      aria-label={t.communitySponsors}
    >
      <div className="flex justify-between items-center px-3 lg:px-4 shrink-0">
        <span className="font-label-caps font-bold text-[10px] lg:text-xs xl:text-sm tv:text-base tracking-widest text-primary">
          {t.communitySponsors}
        </span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col gap-2 lg:gap-3 tv:gap-stage-gap">
        {resolvedSlots.map((slot, index) => (
          <AdSlotCard
            key={`${railSlots[index]?.id ?? index}-${slot?.id ?? "empty"}`}
            slot={
              slot ?? { id: railSlots[index]?.id ?? index, label: "SPONSOR SPACE" }
            }
          />
        ))}
      </div>
    </aside>
  );
}
