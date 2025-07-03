/* eslint-disable @typescript-eslint/unbound-method */
import * as v from "valibot";
import { describe, it, expectTypeOf } from "vitest";
import { createStore } from "./sync";

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
