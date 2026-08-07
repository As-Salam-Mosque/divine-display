import { chromium } from "playwright";

const baseUrl = process.env.CLOCK_PANEL_URL ?? "http://localhost:5173/";
const viewports = [
  { width: 375, height: 800 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 3840, height: 2160 },
];
const scenarios = [
  { name: "normal", query: "?name=", waitMs: 250 },
  { name: "promo", query: "?name=&debugPromo=true", waitMs: 1200 },
  {
    name: "critical",
    query: "?name=&debugCritical=iqamah&debugPrayer=Dhuhr",
    waitMs: 250,
  },
];

type LayoutResult = {
  missing: boolean;
  horizontalDocumentOverflow: boolean;
  panelOutsideHost: boolean;
  panelOutsideStage: boolean;
  panelOverflow: boolean;
  hostOverflow: boolean;
  outsideDescendants: Array<{ className: string; text: string }>;
  hasPromo: boolean;
  hasCritical: boolean;
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const failures: string[] = [];

  try {
    for (const scenario of scenarios) {
      for (const viewport of viewports) {
        const page = await browser.newPage({ viewport });
        try {
          await page.goto(new URL(scenario.query, baseUrl).toString(), {
            waitUntil: "networkidle",
          });
          await page.waitForTimeout(scenario.waitMs);

          const result = await page.evaluate<LayoutResult>(() => {
            const panel = document.querySelector<HTMLElement>(".clock-panel");
            const host = panel?.parentElement;
            const stage = host?.parentElement;

            if (!panel || !host || !stage) {
              return {
                missing: true,
                horizontalDocumentOverflow:
                  document.documentElement.scrollWidth >
                  document.documentElement.clientWidth + 1,
                panelOutsideHost: false,
                panelOutsideStage: false,
                panelOverflow: false,
                hostOverflow: false,
                outsideDescendants: [],
                hasPromo: Boolean(document.querySelector(".promo-compact")),
                hasCritical: Boolean(
                  document.querySelector(".critical-signal-panel"),
                ),
              };
            }

            const panelRect = panel.getBoundingClientRect();
            const hostRect = host.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            const tolerance = 1;
            const isOutside = (rect: DOMRect, parent: DOMRect) =>
              rect.left < parent.left - tolerance ||
              rect.right > parent.right + tolerance ||
              rect.top < parent.top - tolerance ||
              rect.bottom > parent.bottom + tolerance;

            const outsideDescendants = Array.from(panel.querySelectorAll("*"))
              .filter((element) => {
                const style = getComputedStyle(element);
                return (
                  style.display !== "none" &&
                  style.visibility !== "hidden" &&
                  element.getClientRects().length > 0
                );
              })
              .map((element) => ({
                element,
                rect: element.getBoundingClientRect(),
              }))
              .filter(({ rect }) => isOutside(rect, panelRect))
              .slice(0, 5)
              .map(({ element }) => ({
                className:
                  typeof element.className === "string"
                    ? element.className
                    : element.tagName.toLowerCase(),
                text: (element.textContent ?? "").trim().slice(0, 40),
              }));

            return {
              missing: false,
              horizontalDocumentOverflow:
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth + 1,
              panelOutsideHost: isOutside(panelRect, hostRect),
              panelOutsideStage: isOutside(panelRect, stageRect),
              panelOverflow:
                panel.scrollWidth > panel.clientWidth + 2 ||
                panel.scrollHeight > panel.clientHeight + 2,
              hostOverflow:
                host.scrollWidth > host.clientWidth + 2 ||
                host.scrollHeight > host.clientHeight + 2,
              outsideDescendants,
              hasPromo: Boolean(document.querySelector(".promo-compact")),
              hasCritical: Boolean(
                document.querySelector(".critical-signal-panel"),
              ),
            };
          });

          const failed =
            result.missing ||
            result.horizontalDocumentOverflow ||
            result.panelOutsideHost ||
            result.panelOutsideStage ||
            result.panelOverflow ||
            result.hostOverflow ||
            result.outsideDescendants.length > 0;

          if (failed) {
            failures.push(
              `${scenario.name} ${viewport.width}x${viewport.height}: ${JSON.stringify(result)}`,
            );
          }
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error("ClockPanel layout violations:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      `ClockPanel layout verified across ${scenarios.length} scenarios and ${viewports.length} viewports.`,
    );
  }
}

void main();
