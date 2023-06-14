export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export const getEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Entries<T>;

export type Arr<N extends number, T extends any[] = []> = T["length"] extends N
  ? T
  : Arr<N, [...T, any]>;

export type Decrement<N extends number> = Arr<N> extends [any, ...infer U]
  ? U["length"]
  : never;

export type DeepValues<T, Counter extends number = 0> = T extends object
  ? Counter extends 0
    ? T[keyof T]
    : DeepValues<T[keyof T], Decrement<Counter>>
  : never;

export type DeepKeys<T, Counter extends number = 0> = T extends object
  ? Counter extends 0
    ? keyof T
    : DeepKeys<T[keyof T], Decrement<Counter>>
  : never;
