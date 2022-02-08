import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import * as constants from "src/core/injected_build_constants";

import { with_console_error_silenced } from "src/testing_utils";

import { CheckBox } from "./CheckBox";

const non_solid_checkbox_no_onclick = <CheckBox id={"id"} label={"label"} />;
const solid_checkbox_no_onclick = (
  <CheckBox
    id={"id"}
    label={"label"}
    isSolidBox={true}
    active={true}
    color={"#000000"}
  />
);
const solid_checkbox_with_onclick = (
  <CheckBox
    id={"id"}
    label={"sample label"}
    isSolidBox={true}
    active={false}
    onClick={(_id: string) => onclick_callback()}
  />
);
const onclick_callback = jest.fn(() => console.log("clicked!"));

describe("CheckBox, is_a11y_mode = true", () => {
  Object.defineProperty(constants, "is_a11y_mode", { value: true });
  afterAll(() => {
    Object.defineProperty(constants, "is_a11y_mode", { value: false });
  });

  render(solid_checkbox_no_onclick);
  test("input in label in div is rendered when is_a11y_mode is true", () => {
    expect(
      document.querySelector("div.checkbox label input[type='checkbox']")
    ).toBeTruthy();
  });
});

describe("CheckBox, is_a11y_mode = false", () => {
  render(solid_checkbox_with_onclick);
  const transparent_checkbox = document.getElementsByClassName(
    "checkbox-span checkbox-span--interactive"
  )[0];
  test("no background when onclick is truthy and active is falsey", () => {
    expect(
      transparent_checkbox &&
        window
          .getComputedStyle(transparent_checkbox)
          .getPropertyValue("background-color")
    ).toEqual("transparent");
  });

  const colored_checkbox = document.getElementsByClassName("checkbox-span")[0];
  test("coloured background when onlick is falsey or active is truthy", () => {
    expect(
      colored_checkbox &&
        window
          .getComputedStyle(colored_checkbox)
          .getPropertyValue("background-color")
    ).not.toEqual("transparent");
  });
});

describe("onclick gets called when the checkbox is clicked", () => {
  fireEvent.click(screen.getAllByText("sample label")[0]);
  expect(onclick_callback).toHaveBeenCalledTimes(1);
});

describe("CheckBox", () => {
  it('Throws an error when a solid checkbox is missing "active" and "onclick"', () => {
    with_console_error_silenced(() => {
      expect(() => render(non_solid_checkbox_no_onclick)).toThrow();
    });
  });
});
