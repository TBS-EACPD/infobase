import { render, screen, fireEvent } from "@testing-library/react";

import React from "react";

import { LabeledBox } from "./LabeledBox";

describe("LabeledBox", () => {
  it("initially renders labeled box and displays label and child", async () => {
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

  it("renders an interactable child", async () => {
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
});
