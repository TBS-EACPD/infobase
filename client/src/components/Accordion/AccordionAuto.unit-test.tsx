import { render, screen } from "@testing-library/react";
import React from "react";

import { AccordionAuto } from "./AccordionAuto";

describe("AccordionAuto", () => {
  it("Starts with children visible if is_initially_expanded={true}", () => {
    const child_text = "test child";

    render(
      <AccordionAuto
        is_initially_expanded={true}
        max_height="200px"
        title="test"
        background_color="#333"
      >
        <div>{child_text}</div>
      </AccordionAuto>
    );

    expect(screen.queryByText(child_text)).toBeFalsy();
  });
});
