import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import { trivial_text_maker } from "src/models/text";

import { Accordion } from "./Accordion";

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

describe("Accordion", () => {
  const testing_default = {
    title: "title",
    children: "child",
    on_toggle: () => undefined,
    is_expanded: false,
  };

  it("Renders title text, regardless of is_expanded", () => {
    const title_text = "test title";

    const { rerender } = render(
      <Accordion
        {...{ ...testing_default, title: title_text, is_expanded: false }}
      />
    );

    expect(screen.getByText(title_text)).toBeVisible();

    rerender(
      <Accordion
        {...{ ...testing_default, title: title_text, is_expanded: true }}
      />
    );

    expect(screen.getByText(title_text)).toBeVisible();
  });

  it("Renders children when is_expanded is true", () => {
    const child_text = "test child";

    const { rerender } = render(
      <Accordion
        {...{ ...testing_default, children: child_text, is_expanded: false }}
      />
    );

    expect(screen.queryByText(child_text)).toBeNull();

    rerender(
      <Accordion
        {...{ ...testing_default, children: child_text, is_expanded: true }}
      />
    );

    expect(screen.getByText(child_text)).toBeVisible();
  });

  it("Has buttons, which call on_toggle on interaction", () => {
    const on_toggle = jest.fn();

    render(<Accordion {...{ ...testing_default, on_toggle }} />);

    const some_accordion_buttons = screen.getAllByRole("button");

    expect(some_accordion_buttons.length > 0).toBeTruthy();

    expect(on_toggle).toHaveBeenCalledTimes(0);
    some_accordion_buttons.forEach((button, index) => {
      fireEvent.click(button);
      expect(on_toggle).toHaveBeenCalledTimes(index + 1);
    });
  });
});
