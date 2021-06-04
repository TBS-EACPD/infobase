// by Klaus Meinhardt @ajafff
// known from Gerrit Birkeland @Gerrit0
// https://github.com/Microsoft/TypeScript/issues/25987#issuecomment-408339599
// https://github.com/microsoft/TypeScript/issues/25987#issuecomment-441224690
export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U } // eslint-disable-line no-unused-vars
  ? {} extends U
    ? never
    : U
  : never;

export type WithoutIndexTypes<T> = Pick<T, KnownKeys<T>>;

// from https://stackoverflow.com/a/54827898
// TODO revisit the need for this once we have negated types https://github.com/Microsoft/TypeScript/pull/29317
// See for motivation: https://github.com/TBS-EACPD/infobase/pull/1121
// TLDR: the built in Omit will lose a lot of type information when used on something with an index type
// e.g. if a type has [key: string]: any then Omit will swallow ALL OTHER string-keyed properties...
// SafeOmit does not, only omits what you tell it to
export type SafeOmit<T, K extends PropertyKey> = { [P in keyof T as Exclude<P, K>]: T[P] };
