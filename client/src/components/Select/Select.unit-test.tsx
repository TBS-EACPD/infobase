import { render, fireEvent } from "@testing-library/react";

import React from "react";

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
  it("initializes initial select-option, calls onSelect when select is changed", () => {
    const onSelect = jest.fn();
    const id = "Selector";
    const selected = "selectinitial";

    const { getByTestId, queryAllByTestId } = render(
      <Select {...{ ...testing_default, id, selected: selected, onSelect }} />
    );

    const options = queryAllByTestId(
      "select-option"
    ) as unknown as HTMLOptionElement[];
    expect(options[0].selected).toBeTruthy();
    expect(onSelect).toHaveBeenCalledTimes(0);
    //Does not actually seem to be changing the selected value for some reason.
    fireEvent.change(getByTestId("select"), { target: { value: "select2" } });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("changes other select-option besides initial option to be 'selected'", () => {
    const onSelect = jest.fn();
    const id = "Selector";
    const selected = "selectinitial";

    const { queryAllByTestId } = render(
      <Select {...{ ...testing_default, id, selected: selected, onSelect }} />
    );

    const options = queryAllByTestId(
      "select-option"
    ) as unknown as HTMLOptionElement[];
    expect(options[0].selected).toBeTruthy();
    //Directly swaps currently selected option
    fireEvent.change(options[1], { target: { selected: true } });
    expect(options[0].selected).toBeFalsy();
    expect(options[1].selected).toBeTruthy();
  });
});
