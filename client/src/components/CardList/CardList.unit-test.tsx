import { render, screen, fireEvent } from "@testing-library/react";
import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text";

import { CardList } from "./CardList";

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

const testing_cardlist = [
  {
    display: "Outer Display1",
    children: [{ display: "Inner Display1" }],
  },
  {
    display: "Outer Display2",
    children: [{ display: "Inner Display2" }],
  },
];

describe("CardList", () => {
  it("Renders a CardList with visible CardListElementProps and CardListChildElementProps", async () => {
    render(<CardList elements={testing_cardlist} />);
    expect(screen.getByText("Outer Display1")).toBeInTheDocument();
    expect(screen.getByText("Outer Display2")).toBeInTheDocument();
    expect(screen.getByText("Inner Display1")).toBeInTheDocument();
    expect(screen.getByText("Inner Display2")).toBeInTheDocument();
  });
});
