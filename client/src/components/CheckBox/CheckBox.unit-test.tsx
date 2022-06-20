import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import { with_console_error_silenced } from "src/testing_utils";

import { CheckBox } from "./CheckBox";

const testing_default = {
  id: "id",
  label: "label",
  active: false,
};

jest.mock("src/core/injected_build_constants", () => ({
  is_a11y_mode: false,
}));

describe("CheckBox, is_a11y_mode = false", () => {
  it('Throws an error when a non-solid checkbox is missing prop "active"', () => {
    const onClick = jest.fn();
    with_console_error_silenced(() =>
      expect(() =>
        render(<CheckBox id={"id"} label={"label"} onClick={onClick} />)
      ).toThrow("Non solid CheckBox requires 'active', 'onClick'")
    );
  });

  it('Throws an error when a non-solid checkbox is missing prop "onClick"', () => {
    with_console_error_silenced(() =>
      expect(() =>
        render(<CheckBox id={"id"} label={"label"} active={false} />)
      ).toThrow("Non solid CheckBox requires 'active', 'onClick'")
    );
  });

  it("Can be rendered as only solid, without active or onClick", () => {
    render(<CheckBox id={"id"} label={"label"} isSolidBox={true} />);
    expect(!screen.queryByRole("checkbox"));
  });

  it("Has role checkbox when onClick", () => {
    const onClick = jest.fn();

    render(<CheckBox {...{ ...testing_default, onClick }} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox);
  });

  it("Calls onClick when checkbox is clicked", () => {
    const onClick = jest.fn();

    render(<CheckBox {...{ ...testing_default, onClick }} />);

    expect(screen.queryByRole("checkbox"));

    const checkbox = screen.getByRole("checkbox");

    expect(onClick).toHaveBeenCalledTimes(0);
    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(checkbox, { key: "Enter", code: "Enter", charCode: 13 });
    expect(onClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(checkbox, { key: " ", code: "(space)", charCode: 32 });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("Is checked when checkbox is active", () => {
    const onClick = jest.fn();

    const { rerender } = render(
      <CheckBox {...{ ...testing_default, onClick }} />
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    rerender(<CheckBox {...{ ...testing_default, active: true, onClick }} />);
    expect(checkbox).toBeChecked();
  });

  it("Cannot be clicked while disabled", () => {
    const onClick = jest.fn();

    render(<CheckBox {...{ ...testing_default, onClick, disabled: true }} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledTimes(0);
    fireEvent.keyDown(checkbox, { key: "Enter", code: "Enter", charCode: 13 });
    expect(onClick).toHaveBeenCalledTimes(0);
    fireEvent.keyDown(checkbox, { key: " ", code: "(space)", charCode: 32 });
    expect(onClick).toHaveBeenCalledTimes(0);
  });
});
