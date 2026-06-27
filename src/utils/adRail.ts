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
  const usedSponsorIds = new Set<number>();
  const resolved: Array<AdSlot | null> = Array.from({ length: railSlots.length }, () => null);

  // Resolve fixed slots first so dynamic slots can avoid duplicates.
  railSlots.forEach((slot, slotIndex) => {
    if (slot.mode === "fixed") {
      const fixedSponsor = sponsorById.get(slot.sponsorId ?? -1) ?? null;
      resolved[slotIndex] = fixedSponsor;
      if (fixedSponsor) usedSponsorIds.add(fixedSponsor.id);
    }
  });

  railSlots.forEach((slot, slotIndex) => {
    if (slot.mode !== "dynamic") return;

    if (dynamicCandidates.length === 0) {
      resolved[slotIndex] = null;
      return;
    }

    const availableCandidates = dynamicCandidates.filter(
      (candidate) => !usedSponsorIds.has(candidate.id),
    );
    if (availableCandidates.length === 0) {
      resolved[slotIndex] = null;
      return;
    }

    const index = (dynamicTick + slotIndex) % availableCandidates.length;
    const selectedCandidate = availableCandidates[index] ?? null;
    resolved[slotIndex] = selectedCandidate;
    if (selectedCandidate) usedSponsorIds.add(selectedCandidate.id);
  });

  return resolved;
}
