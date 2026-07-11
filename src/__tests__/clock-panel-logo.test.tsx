import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClockPanel } from "../components/ClockPanel";
import { SettingsProvider } from "../context/SettingsContext";
import { DEFAULT_APP_SETTINGS, type ClockState } from "../types";

const baseClock: ClockState = {
  hours: "7",
  hours24: "07",
  minutes: "05",
  seconds: "09",
  ampm: "AM",
  gregorianDate: "Sep 1, 2024",
  dayName: "Sunday",
};

describe("ClockPanel mosque branding", () => {
  it("renders mosque logo when logo is configured", () => {
    render(
      <SettingsProvider
        defaults={{
          ...DEFAULT_APP_SETTINGS,
          mosque: {
            ...DEFAULT_APP_SETTINGS.mosque,
            name: "Test Mosque",
            logo: "https://example.com/logo.png",
          },
        }}
      >
        <ClockPanel
          clock={baseClock}
          hijriDate="Rabiʿ al-Awwal 1, 1446 AH"
          statusMessage="Next prayer in 10m"
          statusType="none"
          onOpenSettings={() => undefined}
        />
      </SettingsProvider>,
    );

    const logo = screen.getByAltText("Test Mosque logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
    expect(screen.queryByText("mosque")).not.toBeInTheDocument();
  });

  it("renders fallback mosque icon when logo is empty", () => {
    render(
      <SettingsProvider
        defaults={{
          ...DEFAULT_APP_SETTINGS,
          mosque: {
            ...DEFAULT_APP_SETTINGS.mosque,
            name: "Test Mosque",
            logo: "",
          },
        }}
      >
        <ClockPanel
          clock={baseClock}
          hijriDate="Rabiʿ al-Awwal 1, 1446 AH"
          statusMessage="Next prayer in 10m"
          statusType="none"
          onOpenSettings={() => undefined}
        />
      </SettingsProvider>,
    );

    expect(screen.queryByAltText("Test Mosque logo")).not.toBeInTheDocument();
    expect(screen.getByText("mosque")).toBeInTheDocument();
  });
});
