import type { AdRailSlotConfig, AdSlot } from "../types";

export function getDynamicCandidates(sponsors: AdSlot[]): AdSlot[] {
  return sponsors.filter((s) => s.label.trim().length > 0);
}

interface ResolveAdRailSlotsOptions {
  sponsors: AdSlot[];
  railSlots: AdRailSlotConfig[];
  dynamicTick: number;
}

export function resolveAdRailSlots({
  sponsors,
  railSlots,
  dynamicTick,
}: ResolveAdRailSlotsOptions): Array<AdSlot | null> {
  const sponsorById = new Map(sponsors.map((s) => [s.id, s]));
  const dynamicCandidates = getDynamicCandidates(sponsors);

  return railSlots.map((slot, slotIndex) => {
    if (slot.mode === "fixed") {
      return sponsorById.get(slot.sponsorId ?? -1) ?? null;
    }

    if (dynamicCandidates.length === 0) return null;
    const index = (dynamicTick + slotIndex) % dynamicCandidates.length;
    return dynamicCandidates[index];
  });
}
