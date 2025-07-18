/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import superjson from "superjson";
import * as v from "valibot";
import { describe, it, expect, beforeEach } from "vitest";
import type { UnsafeAsyncStorage } from "./async";
import {
  buildAsyncStoreCreator,
  createAsyncStore,
  createAsyncMultiStore,
  buildAsyncMultiStoreCreator,
} from "./async";
import { wait } from "./utils";

describe("createAsyncStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const store = createAsyncStore("count", v.number());
  it("should create a store", () => {
    expect(store).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      remove: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", async () => {
    await expect(store.get()).resolves.toBeUndefined();
  });
  it("should set value in localStorage", async () => {
    await store.set(1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
  });
  it("should retrieve value if set", async () => {
    await store.set(1);
    await expect(store.get()).resolves.toBe(1);
  });
  it("should delete value", async () => {
    await store.set(1);
    await expect(store.get()).resolves.toBe(1);

    await store.remove();
    await expect(store.get()).resolves.toBeUndefined();
  });

  it("should support schemas that transform the value", async () => {
    const storage = createAsyncStore(
      "count",
      v.pipe(
        v.number(),
        v.transform((count) => ({ count })),
      ),
    );
    await storage.set(1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
    await expect(storage.get()).resolves.toEqual({ count: 1 });
  });
});

const asyncSessionStorage: UnsafeAsyncStorage = {
  async getItem(key) {
    await wait(10);
    return sessionStorage.getItem(key);
  },
  async setItem(key, value) {
    await wait(10);
    sessionStorage.setItem(key, value);
  },
  async removeItem(key) {
    await wait(10);
    sessionStorage.removeItem(key);
  },
};

describe("buildAsyncStoreCreator", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  const createSuperStorage = buildAsyncStoreCreator({
    serializer: superjson,
    storage: asyncSessionStorage,
  });
  const store = createSuperStorage("count", v.set(v.number()));
  it("should create a store", () => {
    expect(store).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      remove: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", async () => {
    await expect(store.get()).resolves.toBeUndefined();
  });
  it("should set value in sessionStorage", async () => {
    await store.set(new Set([1]));
    await expect(
      asyncSessionStorage.getItem("count"),
    ).resolves.toMatchInlineSnapshot(
      `"{"json":[1],"meta":{"values":["set"]}}"`,
    );
  });
  it("should retrieve value if set", async () => {
    await store.set(new Set([1]));
    await expect(store.get()).resolves.toEqual(new Set([1]));
  });
  it("should delete value", async () => {
    await store.set(new Set([1]));
    await expect(store.get()).resolves.toEqual(new Set([1]));

    await store.remove();
    await expect(store.get()).resolves.toBeUndefined();
  });
});

describe("createAsyncMultiStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const store = createAsyncMultiStore({
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
  it("should retrieve undefined if not set", async () => {
    await expect(store.get("count")).resolves.toBeUndefined();
  });
  it("should set value in localStorage", async () => {
    await store.set("count", 1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
  });
  it("should retrieve value if set", async () => {
    await store.set("count", 1);
    await expect(store.get("count")).resolves.toBe(1);
  });
  it("should delete value", async () => {
    await store.set("count", 1);
    await expect(store.get("count")).resolves.toBe(1);

    await store.remove("count");
    await expect(store.get("count")).resolves.toBeUndefined();
  });
  it("should throw if key is invalid", async () => {
    // @ts-expect-error invalid key
    await expect(store.get("invalid")).rejects.toThrowError(
      "No schema found for key invalid",
    );
    // @ts-expect-error invalid key
    await expect(store.set("invalid", 1)).rejects.toThrowError(
      "No schema found for key invalid",
    );
    // @ts-expect-error invalid key
    await expect(store.remove("invalid")).rejects.toThrowError(
      "No schema found for key invalid",
    );
  });
});

describe("buildAsyncMultiStoreCreator", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  const createSuperStore = buildAsyncMultiStoreCreator({
    serializer: superjson,
    storage: asyncSessionStorage,
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
  it("should retrieve undefined if not set", async () => {
    await expect(store.get("count")).resolves.toBeUndefined();
  });
  it("should set value in sessionStorage", async () => {
    await store.set("count", new Set([1]));
    await expect(
      asyncSessionStorage.getItem("count"),
    ).resolves.toMatchInlineSnapshot(
      `"{"json":[1],"meta":{"values":["set"]}}"`,
    );
  });
  it("should retrieve value if set", async () => {
    await store.set("count", new Set([1]));
    await expect(store.get("count")).resolves.toEqual(new Set([1]));
  });
  it("should delete value", async () => {
    await store.set("count", new Set([1]));
    await expect(store.get("count")).resolves.toEqual(new Set([1]));

    await store.remove("count");
    await expect(store.get("count")).resolves.toBeUndefined();
  });
});
