/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import superjson from "superjson";
import * as v from "valibot";
import { describe, it, expect, beforeEach } from "vitest";
import type { UnsafeAsyncStorage } from "./async";
import { buildAsyncStorageCreator, createAsyncStorage } from "./async";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("createAsyncStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const storage = createAsyncStorage("count", v.number());
  it("should create a storage", () => {
    expect(storage).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      delete: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", async () => {
    await expect(storage.get()).resolves.toBeUndefined();
  });
  it("should set value in localStorage", async () => {
    await storage.set(1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
  });
  it("should retrieve storage if set", async () => {
    await storage.set(1);
    await expect(storage.get()).resolves.toBe(1);
  });
  it("should delete storage", async () => {
    await storage.set(1);
    await expect(storage.get()).resolves.toBe(1);

    await storage.delete();
    await expect(storage.get()).resolves.toBeUndefined();
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

describe("buildAsyncStorageCreator", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  const createSuperStorage = buildAsyncStorageCreator({
    serializer: superjson,
    storage: asyncSessionStorage,
  });
  const storage = createSuperStorage("count", v.set(v.number()));
  it("should create a storage", () => {
    expect(storage).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      delete: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", async () => {
    await expect(storage.get()).resolves.toBeUndefined();
  });
  it("should set value in sessionStorage", async () => {
    await storage.set(new Set([1]));
    await expect(
      asyncSessionStorage.getItem("count"),
    ).resolves.toMatchInlineSnapshot(
      `"{"json":[1],"meta":{"values":["set"]}}"`,
    );
  });
  it("should retrieve storage if set", async () => {
    await storage.set(new Set([1]));
    await expect(storage.get()).resolves.toEqual(new Set([1]));
  });
  it("should delete storage", async () => {
    await storage.set(new Set([1]));
    await expect(storage.get()).resolves.toEqual(new Set([1]));

    await storage.delete();
    await expect(storage.get()).resolves.toBeUndefined();
  });
});
