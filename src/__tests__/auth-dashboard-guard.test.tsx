import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const AUTH_STORAGE_KEY = "divine-display-auth";

describe("dashboard auth guard", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
    vi.unstubAllGlobals();
  });

  it("clears expired cached session and redirects away from dashboard", async () => {
    const expiredAt = new Date(Date.now() - 60_000).toISOString();
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: "expired-token",
        slug: "assalam",
        expiresAt: expiredAt,
      }),
    );

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs out and redirects to login when cached dashboard credentials are invalid", async () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: "invalid-session-token",
        slug: "assalam",
        expiresAt,
      }),
    );

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });

    await waitFor(() => {
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/mosques?name=assalam"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer invalid-session-token",
        }),
      }),
    );
  });
});
