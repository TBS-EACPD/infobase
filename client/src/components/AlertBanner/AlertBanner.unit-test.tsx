import { render, screen } from "@testing-library/react";
import React from "react";

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
  it("Throws when provided an invalid banner_class prop", () => {
    // TODO is there a better pattern for testing thrown errors without cluttering the jest output?
    // ... if not, then at least extract this as a test utility
    const console_error = console.error;
    try {
      console.error = jest.fn();

      expect(() => render(<AlertBanner banner_class="adfadf" />)).toThrow();
    } finally {
      console.error = console_error;
    }
  });
  it("Renders with additional classes provided by the additional_class_names prop", () => {
    render(
      <AlertBanner banner_class="info" additional_class_names="test-class" />
    );

    expect(document.querySelector(".alert-info.test-class")).toBeTruthy();
  });
});
