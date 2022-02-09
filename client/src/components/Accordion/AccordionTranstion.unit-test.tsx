import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React from "react";

import { AccordionTransition } from "./AccordionTransition";

describe("AccordionTransition", () => {
  it("Does not render children if is_expanded={false}", () => {
    const child_text = "test child";

    render(
      <AccordionTransition is_expanded={false}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.queryByText(child_text)).toBeNull();
  });
  it("Renders children if is_expanded={true}", () => {
    const child_text = "test child";

    render(
      <AccordionTransition is_expanded={true}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.getByText(child_text)).toBeVisible();
  });
  it("renders/removes children after is_expanded updates", async () => {
    const child_text = "test child";

    const { rerender } = render(
      <AccordionTransition is_expanded={false}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.queryByText(child_text)).toBeNull();

    rerender(
      <AccordionTransition is_expanded={true}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    expect(screen.getByText(child_text)).toBeVisible();

    rerender(
      <AccordionTransition is_expanded={false}>
        <div>{child_text}</div>
      </AccordionTransition>
    );

    await waitForElementToBeRemoved(screen.queryByText(child_text));
  });
});
