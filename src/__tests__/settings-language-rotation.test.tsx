import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "../components/SettingsPanel";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { DEFAULT_APP_SETTINGS } from "../types";
import { LANGUAGE_ROTATION_INTERVAL_MS } from "../hooks/useLanguageRotation";

function SettingsProbe() {
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <output data-testid="language">{settings.language}</output>
      <output data-testid="auto-rotate">
        {String(settings.autoRotateLanguage)}
      </output>
      <button
        type="button"
        onClick={() =>
          updateSettings({ language: "fr", autoRotateLanguage: false })
        }
      >
        Select French
      </button>
    </>
  );
}

describe("automatic language rotation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("switches languages every five minutes and persists automatic changes", () => {
    vi.useFakeTimers();

    render(
      <SettingsProvider
        defaults={{ ...DEFAULT_APP_SETTINGS, autoRotateLanguage: true }}
      >
        <SettingsProbe />
      </SettingsProvider>,
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");

    act(() => {
      vi.advanceTimersByTime(LANGUAGE_ROTATION_INTERVAL_MS);
    });
    expect(screen.getByTestId("language")).toHaveTextContent("fr");
    expect(screen.getByTestId("auto-rotate")).toHaveTextContent("true");

    const storedAfterFirstRotation = JSON.parse(
      localStorage.getItem("divine-display-settings") ?? "{}",
    );
    expect(storedAfterFirstRotation).toMatchObject({
      language: "fr",
    });

    act(() => {
      vi.advanceTimersByTime(LANGUAGE_ROTATION_INTERVAL_MS);
    });
    expect(screen.getByTestId("language")).toHaveTextContent("en");
  });

  it("does not rotate while disabled and cleans up after unmount", () => {
    vi.useFakeTimers();

    const view = render(
      <SettingsProvider defaults={DEFAULT_APP_SETTINGS}>
        <SettingsProbe />
      </SettingsProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(LANGUAGE_ROTATION_INTERVAL_MS * 2);
    });
    expect(screen.getByTestId("language")).toHaveTextContent("en");

    view.unmount();
    act(() => {
      vi.advanceTimersByTime(LANGUAGE_ROTATION_INTERVAL_MS);
    });
  });

  it("disables rotation and cancels the pending switch after manual selection", () => {
    vi.useFakeTimers();

    render(
      <SettingsProvider
        defaults={{ ...DEFAULT_APP_SETTINGS, autoRotateLanguage: true }}
      >
        <SettingsProbe />
      </SettingsProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select French" }));
    expect(screen.getByTestId("language")).toHaveTextContent("fr");
    expect(screen.getByTestId("auto-rotate")).toHaveTextContent("false");

    act(() => {
      vi.advanceTimersByTime(LANGUAGE_ROTATION_INTERVAL_MS);
    });
    expect(screen.getByTestId("language")).toHaveTextContent("fr");
  });
});

describe("SettingsPanel automatic language rotation control", () => {
  it("lets users enable rotation and disables it on manual language selection", () => {
    render(
      <SettingsProvider defaults={DEFAULT_APP_SETTINGS}>
        <SettingsPanel isOpen onClose={() => undefined} />
      </SettingsProvider>,
    );

    const rotationSwitch = screen.getByRole("switch", {
      name: "Automatically switch language every 5 minutes",
    });
    expect(rotationSwitch).toHaveAttribute("aria-checked", "false");

    fireEvent.click(rotationSwitch);
    expect(rotationSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: "French" }));

    expect(
      screen.getByRole("switch", {
        name: "Changer automatiquement de langue toutes les 5 minutes",
      }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("lets users select the classic display theme", () => {
    render(
      <SettingsProvider defaults={DEFAULT_APP_SETTINGS}>
        <SettingsPanel isOpen onClose={() => undefined} />
      </SettingsProvider>,
    );

    const classicTheme = screen.getByRole("radio", { name: "Classic" });
    expect(classicTheme).toHaveAttribute("aria-checked", "false");

    fireEvent.click(classicTheme);

    expect(classicTheme).toHaveAttribute("aria-checked", "true");
    expect(JSON.parse(localStorage.getItem("divine-display-settings") ?? "{}"))
      .toMatchObject({ theme: "classic" });
  });
});
