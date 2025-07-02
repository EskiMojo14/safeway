export interface Serializer {
  stringify(value: unknown): string;
  parse(value: string): unknown;
}

export type MaybePromise<T> = T | Promise<T>;
