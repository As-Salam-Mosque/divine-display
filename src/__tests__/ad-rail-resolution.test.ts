import { describe, expect, it } from "vitest";
import { resolveAdRailSlots } from "../utils/adRail";
import type { AdRailSlotConfig, AdSlot } from "../types";

const sponsors: AdSlot[] = [
  { id: 1, label: "Sponsor A", weight: 1 },
  { id: 2, label: "Sponsor B", weight: 1 },
  { id: 3, label: "Sponsor C", weight: 1 },
];

const railSlots: AdRailSlotConfig[] = [
  { id: 1, mode: "fixed", sponsorId: 1 },
  { id: 2, mode: "dynamic" },
  { id: 3, mode: "dynamic" },
];

describe("resolveAdRailSlots", () => {
  it("keeps fixed slots pinned to their linked sponsor", () => {
    const resolved = resolveAdRailSlots({
      sponsors,
      railSlots,
      dynamicTick: 3,
    });

    expect(resolved[0]?.id).toBe(1);
  });

  it("rotates dynamic slots based on tick", () => {
    const tick0 = resolveAdRailSlots({ sponsors, railSlots, dynamicTick: 0 });
    const tick1 = resolveAdRailSlots({ sponsors, railSlots, dynamicTick: 1 });

    expect(tick0[1]?.id).not.toBe(tick1[1]?.id);
    expect(tick0[2]?.id).not.toBe(tick1[2]?.id);
  });

  it("returns null for fixed slots linked to missing sponsors", () => {
    const missingFixed: AdRailSlotConfig[] = [
      { id: 10, mode: "fixed", sponsorId: 999 },
    ];
    const resolved = resolveAdRailSlots({
      sponsors,
      railSlots: missingFixed,
      dynamicTick: 0,
    });

    expect(resolved[0]).toBeNull();
  });

  it("never resolves the same sponsor in multiple slots at once", () => {
    const duplicateRiskSlots: AdRailSlotConfig[] = [
      { id: 1, mode: "fixed", sponsorId: 1 },
      { id: 2, mode: "dynamic" },
      { id: 3, mode: "dynamic" },
      { id: 4, mode: "dynamic" },
    ];

    const resolved = resolveAdRailSlots({
      sponsors,
      railSlots: duplicateRiskSlots,
      dynamicTick: 0,
    });

    const assignedSponsorIds = resolved
      .map((slot) => slot?.id ?? null)
      .filter((id): id is number => id != null);

    expect(new Set(assignedSponsorIds).size).toBe(assignedSponsorIds.length);
  });

  it("drops duplicate fixed assignments instead of rendering duplicates", () => {
    const conflictingFixed: AdRailSlotConfig[] = [
      { id: 1, mode: "fixed", sponsorId: 2 },
      { id: 2, mode: "fixed", sponsorId: 2 },
      { id: 3, mode: "dynamic" },
    ];

    const resolved = resolveAdRailSlots({
      sponsors,
      railSlots: conflictingFixed,
      dynamicTick: 0,
    });

    expect(resolved[0]?.id).toBe(2);
    expect(resolved[1]).toBeNull();
    expect(resolved[2]?.id).toBe(3);
  });
});
