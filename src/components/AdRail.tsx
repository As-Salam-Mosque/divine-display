import type { AdSlot } from "../types";

interface AdSlotProps {
  slot: AdSlot;
}

function AdSlotCard({ slot }: AdSlotProps) {
  return (
    <div className="flex-1 bg-surface-panel ghost-border rounded-xl flex flex-col items-center justify-center p-6 text-center">
      {slot.image ? (
        <img
          src={slot.image}
          alt={slot.label}
          className="w-full h-full object-contain rounded-lg"
        />
      ) : (
        <>
          <span className="material-symbols-outlined text-text-muted/30 text-5xl mb-2">
            storefront
          </span>
          <p className="font-label-caps text-label-caps text-text-muted">
            {slot.label}
          </p>
          <p className="font-body-md text-sm text-text-muted/70 italic">
            Available
          </p>
        </>
      )}
    </div>
  );
}

interface AdRailProps {
  slots: AdSlot[];
}

export function AdRail({ slots }: AdRailProps) {
  return (
    <div className="hidden md:flex col-span-3 flex-col gap-4 h-full">
      <div className="flex justify-between items-center px-2">
        <span className="font-label-caps text-[10px] tracking-widest text-primary">
          COMMUNITY SPONSORS
        </span>
        <span className="font-label-caps text-[9px] tracking-widest text-text-muted bg-surface-panel px-2 py-1 rounded">
          PAID ADS
        </span>
      </div>
      {slots.map((slot) => (
        <AdSlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
