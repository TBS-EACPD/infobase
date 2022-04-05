import _ from "lodash";

import { Frequencies } from "./Frequencies";

describe("Frequencies", () => {
  it("Is typed as a string keyed dicitionary of string values", () => {
    // this is a no-op from jest's perspective, but before jest is run the type system WILL check this
    // TODO decide if I want this sort of thing dropped in to unit test files or in some other, never run,
    // file with a convention like <module>.type-tests.ts
    // One argument for sticking inside a unit test, it might, pair up with run time tests like the empty test below,
    // as the non-empty test doesn't mean much without typing and this type test _will_ pass trivially for an empty object

    type AssertIsDictOfStrings<S> = S extends { [x: string]: string }
      ? true
      : never;

    const is_dict_of_strings: AssertIsDictOfStrings<typeof Frequencies> = true;

    expect(is_dict_of_strings).toEqual(true);
  });

  it("Is non-empty", () => {
    expect(Frequencies).toBeTruthy();
  });
});
