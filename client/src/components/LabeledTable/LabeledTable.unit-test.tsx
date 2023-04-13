import { render, screen } from "@testing-library/react";

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

const testing_with_ids = {
  options: [
    {
      id: "1",
      label: "item1",
      content: "content1",
    },
    {
      id: "2",
      label: "item2",
      content: "content2",
    },
  ],
};

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
    expect(screen.queryByText("content1")).toBeInTheDocument();
    expect(screen.queryByText("content2")).toBeInTheDocument();
  });

  it("Renders labeled table with content's with id's and a TitleComponent for the table", async () => {
    render(
      <LabeledTable
        {...{
          title: "Test table",
          contents: testing_with_ids.options,
          TitleComponent: ({ children }) => (
            <h2 className="heading-unstyled">{children}</h2>
          ),
        }}
      />
    );
    expect(screen.queryByText("Test table")).toBeInTheDocument();
    expect(screen.queryByText("item1")).toBeInTheDocument();
    expect(screen.queryByText("item2")).toBeInTheDocument();
    expect(screen.queryByText("content1")).toBeInTheDocument();
    expect(screen.queryByText("content2")).toBeInTheDocument();
  });

  it("Renders labeledtable with empty content array", async () => {
    render(
      <LabeledTable
        {...{
          title: "Test table",
          contents: [],
          TitleComponent: ({ children }) => (
            <h2 className="heading-unstyled">{children}</h2>
          ),
        }}
      />
    );
  });
});
