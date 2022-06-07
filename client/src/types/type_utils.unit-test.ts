import {
  LiteralKeyedRecordHelper,
  ComputedLiteralKeyRecord,
} from "./type_utils";

describe("LiteralKeyedRecordHelper", () => {
  it("Is an identity at runtime", () => {
    const object = { key: "value" };
    expect(LiteralKeyedRecordHelper()(object)).toBe(object);
  });

  it("Type system test: the type system infers the literal keys from the original object, types the values according to the generic argument", () => {
    const record = LiteralKeyedRecordHelper<string | number>()({
      literal_key: "string",
      "another literal key": 1,
    });

    type ExpectedLiteralKeyedType = {
      literal_key: string | number;
      "another literal key": string | number;
    };

    type AssertExpectedType<ActualType> =
      ActualType extends ExpectedLiteralKeyedType
        ? ExpectedLiteralKeyedType extends ActualType
          ? true
          : never
        : never;

    const type_assertion: AssertExpectedType<typeof record> = true;

    expect(type_assertion).toEqual(true);
  });
});

describe("ComputedLiteralKeyRecord", () => {
  it("Coverts key and value arg to object at run time", () => {
    const key = "key";
    const value = "value";
    expect(ComputedLiteralKeyRecord(key, value)).toStrictEqual({
      [key]: value,
    });
  });

  it("Type system test: the type system sees the computed keys as literals, retains the value's type", () => {
    const key_base = "base";

    const record_with_computed_literal_keys = {
      ...ComputedLiteralKeyRecord(`prefix_${key_base}`, 1),
      ...ComputedLiteralKeyRecord(`${key_base}_suffix`, "a"),
    };

    type ExpectedLiteralKeyedType = {
      prefix_base: number;
      base_suffix: string;
    };

    type AssertExpectedType<ActualType> =
      ActualType extends ExpectedLiteralKeyedType
        ? ExpectedLiteralKeyedType extends ActualType
          ? true
          : never
        : never;

    const type_assertion: AssertExpectedType<
      typeof record_with_computed_literal_keys
    > = true;

    expect(type_assertion).toEqual(true);
  });
});
