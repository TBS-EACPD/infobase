import { render, screen } from "@testing-library/react";

import React from "react";

import { trivial_text_maker } from "src/models/text";

import { IconGrid } from "./IconGrid";

import {
  IconHTML,
  IconNodeJS,
  IconReact,
  IconGit,
  IconGitHub,
  IconPython,
  IconSass,
  IconGraphQL,
  IconBaselineCloud,
} from "src/icons/icons";

import _ from "lodash";

const tech_icon_list = _.chain([
  IconHTML,
  IconNodeJS,
  IconReact,
  IconGit,
  IconGitHub,
  IconPython,
  IconSass,
  IconGraphQL,
  IconBaselineCloud,
])
  .map((SVG) => ({ svg: <SVG alternate_color={false} width="1.25em" /> }))
  .value();

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

describe("IconGrid", () => {
  it("Renders basic ImageIcon grid with invalid href and src, and displays alt text.", () => {
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

  it("Renders basic SVGIcon grid and the entirety of it's array", () => {
    render(<IconGrid icons={tech_icon_list} />);

    expect(screen.getByTestId(0)).toBeInTheDocument();
    expect(screen.getByTestId(1)).toBeInTheDocument();
    expect(screen.getByTestId(2)).toBeInTheDocument();
    expect(screen.getByTestId(3)).toBeInTheDocument();
    expect(screen.getByTestId(4)).toBeInTheDocument();
    expect(screen.getByTestId(5)).toBeInTheDocument();
    expect(screen.getByTestId(6)).toBeInTheDocument();
    expect(screen.getByTestId(7)).toBeInTheDocument();
    expect(screen.getByTestId(8)).toBeInTheDocument();
    expect(screen.queryByTestId(9)).toBeNull();
  });
});
