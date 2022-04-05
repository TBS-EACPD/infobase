import { LiteralKeyedRecordHelper } from "./type_utils";

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
