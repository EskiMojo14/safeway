/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import superjson from "superjson";
import * as v from "valibot";
import { describe, it, expect, beforeEach } from "vitest";
import { buildStoreCreator, createStore } from "./sync";

describe("createStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const store = createStore("count", v.number());
  it("should create a store", () => {
    expect(store).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      delete: expect.any(Function),
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

    store.delete();
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
      delete: expect.any(Function),
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

    store.delete();
    expect(store.get()).toBeUndefined();
  });
});
