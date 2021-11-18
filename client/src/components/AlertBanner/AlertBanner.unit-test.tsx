import { render, screen } from "@testing-library/react";
import React from "react";

import { with_console_error_silenced } from "src/testing_utils";

import { AlertBanner } from "./AlertBanner";

describe("AlertBanner", () => {
  it("Renders children", () => {
    const child_text = "test child";

    render(
      <AlertBanner>
        <div>{child_text}</div>
      </AlertBanner>
    );

    expect(screen.getByText(child_text)).toBeTruthy();
  });
  it("Renders with the corresponding class when provided a valid banner_class prop", () => {
    render(<AlertBanner banner_class="info" />);

    expect(document.querySelector(".alert-info")).toBeTruthy();
  });
  it("Throws when provided an invalid banner_class prop", () =>
    with_console_error_silenced(() => {
      expect(() => render(<AlertBanner banner_class="adfadf" />)).toThrow();
    }));
  it("Renders with additional classes provided by the additional_class_names prop", () => {
    render(
      <AlertBanner banner_class="info" additional_class_names="test-class" />
    );

    expect(document.querySelector(".alert-info.test-class")).toBeTruthy();
  });
});
