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
  statusType: "adhan-now" | "iqamah-now" | "time-now",
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
      arabicName: "الفجر",
      urgency: "low",
      subtitle: "Come to prayer",
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/adhan/i);
    expect(alert).toHaveTextContent(/fajr/i);
    expect(alert).toHaveTextContent(/come to prayer/i);
    expect(alert).toHaveTextContent("الفجر");
    expect(alert).toHaveTextContent("Sep 1, 2024");
    expect(alert).toHaveTextContent(/Rabi.*1446 AH/);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("shows iqamah call to prayer message and hides the clock", () => {
    const message = translations.en.statusIqamahNow("Dhuhr");
    renderCritical("iqamah-now", message, {
      prayerName: "Dhuhr",
      arabicName: "الظهر",
      urgency: "high",
      subtitle: "Come to prayer",
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/iqamah/i);
    expect(alert).toHaveTextContent(/dhuhr/i);
    expect(alert).toHaveTextContent(/come to prayer/i);
    expect(alert).toHaveTextContent("الظهر");
    expect(alert).toHaveTextContent("Sep 1, 2024");
    expect(alert).toHaveTextContent(/Rabi.*1446 AH/);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("shows the generic time label for a time-only critical signal", () => {
    const message = translations.en.statusTimeNow("Khutbah 1");
    renderCritical("time-now", message, {
      prayerName: "Khutbah 1",
      arabicName: "خطبة 1",
      urgency: "medium",
      subtitle: "Come to prayer",
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/time/i);
    expect(alert).toHaveTextContent(/khutbah 1/i);
    expect(alert).toHaveTextContent("خطبة 1");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("keeps critical content inside the bounded clock panel", () => {
    renderCritical("adhan-now", translations.en.statusAdhanNow("Fajr"), {
      prayerName: "Fajr",
      arabicName: "الفجر",
      urgency: "low",
      subtitle: "Come to prayer",
    });

    const alert = screen.getByRole("alert");
    const panel = alert.closest(".clock-panel");

    expect(panel).toHaveClass(
      "min-w-0",
      "min-h-0",
      "max-w-full",
      "max-h-full",
      "overflow-hidden",
    );
    expect(alert).toHaveClass(
      "min-w-0",
      "min-h-0",
      "max-w-full",
      "max-h-full",
      "overflow-hidden",
    );
  });
});
