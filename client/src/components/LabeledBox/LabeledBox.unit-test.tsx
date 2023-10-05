import { render, screen, fireEvent } from "@testing-library/react";

import React from "react";

import { LabeledBox } from "./LabeledBox";

describe("LabeledBox", () => {
  it("Initially renders labeled box and displays label and child", async () => {
    render(
      <LabeledBox
        {...{
          label: "label display" as React.ReactNode,
          children: "label child" as React.ReactNode,
        }}
      />
    );
    expect(screen.queryByText("label display")).toBeInTheDocument();
    expect(screen.queryByText("label child")).toBeInTheDocument();
  });

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
  });
});
