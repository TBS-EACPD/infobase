import { render, screen } from "@testing-library/react";

import React from "react";

import { CountdownCircle } from "./CountdownCircle";

describe("CountdownCircle", () => {
  it("Checks that countdown circle does not display numbers when show_numbers is default (false)", async () => {
    const on_end_callback = jest.fn();
    const time = 2000;
    //render(<CountdownCircle time={2000} on_end_callback={onEnd()} show_numbers={true} />);
    render(<CountdownCircle {...{ time, on_end_callback }} />);
    expect(screen.queryByText(2)).toBeNull();

    await wait1Second();
    expect(screen.queryByText(1)).toBeNull();

    await wait1Second();
    expect(screen.queryByText(0)).toBeNull();

    function wait1Second() {
      return new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

  it("Checks that countdown circle displays numbers when show_numbers is true", async () => {
    const on_end_callback = jest.fn();
    const time = 2000;
    render(
      <CountdownCircle {...{ time, on_end_callback, show_numbers: true }} />
    );
    expect(screen.queryByText(2)).toBeVisible();

    await wait1Second();
    expect(screen.queryByText(1)).toBeVisible();

    await wait1Second();
    expect(screen.queryByText(0)).toBeVisible();

    function wait1Second() {
      return new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });
});
