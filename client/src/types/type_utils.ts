// VERY RARELY, some actual _code_ can be useful for it's typing rather than its actual effect.
// These are probably all hacks, especially if they don't strictly transpile to an identity!

/*
  Problem: you're declaring an object with arbitrary keys and some fixed type for all values (and that type's non-literal). 
  You want the values to be typed (like a Record<...>) BUT you also really want the type system to know the keys of the object 
  itself (like an object literal).

  Most ways I've seen for solving this require duplicating the keys on the object and in separate union type, e.g
  ```
    type SomeKeys = "key1" | "key2";

    const some_typed_record_with_known_keys: Record<SomeKeys, ArbitraryType> = {
      key1: ...,
      key2: ...,
    };
  ```

  That's a bother to write and maintain! Can we do better? Turns out, with a bit of uglyness, yes! Using the utility function 
  below, we can write
  ```
    const some_typed_record_with_known_keys = InferedKeyRecordHelper<ArbitraryType>()({
      key1: ...,
      key2: ...,
    });
  ```
  And boom, the type system sees `some_typed_record_with_known_keys` as an object literal and knows it's keys, but also knows
  (and asserts, in the identity's argument) that the value's are `ArbitraryType`s! 
  
  Only downside is that it uses actual code for purely type system gains, since a curried outer function is necessary for partial
  type inference. It transpiles to an identity, so it's about as negligible for the run time as it could be. That and the empty
  curry call is a bit ugly itself. Ah well, at least you're not maintaining a separate union type for all your keys anymore!
*/
export const LiteralKeyedRecordHelper =
  <RecordValue>() =>
  <RecordKeys extends string | number | symbol>(record: {
    [Key in RecordKeys]: RecordValue;
  }) =>
    record;

/*
  Problem: you want computed keys parsed as literals by the type system. 
  
  Note: sort of the reverse of the LiteralKeyedRecordHelper case, this is for your keys are _not_ static and your values are _not_ uniformly typed

  Solution from https://github.com/microsoft/TypeScript/issues/45541#issuecomment-903819569

  Usage:
  const object_with_computed_literal_keys = {
    ...ComputedLiteralKeyRecord(`prefix_${key_base}`, value),
    ...ComputedLiteralKeyRecord(`${key_base}_suffix`, value),
  }
*/
type DistributedRecord<K extends PropertyKey, V> = {
  [P in K]: { [Q in P]: V };
}[K];
export const ComputedLiteralKeyRecord = <K extends PropertyKey, V>(
  k: K,
  v: V
): DistributedRecord<K, V> =>
  ({
    [k]: v,
  } as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */
