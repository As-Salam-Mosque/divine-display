import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ClockPanel } from "../components/ClockPanel";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { DEFAULT_APP_SETTINGS, type ClockState } from "../types";

const clock: ClockState = {
  hours: "7",
  hours24: "07",
  minutes: "05",
  seconds: "09",
  ampm: "AM",
  gregorianDate: "Sep 1, 2024",
  dayName: "SUNDAY",
};

function LanguageToggle() {
  const { updateSettings } = useSettings();

  return (
    <button type="button" onClick={() => updateSettings({ language: "fr" })}>
      Français
    </button>
  );
}

describe("ClockPanel language changes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("updates memoized calendar labels when the language changes", () => {
    render(
      <SettingsProvider defaults={DEFAULT_APP_SETTINGS}>
        <LanguageToggle />
        <ClockPanel
          clock={clock}
          hijriDate="Ramadan 1, 1447 AH"
          statusMessage=""
          statusType="none"
          onOpenSettings={() => undefined}
        />
      </SettingsProvider>,
    );

    expect(screen.getByText("HIJRI")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Français" }));

    expect(screen.getByText("HÉGIRE")).toBeInTheDocument();
    expect(screen.queryByText("HIJRI")).not.toBeInTheDocument();
  });
});
