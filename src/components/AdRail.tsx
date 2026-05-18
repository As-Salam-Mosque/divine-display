import type { AdSlot } from "../types";
import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";

interface AdSlotProps {
  slot: AdSlot;
}

function AdSlotCard({ slot }: AdSlotProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const hasImage = Boolean(slot.image);

  return (
    // `flex-1` lets the card grow to fill available vertical space; `min-h-0` allows
    // the card to shrink inside a flex container (prevents overflow caused by
    // children with intrinsic min-height). `max-h-full` prevents the card from
    // exceeding the parent's height. `overflow-hidden` ensures content is clipped.
    <div
      className={
        `flex-1 min-h-0 max-h-full bg-surface-panel ghost-border rounded-xl text-center overflow-hidden ` +
        (hasImage
          ? "" // image will fill the card
          : `flex flex-col items-center justify-center p-5 lg:p-6 xl:p-7 tv:p-8`)
      }
    >
      {hasImage ? (
        // Image fills the entire slot with no padding; object-cover will crop as needed
        <img
          src={slot.image}
          alt={slot.label}
          className="w-full h-full object-cover"
        />
      ) : (
        // Placeholder content stretches to the card's full height
        <div
          className={`w-full h-full flex flex-col items-center justify-center`}
        >
          <span className="material-symbols-outlined text-text-muted/30 text-4xl lg:text-5xl tv:text-6xl mb-2">
            storefront
          </span>
          <p className="font-label-caps text-[10px] md:text-label-caps lg:text-sm tv:text-base text-text-muted">
            {slot.label}
          </p>
          <p className="font-body-md text-xs md:text-sm lg:text-base tv:text-lg text-text-muted/70 italic">
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
    // Make sure the rail and its parent flex context can shrink: `h-full min-h-0`.
    // The header is natural height; cards (below) are `flex-1` so they distribute
    // the remaining space equally. `overflow-hidden` prevents the rail from
    // growing beyond its allotted space.
    <div className="hidden lg:flex col-span-3 flex-col gap-4 lg:gap-5 tv:gap-6 h-full min-h-0 w-full justify-self-stretch overflow-hidden">
      <div className="flex justify-between items-center px-2 lg:px-3">
        <span className="font-label-caps text-[10px] lg:text-xs xl:text-sm tv:text-base tracking-widest text-primary">
          {t.communitySponsors}
        </span>
        <span className="font-label-caps text-[9px] lg:text-[10px] xl:text-xs tv:text-sm tracking-widest text-text-muted bg-surface-panel px-2 py-1 rounded">
          {t.paidAds}
        </span>
      </div>
      {slots.map((slot) => (
        <AdSlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
