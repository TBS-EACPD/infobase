import { render, fireEvent } from "@testing-library/react";
import React from "react";
import _ from "lodash";
import { Select } from "./Select";

const testing_default = {
  options: [
    {
      id: "selectinitial",
      display: "display1",
    },
    {
      id: "select2",
      display: "display2",
    },
    {
      id: "select3",
      display: "display3",
    },
  ],
};

describe("Select", () => {
  it("initializes initial select-option, calls onSelect when select option is changes", async () => {
    const onSelect = jest.fn();
    const id = "Selector";
    let selected = "selectinitial";

    const { getByTestId, queryAllByTestId } = render(
      <Select {...{ ...testing_default, id, selected: selected, onSelect }} />
    );

    let options = queryAllByTestId(
      "select-option"
    ) as unknown as HTMLOptionElement[];
    expect(options[0].selected).toBeTruthy();
    expect(onSelect).toHaveBeenCalledTimes(0);
    fireEvent.change(getByTestId("select"), { target: { value: "select2" } });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
