// by Klaus Meinhardt @ajafff
// known from Gerrit Birkeland @Gerrit0
// https://github.com/Microsoft/TypeScript/issues/25987#issuecomment-408339599
// https://github.com/microsoft/TypeScript/issues/25987#issuecomment-441224690
export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? {} extends U
    ? never
    : U
  : never;

// based on https://github.com/microsoft/TypeScript/issues/31153#issuecomment-487894895
export type WithoutIndexTypes<T> = KnownKeys<T> extends infer U
  ? [U] extends [keyof T]
    ? Pick<T, U>
    : never
  : never;

// based on https://github.com/microsoft/TypeScript/issues/31153#issuecomment-487894895
// TODO revisit the need for this once we have negated types https://github.com/Microsoft/TypeScript/pull/29317
// See for motivation: https://github.com/TBS-EACPD/infobase/pull/1121
export type IndexTypeSafeOmit<T, K extends keyof T> = Omit<
  WithoutIndexTypes<T>,
  K
> &
  (string extends K // preserve wildcard string index type
    ? {}
    : string extends keyof T
    ? { [n: string]: T[Exclude<keyof T, number>] }
    : {}) &
  (number extends K // preserve wildcard number index type
    ? {}
    : number extends keyof T
    ? { [n: number]: T[Exclude<keyof T, string>] }
    : {});
