import { render } from "@testing-library/react";
import React from "react";

import { is_a11y_mode } from "src/core/injected_build_constants";

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
    onClick={(_id: string) => console.log("clicked!")}
  />
);

describe("CheckBox", () => {
  it('Throws an error when a solid checkbox is missing "active" and "onclick"', () => {
    with_console_error_silenced(() => {
      expect(() => render(non_solid_checkbox_no_onclick)).toThrow();
    });
  });

  it("Renders a simple, unstyled CheckBox in a11y mode", () => {
    if (is_a11y_mode) {
      render(solid_checkbox_no_onclick);
      expect(
        document.querySelector("div.checkbox label input[type='checkbox']")
      ).toBeTruthy();
    }
  });

  it("Displays the given label when an onclick is provided", () => {
    render(solid_checkbox_with_onclick);
    const checkbox_span = document.querySelector(
      is_a11y_mode ? "div.checkbox label input" : "div span.link-styled"
    );
    expect(checkbox_span && checkbox_span.textContent).toEqual("sample label");
  });

  it("Displays a coloured background if onClick is undefined or active is truthy", () => {
    if (!is_a11y_mode) {
      render(solid_checkbox_with_onclick);
      const transparent_checkbox = document.getElementsByClassName(
        "checkbox-span checkbox-span--interactive"
      )[0];
      expect(
        transparent_checkbox &&
          window
            .getComputedStyle(transparent_checkbox)
            .getPropertyValue("background-color")
      ).toEqual("transparent");

      render(solid_checkbox_no_onclick);
      const colored_checkbox =
        document.getElementsByClassName("checkbox-span")[1];
      expect(
        colored_checkbox &&
          window
            .getComputedStyle(colored_checkbox)
            .getPropertyValue("background-color")
      ).not.toEqual("transparent");
    }
  });
});
