import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebugPromo } from "../hooks/useDebugPromo";

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("useDebugPromo", () => {
  it("enables the promo override for debugPromo=true", () => {
    window.history.replaceState({}, "", "/?debugPromo=true");

    const { result } = renderHook(() => useDebugPromo());

    expect(result.current).toBe(true);
  });

  it("also accepts debugPromo=1", () => {
    window.history.replaceState({}, "", "/?debugPromo=1");

    const { result } = renderHook(() => useDebugPromo());

    expect(result.current).toBe(true);
  });

  it("does not enable the override without the debug parameter", () => {
    const { result } = renderHook(() => useDebugPromo());

    expect(result.current).toBe(false);
  });
});
