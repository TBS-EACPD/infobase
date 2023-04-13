import { render, screen, fireEvent } from "@testing-library/react";

import React from "react";

import { Details } from "./Details";

describe("Details", () => {
  it("initially renders summary content, but not content without opening", async () => {
    const summary_content = "Details title";
    const content = "Details content";

    render(
      <Details
        {...{
          summary_content: <div>{summary_content}</div>,
          content: <div>{content}</div>,
        }}
      />
    );
    expect(screen.getByText("Details title")).toBeInTheDocument();
    expect(screen.queryByText("Details content")).toBeNull();
  });

  it("initially renders summary content, as well as content after opening", async () => {
    const summary_content = "Details title";
    const content = "Details content";

    render(
      <Details
        {...{
          summary_content: <div>{summary_content}</div>,
          content: <div>{content}</div>,
        }}
      />
    );
    expect(screen.getByText("Details title")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Details content")).toBeVisible();
  });

  it("removes content after clicking button twice", async () => {
    const summary_content = "Details title";
    const content = "Details content";

    render(
      <Details
        {...{
          summary_content: <div>{summary_content}</div>,
          content: <div>{content}</div>,
        }}
      />
    );
    expect(screen.getByText("Details title")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Details content")).toBeNull();
  });
});