import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React from "react";

import { trivial_text_maker } from "src/models/text";

import { AccordionAuto } from "./AccordionAuto";

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

describe("AccordionAuto", () => {
  it("Starts with children rendered if is_initially_expanded={true}", () => {
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

    expect(screen.queryByText(child_text)).toBeVisible();
  });
  it("Starts with no children rendered if is_initially_expanded={false}", () => {
    const child_text = "test child";

    render(
      <AccordionAuto
        is_initially_expanded={false}
        max_height="200px"
        title="test"
        background_color="#333"
      >
        <div>{child_text}</div>
      </AccordionAuto>
    );

    expect(screen.queryByText(child_text)).toBeNull();
  });
  it("Has something like a button the toggles the expansion/rendering og the children", async () => {
    const child_text = "test child";

    render(
      <AccordionAuto
        is_initially_expanded={false}
        max_height="200px"
        title="test"
        background_color="#333"
      >
        <div>{child_text}</div>
      </AccordionAuto>
    );

    const some_accordion_button = screen.getAllByRole("button")?.[0];

    expect(screen.queryByText(child_text)).toBeNull();

    fireEvent.click(some_accordion_button);

    const rendered_child = screen.getByText(child_text);
    expect(rendered_child).toBeVisible();

    fireEvent.click(some_accordion_button);

    await waitForElementToBeRemoved(rendered_child);
  });
});
