import { fireEvent, render, screen } from "@testing-library/react";

import React from "react";

import { trivial_text_maker } from "src/models/text";

import { Sidebar } from "./Sidebar";

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

describe("Sidebar", () => {
  it("Hides sidebar title and content when is_open is false", () => {
    const on_click = jest.fn();
    render(
      <Sidebar
        {...{
          is_open: false,
          open_close_callback: on_click,
          children: "Testing child",
          title_text: "Sidebar Title",
          sidebar_toggle_target: "[toggletest]",
          return_focus_target: null,
        }}
      />
    );

    expect(screen.queryByText("Testing child")).toBeNull();
    expect(screen.queryByText("Sidebar Title")).toBeNull();
  });

  it("Displays sidebar title and content when is_open is true", () => {
    const on_click = jest.fn();
    render(
      <Sidebar
        {...{
          is_open: true,
          open_close_callback: on_click,
          children: "Testing child",
          title_text: "Sidebar Title",
          sidebar_toggle_target: "[toggletest]",
          return_focus_target: null,
        }}
      />
    );

    expect(screen.queryByText("Testing child")).toBeVisible();
    expect(screen.queryByText("Sidebar Title")).toBeVisible();
  });

  it("Calls on_click when sidebar close button is clicked.", () => {
    const on_click = jest.fn();
    render(
      <Sidebar
        {...{
          is_open: true,
          open_close_callback: on_click,
          children: "Testing child",
          title_text: "Sidebar Title",
          sidebar_toggle_target: "[toggletest]",
          return_focus_target: null,
        }}
      />
    );

    expect(on_click).toHaveBeenCalledTimes(0);
    fireEvent.click(screen.queryByRole("button") as HTMLButtonElement);
    expect(on_click).toHaveBeenCalledTimes(1);
  });
});
