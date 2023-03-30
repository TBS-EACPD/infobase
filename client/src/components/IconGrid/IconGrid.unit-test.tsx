import { render, screen } from "@testing-library/react";
import React from "react";
import { trivial_text_maker } from "src/models/text";

import { IconGrid } from "./IconGrid";

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

describe("IconGrid", () => {
  it("Renders basic icon grid with invalid href and src, and displays alt text.", () => {
    render(
      <IconGrid
        icons={[
          { alt: "testalt1", href: "testhref1", src: "testsrc1" },
          { alt: "testalt2", href: "testhref2", src: "testsrc2" },
        ]}
      />
    );
    expect(screen.queryByAltText("testalt1")).toBeInTheDocument();
    expect(screen.queryByAltText("testalt2")).toBeInTheDocument();
  });
});
