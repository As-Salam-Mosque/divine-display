import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClockPanel } from "../components/ClockPanel";
import { SettingsProvider } from "../context/SettingsContext";
import {
  DEFAULT_APP_SETTINGS,
  type ClockState,
  type CriticalSignalData,
} from "../types";
import { translations } from "../i18n";

const baseClock: ClockState = {
  hours: "7",
  hours24: "07",
  minutes: "05",
  seconds: "09",
  ampm: "AM",
  gregorianDate: "Sep 1, 2024",
  dayName: "Sunday",
};

const renderCritical = (
  statusType: "adhan-now" | "iqamah-now",
  message: string,
  criticalSignal: CriticalSignalData,
) =>
  render(
    <SettingsProvider
      defaults={{
        ...DEFAULT_APP_SETTINGS,
        showSponsors: false,
        mosque: { ...DEFAULT_APP_SETTINGS.mosque },
      }}
    >
      <ClockPanel
        clock={baseClock}
        hijriDate="Rabi\u02BF al-Awwal 1, 1446 AH"
        statusMessage={message}
        statusType={statusType}
        criticalSignal={criticalSignal}
        onOpenSettings={() => undefined}
      />
    </SettingsProvider>,
  );

describe("ClockPanel critical signal", () => {
  it("shows adhan call to prayer message and hides the clock", () => {
    const message = translations.en.statusAdhanNow("Fajr");
    renderCritical("adhan-now", message, {
      prayerName: "Fajr",
      urgency: "low",
      subtitle: "Come to prayer",
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/adhan/i);
    expect(alert).toHaveTextContent(/fajr/i);
    expect(alert).toHaveTextContent(/come to prayer/i);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("shows iqamah call to prayer message and hides the clock", () => {
    const message = translations.en.statusIqamahNow("Dhuhr");
    renderCritical("iqamah-now", message, {
      prayerName: "Dhuhr",
      urgency: "high",
      subtitle: "Come to prayer",
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/iqamah/i);
    expect(alert).toHaveTextContent(/dhuhr/i);
    expect(alert).toHaveTextContent(/come to prayer/i);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });
});
