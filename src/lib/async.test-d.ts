/* eslint-disable @typescript-eslint/unbound-method */
import * as v from "valibot";
import { describe, it, expectTypeOf } from "vitest";
import { createAsyncStore, createAsyncMultiStore } from "./async";

describe("createAsyncStore", () => {
  it("should infer correct output and input", () => {
    const store = createAsyncStore("count", v.number());
    expectTypeOf(store.get()).resolves.toEqualTypeOf<number | undefined>();
    expectTypeOf(store.set).parameter(0).toEqualTypeOf<number>();
  });
  it("should infer correct input and output from a transforming schema", () => {
    const store = createAsyncStore(
      "count",
      v.pipe(
        v.number(),
        v.transform((count) => ({ count })),
      ),
    );
    expectTypeOf(store.get()).resolves.toEqualTypeOf<
      { count: number } | undefined
    >();
    expectTypeOf(store.set).parameter(0).toEqualTypeOf<number>();
  });
});

describe("createAsyncMultiStore", () => {
  it("should infer correct output and input", () => {
    const store = createAsyncMultiStore({
      count: v.number(),
      name: v.string(),
    });
    expectTypeOf(store.get("count")).resolves.toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(store.set<"count">)
      .parameter(1)
      .toEqualTypeOf<number>();

    expectTypeOf(store.get("name")).resolves.toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(store.set<"name">)
      .parameter(1)
      .toEqualTypeOf<string>();
  });
  it("should infer correct input and output from a transforming schema", () => {
    const store = createAsyncMultiStore({
      count: v.pipe(
        v.number(),
        v.transform((count) => ({ count })),
      ),
      name: v.string(),
    });
    expectTypeOf(store.get("count")).resolves.toEqualTypeOf<
      { count: number } | undefined
    >();
    expectTypeOf(store.set<"count">)
      .parameter(1)
      .toEqualTypeOf<number>();

    expectTypeOf(store.get("name")).resolves.toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(store.set<"name">)
      .parameter(1)
      .toEqualTypeOf<string>();
  });
});
