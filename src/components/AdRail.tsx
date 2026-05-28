import type { AdSlot } from "../types";
import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";
import { useDominantColor } from "../hooks/useDominantColor";
import { cn } from "../utils/cn";

function AdSlotCard({ slot }: { slot: AdSlot }) {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const hasImage = Boolean(slot.image);
  const { imgRef, bgCss, handleImageLoad } = useDominantColor();

  return (
    <div
      className={cn(
        "flex-1 min-h-0 max-h-full rounded-xl text-center overflow-hidden relative flex flex-col items-center justify-center",
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
}

interface AdRailProps {
  slots: AdSlot[];
}

export function AdRail({ slots }: AdRailProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);

  return (
    <aside
      className="hidden lg:flex flex-col gap-2 md:gap-3 lg:gap-3 tv:gap-stage-gap h-full min-h-0 w-full justify-self-stretch overflow-hidden"
      aria-label={t.communitySponsors}
    >
      <div className="flex justify-between items-center px-3 lg:px-4 shrink-0">
        <span className="font-label-caps font-bold text-[10px] lg:text-xs xl:text-sm tv:text-base tracking-widest text-primary">
          {t.communitySponsors}
        </span>
      </div>
      {slots.map((slot) => (
        <AdSlotCard key={slot.id} slot={slot} />
      ))}
    </aside>
  );
}
