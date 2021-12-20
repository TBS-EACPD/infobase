import {
  wrap_sort_with_undefined_handling,
  wrap_sort_with_direction,
  string_sort_func,
  number_sort_func,
  smart_sort_func,
} from "./sort_utils";

function sort_func(a: number | string, b: number | string): -1 | 0 | 1 {
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
    expect(wrap_sort_with_undefined_handling(3, 10, sort_func)).toBe(-1);
    expect(wrap_sort_with_undefined_handling(undefined, 10, sort_func)).toBe(
      -1
    );
    expect(wrap_sort_with_undefined_handling("3", undefined, sort_func)).toBe(
      1
    );
    expect(
      wrap_sort_with_undefined_handling(undefined, undefined, sort_func)
    ).toBe(0);
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
    expect(string_sort_func("àààààà", "éééééé")).toBe(1);
    expect(string_sort_func("zzz", "yyy")).toBe(-1);
    expect(string_sort_func("abc", "àbc")).toBe(0);
  });
});

describe("number_sort_func", () => {
  it("Sorts numbers with undefined handling", () => {
    expect(number_sort_func(3, 10)).toBe(-1);
    expect(number_sort_func(undefined, 10)).toBe(-1);
    expect(number_sort_func(3, undefined)).toBe(1);
    expect(number_sort_func(undefined, undefined)).toBe(0);
  });
});

describe("smart_sort_func", () => {
  it("Sorting function that handles strings, numbers, and undefined", () => {
    expect(smart_sort_func("hello", "world")).toBe(1);
    expect(smart_sort_func(4, 22)).toBe(-1);
    expect(smart_sort_func(undefined, 10)).toBe(-1);
    expect(smart_sort_func("bbbbbb", undefined)).toBe(1);
    expect(smart_sort_func(undefined, undefined)).toBe(0);
  });
});
