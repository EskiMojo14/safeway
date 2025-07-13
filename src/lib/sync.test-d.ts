/* eslint-disable @typescript-eslint/unbound-method */
import * as v from "valibot";
import { describe, it, expectTypeOf } from "vitest";
import { createStore, createMultiStore } from "./sync";

describe("createStore", () => {
  it("should infer correct output and input", () => {
    const store = createStore("count", v.number());
    expectTypeOf(store.get()).toEqualTypeOf<number | undefined>();
    expectTypeOf(store.set).parameter(0).toEqualTypeOf<number>();
  });
  it("should infer correct input and output from a transforming schema", () => {
    const store = createStore(
      "count",
      v.pipe(
        v.number(),
        v.transform((count) => ({ count })),
      ),
    );
    expectTypeOf(store.get()).toEqualTypeOf<{ count: number } | undefined>();
    expectTypeOf(store.set).parameter(0).toEqualTypeOf<number>();
  });
});

describe("createMultiStore", () => {
  it("should infer correct output and input", () => {
    const store = createMultiStore({
      count: v.number(),
      name: v.string(),
    });
    expectTypeOf(store.get("count")).toEqualTypeOf<number | undefined>();
    expectTypeOf(store.set<"count">)
      .parameter(1)
      .toEqualTypeOf<number>();

    expectTypeOf(store.get("name")).toEqualTypeOf<string | undefined>();
    expectTypeOf(store.set<"name">)
      .parameter(1)
      .toEqualTypeOf<string>();
  });
  it("should infer correct input and output from a transforming schema", () => {
    const store = createMultiStore({
      count: v.pipe(
        v.number(),
        v.transform((count) => ({ count })),
      ),
      name: v.string(),
    });
    expectTypeOf(store.get("count")).toEqualTypeOf<
      { count: number } | undefined
    >();
    expectTypeOf(store.set<"count">)
      .parameter(1)
      .toEqualTypeOf<number>();

    expectTypeOf(store.get("name")).toEqualTypeOf<string | undefined>();
    expectTypeOf(store.set<"name">)
      .parameter(1)
      .toEqualTypeOf<string>();
  });
});
