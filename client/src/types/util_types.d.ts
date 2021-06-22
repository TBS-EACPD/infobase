// by Klaus Meinhardt @ajafff
// known from Gerrit Birkeland @Gerrit0
// comments by @stephen-oneil, so blame me if I've interpeted it wrong
// https://github.com/Microsoft/TypeScript/issues/25987#issuecomment-408339599
// https://github.com/microsoft/TypeScript/issues/25987#issuecomment-441224690

export type KnownKeys<T> = {
  // map key: value to key: key OR key: never in the case where key is an index signature (e.g. [key: string], [key: number])
  // future proofed against symbol index types, not released but on master as of https://github.com/microsoft/TypeScript/pull/44512
  [key in keyof T]: string extends key
    ? never
    : number extends key
    ? never
    : symbol extends key
    ? never
    : key;
} extends {
  // conditional used to infer union  the value types from the left hand side of this extends
  // (where the value types are either the keys or never, and never is excluded from the infered union)
  [_ in keyof T]: infer KnowableKeys;
}
  ? // above line will infer a type of {} if T has no keys, not what we want. Return never instead
    {} extends KnowableKeys // eslint-disable-line @typescript-eslint/ban-types
    ? never
    : KnowableKeys
  : never; // not reachable, but conditional expression necessary for construction with desired inference of KnowableKeys

export type WithoutIndexTypes<T> = Pick<T, KnownKeys<T>>;

// from https://stackoverflow.com/a/54827898
// See for motivation: https://github.com/TBS-EACPD/infobase/pull/1121
// TLDR: the built in Omit will lose a lot of type information when used on something with an index type
// e.g. if a type has [key: string]: any then Omit will swallow ALL OTHER string-keyed properties...
// SafeOmit does not, only omits what you tell it to
// TODO revisit the need for this once we have negated types https://github.com/Microsoft/TypeScript/pull/29317
export type SafeOmit<T, K extends PropertyKey> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};
