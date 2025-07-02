/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import superjson from "superjson";
import * as v from "valibot";
import { describe, it, expect, beforeEach } from "vitest";
import { buildStorageCreator, createStorage } from "./sync";

describe("createStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const storage = createStorage("count", v.number());
  it("should create a storage", () => {
    expect(storage).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      delete: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", () => {
    expect(storage.get()).toBeUndefined();
  });
  it("should set value in localStorage", () => {
    storage.set(1);
    expect(localStorage.getItem("count")).toMatchInlineSnapshot(`"1"`);
  });
  it("should retrieve storage if set", () => {
    storage.set(1);
    expect(storage.get()).toBe(1);
  });
  it("should delete storage", () => {
    storage.set(1);
    expect(storage.get()).toBe(1);

    storage.delete();
    expect(storage.get()).toBeUndefined();
  });
});

describe("buildStorageCreator", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  const createSuperStorage = buildStorageCreator({
    serializer: superjson,
    storage: sessionStorage,
  });
  const storage = createSuperStorage("count", v.set(v.number()));
  it("should create a storage", () => {
    expect(storage).toMatchObject({
      get: expect.any(Function),
      set: expect.any(Function),
      delete: expect.any(Function),
    });
  });
  it("should retrieve undefined if not set", () => {
    expect(storage.get()).toBeUndefined();
  });
  it("should set value in sessionStorage", () => {
    storage.set(new Set([1]));
    expect(sessionStorage.getItem("count")).toMatchInlineSnapshot(`"{"json":[1],"meta":{"values":["set"]}}"`);
  });
  it("should retrieve storage if set", () => {
    storage.set(new Set([1]));
    expect(storage.get()).toEqual(new Set([1]));
  });
  it("should delete storage", () => {
    storage.set(new Set([1]));
    expect(storage.get()).toEqual(new Set([1]));

    storage.delete();
    expect(storage.get()).toBeUndefined();
  });
});
