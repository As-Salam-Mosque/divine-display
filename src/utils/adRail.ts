import type { AdRailSlotConfig, AdSlot } from "../types";

function getUniqueCandidates(candidates: AdSlot[]): AdSlot[] {
  const seen = new Set<number>();

  return candidates.filter((candidate) => {
    if (seen.has(candidate.id)) return false;
    seen.add(candidate.id);
    return true;
  });
}

function pickUniqueCandidate(
  candidates: AdSlot[],
  startIndex: number,
  usedSponsorIds: Set<number>,
): AdSlot | null {
  if (candidates.length === 0) return null;

  for (let offset = 0; offset < candidates.length; offset += 1) {
    const candidate = candidates[(startIndex + offset) % candidates.length];
    if (usedSponsorIds.has(candidate.id)) continue;
    return candidate;
  }

  return null;
}

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
  const dynamicCandidates = getUniqueCandidates(getDynamicCandidates(sponsors));
  const usedSponsorIds = new Set<number>();
  const resolvedSlots = Array<AdSlot | null>(railSlots.length).fill(null);

  for (const [slotIndex, slot] of railSlots.entries()) {
    if (slot.mode !== "fixed") continue;

    const fixedSponsor = sponsorById.get(slot.sponsorId ?? -1);
    if (!fixedSponsor || usedSponsorIds.has(fixedSponsor.id)) {
      continue;
    }

    usedSponsorIds.add(fixedSponsor.id);
    resolvedSlots[slotIndex] = fixedSponsor;
  }

  for (const [slotIndex, slot] of railSlots.entries()) {
    if (slot.mode !== "dynamic") continue;

    const selectedSponsor = pickUniqueCandidate(
      dynamicCandidates,
      dynamicTick + slotIndex,
      usedSponsorIds,
    );

    if (!selectedSponsor) continue;

    usedSponsorIds.add(selectedSponsor.id);
    resolvedSlots[slotIndex] = selectedSponsor;
  }

  return resolvedSlots;
}
