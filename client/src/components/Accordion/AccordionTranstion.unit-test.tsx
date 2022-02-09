import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React from "react";

import { AccordionTransition } from "./AccordionTransition";

describe("AlertBanner", () => {
  it("Does not render children if isExpanded={false}", () => {
    const child_text = "test child";

    render(
      <AccordionTransition isExpanded={false}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.queryByText(child_text)).toBeFalsy();
  });
  it("Renders children if isExpanded={true}", () => {
    const child_text = "test child";

    render(
      <AccordionTransition isExpanded={true}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.queryByText(child_text)).toBeVisible();
  });
  it("renders/removes children after isExpanded updates", async () => {
    const child_text = "test child";

    const { rerender } = render(
      <AccordionTransition isExpanded={false}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.queryByText(child_text)).toBeFalsy();

    rerender(
      <AccordionTransition isExpanded={true}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.queryByText(child_text)).toBeVisible();

    rerender(
      <AccordionTransition isExpanded={false}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    await waitForElementToBeRemoved(screen.queryByText(child_text));
  });
});
