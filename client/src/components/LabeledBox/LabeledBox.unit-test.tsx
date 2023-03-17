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
});
