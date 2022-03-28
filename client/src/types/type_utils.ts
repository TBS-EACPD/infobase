// VERY RARELY, some actual TS can be useful for it's typing rather than any actual effect.
// These are probably all hacks, especially if they don't strictly transpile to an identity!

/*
  Problem: when you're defining an object with arbitrary keys and some fixed value type. You want the values to be type checked
  and you also want the type system to know the keys afterwards.

  Note: if your value type is a literal, then this is all unnecessary. You can declare the object `as const` and the type system
  will unambiguously know the keys.

  By default, you might write this
  ```
    const some_typed_record_with_known_keys: Record<string, ArbitraryType> = {
      key1: ...,
      key2: ...,
    };
  ```
  `ArbitraryType` _will_ be checked/known on the values, but the type of `some_typed_record_with_known_keys` will be 
  `{ [x: string]: ArbitraryType}`, not picking up the fixed key values.

  Most ways I've seen for solving this require duplicating the keys as both types and actual JS values, e.g
  ```
    type SomeKeys = "key1" | "key2";

    const some_typed_record_with_known_keys: { [key in SomeKeys]: ArbitraryType } = {
      key1: ...,
      key2: ...,
    };
  ```

  That's a bother! Can we do better? Turns out, with a bit of uglyness, yes! Using the utility function below, we can write
  ```
    const some_typed_record_with_known_keys = make_identity_which_types_a_record_while_preserving_keys<ArbitraryType>()({
      key1: ...,
      key2: ...,
    });
  ```

  And boom, the value types are asserted, and the keys of the resulting record are known to the type system! The function used
  to pull of this little hack transpiles to an identity, so the run time trade off is almost certainly worth the improved typing
  experience.

  TODO explain _how_ it works
*/
export const make_identity_which_types_a_record_while_preserving_keys =
  <ValueType>() =>
  <RecordType extends Record<string | number | symbol, ValueType>>(
    record: RecordType
  ): { [key in keyof RecordType]: ValueType } =>
    record;
