import { describe, it, expect } from "vitest";
import {
  WEEKDAY_ABBR,
  isWeekdayAbbr,
  toISODateLocal,
  isScheduledToday,
  isDisplayOnly,
} from "../utils/prayerSchedule";

// 2024-01-05 is a Friday (index 5); 2024-01-08 is a Monday (index 1).
const A_FRIDAY = new Date(2024, 0, 5, 10, 0, 0);
const A_MONDAY = new Date(2024, 0, 8, 10, 0, 0);

describe("prayerSchedule utils", () => {
  it("lists weekday abbreviations starting on Sunday", () => {
    expect(WEEKDAY_ABBR).toEqual([
      "sun",
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
    ]);
  });

  it("recognizes weekday abbreviations case-insensitively", () => {
    expect(isWeekdayAbbr("fri")).toBe(true);
    expect(isWeekdayAbbr("FRI")).toBe(true);
    expect(isWeekdayAbbr(" Fri ")).toBe(true);
    expect(isWeekdayAbbr("2024-01-05")).toBe(false);
    expect(isWeekdayAbbr("friday")).toBe(false);
  });

  it("formats a Date as a local YYYY-MM-DD string", () => {
    expect(toISODateLocal(A_FRIDAY)).toBe("2024-01-05");
    expect(toISODateLocal(A_MONDAY)).toBe("2024-01-08");
  });

  it("is not scheduled when `schedule` is missing or empty", () => {
    expect(isScheduledToday(undefined, A_FRIDAY)).toBe(false);
    expect(isScheduledToday([], A_FRIDAY)).toBe(false);
  });

  it("matches a recurring weekday entry on the correct day only", () => {
    expect(isScheduledToday(["fri"], A_FRIDAY)).toBe(true);
    expect(isScheduledToday(["fri"], A_MONDAY)).toBe(false);
  });

  it("is case-insensitive and trims whitespace for weekday entries", () => {
    expect(isScheduledToday([" FRI "], A_FRIDAY)).toBe(true);
  });

  it("matches a one-off ISO date entry on the exact date only", () => {
    expect(isScheduledToday(["2024-01-05"], A_FRIDAY)).toBe(true);
    expect(isScheduledToday(["2024-01-05"], A_MONDAY)).toBe(false);
  });

  it("matches when any entry in a mixed schedule applies", () => {
    const schedule = ["fri", "2024-01-08"];
    expect(isScheduledToday(schedule, A_FRIDAY)).toBe(true); // via "fri"
    expect(isScheduledToday(schedule, A_MONDAY)).toBe(true); // via the date
  });

  it("does not match unrelated weekdays or dates", () => {
    expect(isScheduledToday(["mon"], A_FRIDAY)).toBe(false);
    expect(isScheduledToday(["2024-03-20"], A_FRIDAY)).toBe(false);
  });
});

describe("isDisplayOnly", () => {
  it("is never display-only when `schedule` is undefined (base prayers)", () => {
    expect(isDisplayOnly(undefined, A_FRIDAY)).toBe(false);
  });

  it("is display-only when `schedule` is an empty array (unconfigured extras)", () => {
    expect(isDisplayOnly([], A_FRIDAY)).toBe(true);
  });

  it("is not display-only when `schedule` matches today's weekday", () => {
    expect(isDisplayOnly(["fri"], A_FRIDAY)).toBe(false);
  });

  it("is display-only when `schedule` names a different weekday", () => {
    expect(isDisplayOnly(["fri"], A_MONDAY)).toBe(true);
  });

  it("is not display-only when `schedule` matches today's exact date", () => {
    expect(isDisplayOnly(["2024-01-05"], A_FRIDAY)).toBe(false);
  });

  it("is display-only when `schedule` names a different date", () => {
    expect(isDisplayOnly(["2024-01-05"], A_MONDAY)).toBe(true);
  });
});
