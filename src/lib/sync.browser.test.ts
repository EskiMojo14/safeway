/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import superjson from "superjson";
import * as v from "valibot";
import { describe, it, expect, beforeEach } from "vitest";
import {
  buildStoreCreator,
  createStore,
  createMultiStore,
  buildMultiStoreCreator,
} from "./sync";
import { wait } from "./utils";

describe("createStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const store = createStore("count", v.number());
  it("should create a store", () => {
    expect(store).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      remove: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", () => {
    expect(store.get()).toBeUndefined();
  });
  it("should set value in localStorage", () => {
    store.set(1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
  });
  it("should retrieve value if set", () => {
    store.set(1);
    expect(store.get()).toBe(1);
  });
  it("should delete value", () => {
    store.set(1);
    expect(store.get()).toBe(1);

    store.remove();
    expect(store.get()).toBeUndefined();
  });
  it("should support schemas that transform the value", () => {
    const store = createStore(
      "count",
      v.pipe(
        v.number(),
        v.transform((count) => ({ count })),
      ),
    );
    store.set(1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
    expect(store.get()).toEqual({ count: 1 });
  });
  it("should throw if schema is async", () => {
    const store = createStore(
      "count",
      v.pipeAsync(
        v.number(),
        v.transformAsync(async (count) => {
          await wait(10);
          return { count };
        }),
      ),
    );
    store.set(1);
    expect(() => store.get()).toThrowError(
      "Schema validation must be synchronous",
    );
  });
});

describe("buildStoreCreator", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  const createSuperStore = buildStoreCreator({
    serializer: superjson,
    storage: sessionStorage,
  });
  const store = createSuperStore("counts", v.set(v.number()));
  it("should create a store", () => {
    expect(store).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      remove: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", () => {
    expect(store.get()).toBeUndefined();
  });
  it("should set value in sessionStorage", () => {
    store.set(new Set([1]));
    expect(sessionStorage.getItem("counts")).toMatchInlineSnapshot(
      `"{"json":[1],"meta":{"values":["set"]}}"`,
    );
  });
  it("should retrieve value if set", () => {
    store.set(new Set([1]));
    expect(store.get()).toEqual(new Set([1]));
  });
  it("should delete value", () => {
    store.set(new Set([1]));
    expect(store.get()).toEqual(new Set([1]));

    store.remove();
    expect(store.get()).toBeUndefined();
  });
});

describe("createMultiStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const store = createMultiStore({
    count: v.number(),
    name: v.string(),
  });
  it("should create a store", () => {
    expect(store).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      remove: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", () => {
    expect(store.get("count")).toBeUndefined();
  });
  it("should set value in localStorage", () => {
    store.set("count", 1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
  });
  it("should retrieve value if set", () => {
    store.set("count", 1);
    expect(store.get("count")).toBe(1);
  });
  it("should delete value", () => {
    store.set("count", 1);
    expect(store.get("count")).toBe(1);

    store.remove("count");
    expect(store.get("count")).toBeUndefined();
  });
  it("should throw if key is invalid", () => {
    // @ts-expect-error invalid key
    expect(() => store.get("invalid")).toThrowError(
      "No schema found for key invalid",
    );
    expect(() => {
      // @ts-expect-error invalid key
      store.set("invalid", 1);
    }).toThrowError("No schema found for key invalid");
    expect(() => {
      // @ts-expect-error invalid key
      store.remove("invalid");
    }).toThrowError("No schema found for key invalid");
  });
});

describe("buildMultiStoreCreator", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  const createSuperStore = buildMultiStoreCreator({
    serializer: superjson,
    storage: sessionStorage,
  });
  const store = createSuperStore({
    count: v.set(v.number()),
    name: v.string(),
  });
  it("should create a store", () => {
    expect(store).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      remove: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", () => {
    expect(store.get("count")).toBeUndefined();
  });
  it("should set value in sessionStorage", () => {
    store.set("count", new Set([1]));
    expect(sessionStorage.getItem("count")).toMatchInlineSnapshot(
      `"{"json":[1],"meta":{"values":["set"]}}"`,
    );
  });
  it("should retrieve value if set", () => {
    store.set("count", new Set([1]));
    expect(store.get("count")).toEqual(new Set([1]));
  });
  it("should delete value", () => {
    store.set("count", new Set([1]));
    expect(store.get("count")).toEqual(new Set([1]));

    store.remove("count");
    expect(store.get("count")).toBeUndefined();
  });
});
