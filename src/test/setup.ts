import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Newer Node versions expose a process-level `localStorage` global that is
// `undefined` unless `--localstorage-file` is configured, and racing with
// jsdom's own `window.localStorage` initialization has proven unreliable
// across CI environments/thread scheduling. Install a small deterministic
// in-memory Storage polyfill directly so tests never depend on either of
// those globals being ready in time.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
}

for (const target of [globalThis, window]) {
  Object.defineProperty(target, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
    writable: true,
  });
}

// jsdom doesn't implement URL.createObjectURL/revokeObjectURL. Components
// that preview locally-selected files (e.g. the dashboard's deferred image
// upload flow) rely on these, so provide minimal deterministic stubs.
let objectUrlCounter = 0;
if (typeof URL.createObjectURL !== "function") {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: () => `blob:mock-${++objectUrlCounter}`,
  });
}
if (typeof URL.revokeObjectURL !== "function") {
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: () => {},
  });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
