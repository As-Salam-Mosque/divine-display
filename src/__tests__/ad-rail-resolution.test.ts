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

  it("keeps dynamic slots unique across the rail", () => {
    const resolved = resolveAdRailSlots({ sponsors, railSlots, dynamicTick: 0 });
    expect(resolved[1]?.id).not.toBe(resolved[2]?.id);
  });

  it("prevents dynamic slots from duplicating fixed slots", () => {
    const singleDynamic: AdRailSlotConfig[] = [
      { id: 1, mode: "fixed", sponsorId: 1 },
      { id: 2, mode: "dynamic" },
    ];
    const resolved = resolveAdRailSlots({
      sponsors,
      railSlots: singleDynamic,
      dynamicTick: 0,
    });
    expect(resolved[0]?.id).toBe(1);
    expect(resolved[1]?.id).not.toBe(1);
  });

  it("returns null when no unique dynamic candidate is available", () => {
    const oneSponsor: AdSlot[] = [{ id: 1, label: "Sponsor A", weight: 1 }];
    const duplicateRiskSlots: AdRailSlotConfig[] = [
      { id: 1, mode: "fixed", sponsorId: 1 },
      { id: 2, mode: "dynamic" },
    ];
    const resolved = resolveAdRailSlots({
      sponsors: oneSponsor,
      railSlots: duplicateRiskSlots,
      dynamicTick: 0,
    });

    expect(resolved[0]?.id).toBe(1);
    expect(resolved[1]).toBeNull();
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
});
