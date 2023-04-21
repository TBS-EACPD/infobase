import { render, screen } from "@testing-library/react";

import React from "react";

import { Countdown } from "./Countdown";

describe("Countdown", () => {
  it("Checks that countdown is properly counting down to zero", async () => {
    render(<Countdown time={2} />);
    expect(screen.getByText(2)).toBeVisible();

    await wait1Second();
    expect(screen.getByText(1)).toBeVisible();

    await wait1Second();
    expect(screen.getByText(0)).toBeVisible();

    function wait1Second() {
      return new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });
});
