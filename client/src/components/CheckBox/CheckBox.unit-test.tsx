import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import * as constants from "src/core/injected_build_constants";

import { with_console_error_silenced } from "src/testing_utils";

import { CheckBox } from "./CheckBox";

const orig_constants = constants;

const onclick_callback = jest.fn(() => console.log("clicked!"));

describe("CheckBox, is_a11y_mode = true", () => {
  Object.defineProperty(constants, "is_a11y_mode", { value: true });
  afterAll(() => {
    Object.defineProperty(constants, "is_a11y_mode", {
      value: orig_constants["is_a11y_mode"],
    });
  });

  render(
    <CheckBox
      id={"1"}
      label={"solid no onclick"}
      isSolidBox={true}
      active={true}
      color={"#000000"}
    />
  );

  test("input in label in div is rendered when is_a11y_mode is true", () => {
    expect(
      document.querySelector("div.checkbox label input[type='checkbox']")
    ).toBeTruthy();
  });
});

describe("CheckBox, is_a11y_mode = false", () => {
  Object.defineProperty(constants, "is_a11y_mode", { value: false });
  afterAll(() => {
    Object.defineProperty(constants, "is_a11y_mode", {
      value: orig_constants["is_a11y_mode"],
    });
  });

  render(
    <CheckBox
      id={"2"}
      label={"not solid with onclick"}
      onClick={(_id: string) => onclick_callback()}
      active={false}
      isSolidBox={false}
    />
  );

  const outer_div_colored = screen.getByText("solid no onclick").closest("div");
  const colored_checkbox =
    outer_div_colored && outer_div_colored.children[0].children[0];
  test("coloured background when onlick is falsey or active is truthy", () => {
    expect(
      colored_checkbox &&
        window
          .getComputedStyle(colored_checkbox)
          .getPropertyValue("background-color")
    ).not.toEqual("transparent");
  });

  test("no icon check mark when isSolidBox is false", () => {
    const outer_div_no_colour = screen
      .getByText("not solid with onclick")
      .closest("div");
    const icon_check_box =
      outer_div_no_colour && outer_div_no_colour.children[0];
    expect(icon_check_box && icon_check_box.children[0]).not.toBeVisible();
  });
});

test("onclick gets called when the checkbox is clicked", () => {
  fireEvent.click(screen.getByText("not solid with onclick"));
  expect(onclick_callback).toHaveBeenCalledTimes(1);
});

test('Throws an error when a solid checkbox is missing "active" and "onclick"', () => {
  with_console_error_silenced(() =>
    expect(() => render(<CheckBox id={"id"} label={"label"} />)).toThrow()
  );
});
