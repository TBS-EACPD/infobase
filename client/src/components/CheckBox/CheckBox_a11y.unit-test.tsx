import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import { CheckBox } from "./CheckBox";

const testing_default = {
  id: "id",
  label: "label",
  active: false,
};

jest.mock("src/core/injected_build_constants", () => ({
  is_a11y_mode: true,
}));

describe("CheckBox, is_a11y_mode = true", () => {
  it("Calls onClick when checkbox is clicked", () => {
    const onClick = jest.fn();

    const { container } = render(
      <CheckBox {...{ ...testing_default, onClick }} />
    );

    const checkbox = container.querySelector(
      "input[type=checkbox]"
    ) as HTMLInputElement;

    if (checkbox) {
      expect(onClick).toHaveBeenCalledTimes(0);
      fireEvent.click(checkbox);
      expect(onClick).toHaveBeenCalledTimes(1);
    } else {
      throw Error;
    }
  });

  it("Is checked when active", () => {
    let active = false;
    const onClick = jest.fn(() => (active = !active));

    const { rerender, container } = render(
      <CheckBox {...{ ...testing_default, active, onClick }} />
    );

    const checkbox = container.querySelector(
      "input[type=checkbox]"
    ) as HTMLInputElement;
    if (checkbox) {
      expect(!checkbox.checked);

      fireEvent.click(checkbox);

      rerender(<CheckBox {...{ ...testing_default, active, onClick }} />);

      expect(checkbox.checked);
    } else {
      throw Error;
    }
  });

  it("Cannot be clicked while disabled", () => {
    const onClick = jest.fn();

    render(<CheckBox {...{ ...testing_default, onClick, disabled: true }} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledTimes(0);
  });
});
