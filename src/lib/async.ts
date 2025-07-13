import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { StandardSchemaV1Dictionary } from "./standard";
import { parse } from "./standard";
import type { MaybePromise, Serializer } from "./types";

export interface UnsafeAsyncStorage {
  getItem(key: string): MaybePromise<string | null | undefined>;
  setItem(key: string, value: string): MaybePromise<void>;
  removeItem(key: string): MaybePromise<void>;
}

export interface AsyncStorage<TSchema extends StandardSchemaV1> {
  get(): Promise<StandardSchemaV1.InferOutput<TSchema> | undefined>;
  set(value: StandardSchemaV1.InferInput<TSchema>): Promise<void>;
  remove(): Promise<void>;
}

interface BuildAsyncStoreCreatorConfig {
  /**
   * Methods to serialize and deserialize values.
   * @default JSON
   */
  serializer?: Serializer;
  /**
   * Storage to read and write values.
   * @default localStorage
   */
  storage?: UnsafeAsyncStorage;
}

export function buildAsyncStoreCreator(
  creatorConfig?: BuildAsyncStoreCreatorConfig,
) {
  return function createAsyncStore<TSchema extends StandardSchemaV1>(
    key: string,
    schema: TSchema,
    config?: BuildAsyncStoreCreatorConfig,
  ): AsyncStorage<TSchema> {
    const { serializer = JSON, storage = localStorage } = Object.assign(
      {},
      creatorConfig,
      config,
    );
    return {
      async get() {
        const value = await storage.getItem(key);
        if (value == null) return;
        return parse(schema, serializer.parse(value));
      },
      async set(value) {
        await storage.setItem(key, serializer.stringify(value));
      },
      async remove() {
        await storage.removeItem(key);
      },
    };
  };
}

export const createAsyncStore = buildAsyncStoreCreator();

export interface AsyncMultiStorage<
  TSchemaDict extends StandardSchemaV1Dictionary,
> {
  get<TKey extends keyof TSchemaDict>(
    key: TKey & string,
  ): Promise<StandardSchemaV1.InferOutput<TSchemaDict[TKey]> | undefined>;
  set<TKey extends keyof TSchemaDict>(
    key: TKey & string,
    value: StandardSchemaV1.InferInput<TSchemaDict[TKey]>,
  ): Promise<void>;
  remove(key: keyof TSchemaDict & string): Promise<void>;
}

export function buildAsyncMultiStoreCreator(
  creatorConfig?: BuildAsyncStoreCreatorConfig,
) {
  return function createAsyncMultiStore<
    TSchemaDict extends StandardSchemaV1Dictionary,
  >(
    schemaDict: TSchemaDict,
    config?: BuildAsyncStoreCreatorConfig,
  ): AsyncMultiStorage<TSchemaDict> {
    const { serializer = JSON, storage = localStorage } = Object.assign(
      {},
      creatorConfig,
      config,
    );
    return {
      async get(key) {
        const schema = schemaDict[key];
        if (!schema) throw new Error(`No schema found for key ${key}`);
        const value = await storage.getItem(key);
        if (value == null) return;
        return parse(schema, serializer.parse(value));
      },
      async set(key, value) {
        if (!schemaDict[key]) throw new Error(`No schema found for key ${key}`);
        await storage.setItem(key, serializer.stringify(value));
      },
      async remove(key) {
        if (!schemaDict[key]) throw new Error(`No schema found for key ${key}`);
        await storage.removeItem(key);
      },
    };
  };
}

export const createAsyncMultiStore = buildAsyncMultiStoreCreator();
