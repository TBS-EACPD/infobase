import { render, screen, fireEvent } from "@testing-library/react";
import { FAILSAFE_SCHEMA } from "js-yaml";
import React from "react";

import { with_console_error_silenced } from "src/testing_utils";

import { RadioButtons } from "./RadioButtons";

const testing_default = {
  options: [
    {
      id: "button1",
      active: false,
      display: "display",
    },
    {
      id: "button2",
      active: true,
      display: "display",
    },
  ],
};

describe("RadioButtons", () => {
  it("Calls onClick when RadioButton is clicked", () => {
    const onChange = jest.fn();

    render(<RadioButtons {...{ ...testing_default, onChange }} />);

    expect(screen.queryAllByRole("button"));

    const radiobuttons = screen.getAllByRole("button");

    expect(onChange).toHaveBeenCalledTimes(0);
    fireEvent.click(radiobuttons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
