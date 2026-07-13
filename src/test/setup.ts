import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Newer Node versions expose a process-level localStorage global that is
// undefined unless --localstorage-file is configured. Ensure tests use the
// browser storage supplied by jsdom instead.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: window.localStorage,
  writable: true,
});

afterEach(() => {
  cleanup();
});
