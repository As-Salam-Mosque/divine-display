import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClockPanel } from "../components/ClockPanel";
import { SettingsProvider } from "../context/SettingsContext";
import { DEFAULT_APP_SETTINGS, type ClockState } from "../types";

const clock: ClockState = {
  hours: "7",
  hours24: "07",
  minutes: "05",
  seconds: "09",
  ampm: "AM",
  gregorianDate: "Sep 1, 2024",
  dayName: "Sunday",
};

function renderClockPanel(promoActive = false) {
  return render(
    <SettingsProvider defaults={DEFAULT_APP_SETTINGS}>
      <ClockPanel
        clock={clock}
        hijriDate="Rabiʿ al-Awwal 1, 1446 AH"
        statusMessage="Next prayer in 10m"
        statusType="none"
        onOpenSettings={() => undefined}
        promoActive={promoActive}
      />
    </SettingsProvider>,
  );
}

describe("ClockPanel layout states", () => {
  it("uses the regular semantic layout by default", () => {
    const { container } = renderClockPanel();

    expect(container.querySelector(".clock-panel")).toHaveClass(
      "clock-panel--default",
    );
    expect(container.querySelector(".clock-panel__content")).not.toHaveClass(
      "clock-panel__content--promo",
    );
    expect(container.querySelector(".clock-panel__main")).not.toHaveClass(
      "promo-compact",
    );
    expect(container.querySelector(".clock-panel__time-row")).not.toHaveClass(
      "clock-panel__time-row--compact",
    );
    expect(screen.getByRole("timer")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("applies compact semantic modifiers while a promo is active", () => {
    const { container } = renderClockPanel(true);

    expect(container.querySelector(".clock-panel__content")).toHaveClass(
      "clock-panel__content--promo",
    );
    expect(container.querySelector(".clock-panel__main")).toHaveClass(
      "promo-compact",
    );
    expect(container.querySelector(".clock-panel__time-row")).toHaveClass(
      "clock-panel__time-row--compact",
    );
  });
});
