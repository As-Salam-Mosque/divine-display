import { describe, it, expect } from "vitest";
import { splitStatusMessage } from "../utils/time";

describe("splitStatusMessage", () => {
  it("splits a next-countdown message into label and MM:SS countdown", () => {
    expect(splitStatusMessage("Dhuhr in 04:32")).toEqual({
      label: "Dhuhr in",
      countdown: "04:32",
    });
  });

  it("splits an iqamah-countdown message into label and H:MM:SS countdown", () => {
    expect(splitStatusMessage("Dhuhr Iqamah in 1:04:32")).toEqual({
      label: "Dhuhr Iqamah in",
      countdown: "1:04:32",
    });
  });

  it("supports French sentence structure the same way", () => {
    expect(splitStatusMessage("Iqama de Dhuhr dans 1:04:32")).toEqual({
      label: "Iqama de Dhuhr dans",
      countdown: "1:04:32",
    });
  });

  it("falls back to the full message as the label when there is no countdown", () => {
    expect(splitStatusMessage("Next prayer in 10m")).toEqual({
      label: "Next prayer in 10m",
      countdown: null,
    });
  });

  it("returns an empty label with a countdown when the message is just a countdown", () => {
    expect(splitStatusMessage("04:32")).toEqual({
      label: "",
      countdown: "04:32",
    });
  });
});
