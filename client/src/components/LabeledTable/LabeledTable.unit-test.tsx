import { render, screen, fireEvent, queryByText } from "@testing-library/react";

import React from "react";

import { LabeledTable } from "./LabeledTable";

const testing_no_ids = {
  options: [
    {
      label: "item1",
      content: "content1",
    },
    {
      label: "item2",
      content: "content2",
    },
  ],
};

/*const testing_with_ids = {
  options: [
    {
      id: "1",
      label: "item1",
      content: "content1"
    },
    {
      id: "2",
      label: "item2",
      content: "content2"
    },
  ],
};
*/

describe("LabeledTable", () => {
  it("Initially renders labeled table with no optional id's or titlecomponents", async () => {
    render(
      <LabeledTable
        {...{ title: "Test table", contents: testing_no_ids.options }}
      />
    );
    expect(screen.queryByText("Test table")).toBeInTheDocument();
    expect(screen.queryByText("item1")).toBeInTheDocument();
    expect(screen.queryByText("item2")).toBeInTheDocument();
  });
  /*

  it("Renders labeled table with content's with id's and a TitleComponent for the table", async () => {

  }

  /*

  it("Renders an interactable child", async () => {
    const on_click = jest.fn();

    render(
      <LabeledBox
        {...{
          label: "label display" as React.ReactNode,
          children: (
            <div>
              <button onClick={on_click}>Test1</button>
            </div>
          ),
        }}
      />
    );
    expect(screen.queryByText("Test1")).toBeInTheDocument();
    expect(on_click).toHaveBeenCalledTimes(0);
    const button1 = screen.queryByRole("button");
    fireEvent.click(button1 as HTMLButtonElement);
    expect(on_click).toHaveBeenCalledTimes(1);
  });

  it("Renders multiple children", async () => {
    render(
      <LabeledBox
        {...{
          label: "label display" as React.ReactNode,
          children: [
            <div key="test1">
              <button>Test1</button>
            </div>,
            <div key="test2">
              <button>Test2</button>
            </div>,
          ],
        }}
      />
    );
    expect(screen.queryByText("Test1")).toBeInTheDocument();
    expect(screen.queryByText("Test2")).toBeInTheDocument();
    */
});
