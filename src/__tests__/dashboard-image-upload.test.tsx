import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { translations } from "../i18n";

const AUTH_STORAGE_KEY = "divine-display-auth";
const t = translations.en.dashboard;

const BASE_CONFIG = {
  name: "Masjid",
  city: "Montreal",
  logo: "",
  latitude: 45.5,
  longitude: -73.6,
  calculationMethod: 2,
  sponsors: [{ id: 1, label: "Sponsor A", image: null, link: null, weight: 1 }],
};

function seedValidSession() {
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token: "test-token", slug: "assalam", expiresAt }),
  );
}

async function renderDashboard() {
  window.history.pushState({}, "", "/dashboard");
  render(<App />);
  await waitFor(() => screen.getByLabelText(t.logoLabel));
}

describe("dashboard deferred image upload", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    seedValidSession();
  });

  it("locks the logo field and shows a local blob preview without uploading", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (url.toString().includes("/api/v1/mosques?name=") && method === "GET") {
        return new Response(JSON.stringify({ configuration: BASE_CONFIG }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderDashboard();

    const logoInput = screen.getByLabelText(t.logoLabel) as HTMLInputElement;
    const file = new File(["fake-bytes"], "logo.png", { type: "image/png" });
    const fileInput = document.getElementById(
      "cfg-logo-file",
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(logoInput.value).toBe("logo.png");
    expect(logoInput.readOnly).toBe(true);

    const preview = (await screen.findByAltText(
      t.logoPreviewAlt,
    )) as HTMLImageElement;
    expect(preview.src).toMatch(/^blob:/);

    expect(
      fetchMock.mock.calls.some(([url]) =>
        url.toString().includes("/upload-image"),
      ),
    ).toBe(false);
  });

  it("uploads pending logo/sponsor images only on save and sends hosted URLs to the backend", async () => {
    const uploadedUrls: Record<string, string> = {
      "logo.png": "https://iili.io/hosted-logo.png",
      "sponsor.png": "https://iili.io/hosted-sponsor.png",
    };
    const captured: {
      body: { configuration?: Record<string, unknown> } | null;
    } = { body: null };

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      const target = url.toString();

      if (target.includes("/api/v1/mosques?name=") && method === "GET") {
        return new Response(JSON.stringify({ configuration: BASE_CONFIG }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (target.includes("/upload-image") && method === "POST") {
        const body = init?.body as FormData;
        const uploadedFile = body.get("image") as File;
        return new Response(
          JSON.stringify({
            url: uploadedUrls[uploadedFile.name],
            viewerUrl: "https://freeimage.host/view/x",
            thumbnailUrl: "https://iili.io/thumb.png",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (target.includes("/configuration") && method === "PUT") {
        captured.body = JSON.parse(init?.body as string);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unexpected fetch: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderDashboard();

    fireEvent.change(document.getElementById("cfg-logo-file")!, {
      target: {
        files: [new File(["logo-bytes"], "logo.png", { type: "image/png" })],
      },
    });
    fireEvent.change(document.getElementById("ad-file-0")!, {
      target: {
        files: [
          new File(["sponsor-bytes"], "sponsor.png", { type: "image/png" }),
        ],
      },
    });

    const saveButton = screen.getByRole("button", {
      name: t.saveConfigurationLabel,
    });
    fireEvent.click(saveButton);

    await waitFor(() => expect(captured.body).not.toBeNull());

    const uploadCalls = fetchMock.mock.calls.filter(([url]) =>
      url.toString().includes("/upload-image"),
    );
    expect(uploadCalls).toHaveLength(2);

    expect(captured.body?.configuration?.logo).toBe(
      "https://iili.io/hosted-logo.png",
    );
    expect(
      (captured.body?.configuration?.sponsors as Array<{ image: string }>)[0]
        .image,
    ).toBe("https://iili.io/hosted-sponsor.png");

    const logoInput = (await screen.findByLabelText(
      t.logoLabel,
    )) as HTMLInputElement;
    await waitFor(() => expect(logoInput.readOnly).toBe(false));
    expect(logoInput.value).toBe("https://iili.io/hosted-logo.png");
  });

  it("surfaces an error and keeps the pending file when the image upload fails", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      const target = url.toString();

      if (target.includes("/api/v1/mosques?name=") && method === "GET") {
        return new Response(JSON.stringify({ configuration: BASE_CONFIG }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (target.includes("/upload-image") && method === "POST") {
        return new Response(JSON.stringify({ detail: "upstream error" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unexpected fetch: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderDashboard();

    fireEvent.change(document.getElementById("cfg-logo-file")!, {
      target: {
        files: [new File(["logo-bytes"], "logo.png", { type: "image/png" })],
      },
    });

    const saveButton = screen.getByRole("button", {
      name: t.saveConfigurationLabel,
    });
    fireEvent.click(saveButton);

    await screen.findByText(t.failedToUploadImage);

    expect(
      fetchMock.mock.calls.some(([url]) =>
        url.toString().includes("/api/v1/mosques/configuration"),
      ),
    ).toBe(false);

    const logoInput = screen.getByLabelText(t.logoLabel) as HTMLInputElement;
    expect(logoInput.value).toBe("logo.png");
    expect(logoInput.readOnly).toBe(true);
  });
});
