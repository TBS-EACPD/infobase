import {
  wrap_sort_with_undefined_handling,
  wrap_sort_with_direction,
  string_sort_func,
  number_sort_func,
  smart_sort_func,
} from "./sort_utils";

function sort_func(a: number, b: number): -1 | 0 | 1 {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

describe("wrap_sort_with_undefined_handling", () => {
  it("Sorting function that handles undefined arguments", () => {
    const no_undefined = wrap_sort_with_undefined_handling(3, 10, sort_func);
    expect(no_undefined).toBe(-1);

    const first_undefined = wrap_sort_with_undefined_handling(
      undefined,
      10,
      sort_func
    );
    expect(first_undefined).toBe(-1);

    const second_undefined = wrap_sort_with_undefined_handling(
      3,
      undefined,
      sort_func
    );
    expect(second_undefined).toBe(1);

    const both_undefined = wrap_sort_with_undefined_handling(
      undefined,
      undefined,
      sort_func
    );
    expect(both_undefined).toBe(0);
  });
});

describe("wrap_sort_with_direction", () => {
  it("Returns an ascending/descending sorting function", () => {
    const asc_sort_func = wrap_sort_with_direction(false, sort_func);
    expect(asc_sort_func(3, 10)).toBe(-1);

    const desc_sort_func = wrap_sort_with_direction(true, sort_func);
    expect(desc_sort_func(3, 10)).toBe(1);
  });
});

describe("string_sort_func", () => {
  it("Sorts cleaned versions of strings", () => {
    const result = string_sort_func("àààààà", "éééééé");
    expect(result).toBe(1);
  });
});

describe("number_sort_func", () => {
  it("Sorts numbers with undefined handling", () => {
    const no_undefined = number_sort_func(3, 10);
    expect(no_undefined).toBe(-1);

    const first_undefined = number_sort_func(undefined, 10);
    expect(first_undefined).toBe(-1);

    const second_undefined = number_sort_func(3, undefined);
    expect(second_undefined).toBe(1);

    const both_undefined = number_sort_func(undefined, undefined);
    expect(both_undefined).toBe(0);
  });
});

describe("smart_sort_func", () => {
  it("Sorting function that handles, strings, numbers, and undefined", () => {
    const both_string = smart_sort_func("hello", "world");
    expect(both_string).toBe(1);

    const both_number = smart_sort_func(4, 22);
    expect(both_number).toBe(-1);

    const first_undefined = smart_sort_func(undefined, 10);
    expect(first_undefined).toBe(-1);

    const second_undefined = smart_sort_func("bbbbbb", undefined);
    expect(second_undefined).toBe(1);

    const both_undefined = smart_sort_func(undefined, undefined);
    expect(both_undefined).toBe(0);
  });
});
