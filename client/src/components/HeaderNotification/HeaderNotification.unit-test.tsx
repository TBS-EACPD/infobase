import { render, screen, fireEvent } from "@testing-library/react";
import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text";

import { HeaderNotification } from "./HeaderNotification";

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

describe("HeaderNotification", () => {
  it("Renders an array of text", async () => {
    const list_of_text = ["a", "b", "lorem ipsum"];

    render(
      <HeaderNotification
        list_of_text={list_of_text}
        hideNotification={() => undefined}
      />
    );

    _.forEach(list_of_text, (text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it("Has a close button which calls a callback on click", async () => {
    const mock_hide = jest.fn();
    render(
      <HeaderNotification list_of_text={[""]} hideNotification={mock_hide} />
    );

    fireEvent.click(screen.getByText("close"));

    expect(mock_hide).toHaveBeenCalledTimes(1);
  });
});
