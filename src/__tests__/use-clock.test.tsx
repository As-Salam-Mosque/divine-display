import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useClock } from "../hooks/useClock";

function renderClock(language: "en" | "fr") {
  return renderHook(({ currentLanguage }) => useClock(currentLanguage), {
    initialProps: { currentLanguage: language },
  });
}

describe("useClock language lifecycle", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("cleans up the previous interval when the language changes", () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const clock = renderClock("en");

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    act(() => {
      clock.rerender({ currentLanguage: "fr" });
    });

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    clock.unmount();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
  });
});
