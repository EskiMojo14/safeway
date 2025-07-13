import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { StandardSchemaV1Dictionary } from "./standard";
import { parseSync } from "./standard";
import type { Serializer } from "./types";

export interface UnsafeStorage {
  getItem(key: string): string | null | undefined;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface Storage<TSchema extends StandardSchemaV1> {
  get(): StandardSchemaV1.InferOutput<TSchema> | undefined;
  set(value: StandardSchemaV1.InferInput<TSchema>): void;
  remove(): void;
}

interface BuildStoreCreatorConfig {
  /**
   * Methods to serialize and deserialize values.
   * @default JSON
   */
  serializer?: Serializer;
  /**
   * Storage to read and write values.
   * @default localStorage
   */
  storage?: UnsafeStorage;
}

export function buildStoreCreator(creatorConfig?: BuildStoreCreatorConfig) {
  return function createStore<TSchema extends StandardSchemaV1>(
    key: string,
    schema: TSchema,
    config?: BuildStoreCreatorConfig,
  ): Storage<TSchema> {
    const { serializer = JSON, storage = localStorage } = Object.assign(
      {},
      creatorConfig,
      config,
    );
    return {
      get() {
        const value = storage.getItem(key);
        if (value == null) return;
        return parseSync(schema, serializer.parse(value));
      },
      set(value) {
        storage.setItem(key, serializer.stringify(value));
      },
      remove() {
        storage.removeItem(key);
      },
    };
  };
}

export const createStore = buildStoreCreator();

export interface MultiStorage<TSchemaDict extends StandardSchemaV1Dictionary> {
  get<TKey extends keyof TSchemaDict>(
    key: TKey & string,
  ): StandardSchemaV1.InferOutput<TSchemaDict[TKey]> | undefined;
  set<TKey extends keyof TSchemaDict>(
    key: TKey & string,
    value: StandardSchemaV1.InferInput<TSchemaDict[TKey]>,
  ): void;
  remove(key: keyof TSchemaDict & string): void;
}

export function buildMultiStoreCreator(
  creatorConfig?: BuildStoreCreatorConfig,
) {
  return function createMultiStore<
    TSchemaDict extends StandardSchemaV1Dictionary,
  >(
    schemaDict: TSchemaDict,
    config?: BuildStoreCreatorConfig,
  ): MultiStorage<TSchemaDict> {
    const { serializer = JSON, storage = localStorage } = Object.assign(
      {},
      creatorConfig,
      config,
    );
    return {
      get(key) {
        const schema = schemaDict[key];
        if (!schema) throw new Error(`No schema found for key ${key}`);
        const value = storage.getItem(key);
        if (value == null) return;
        return parseSync(schema, serializer.parse(value));
      },
      set(key, value) {
        if (!schemaDict[key]) throw new Error(`No schema found for key ${key}`);
        storage.setItem(key, serializer.stringify(value));
      },
      remove(key) {
        if (!schemaDict[key]) throw new Error(`No schema found for key ${key}`);
        storage.removeItem(key);
      },
    };
  };
}

export const createMultiStore = buildMultiStoreCreator();
