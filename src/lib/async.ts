import type { StandardSchemaV1 } from "@standard-schema/spec";
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
  delete(): Promise<void>;
}

interface BuildAsyncStorageCreatorConfig {
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

const defaults: Required<BuildAsyncStorageCreatorConfig> = {
  serializer: JSON,
  storage: localStorage,
};

export function buildAsyncStorageCreator(
  creatorConfig?: BuildAsyncStorageCreatorConfig,
) {
  return function createAsyncStorage<TSchema extends StandardSchemaV1>(
    key: string,
    schema: TSchema,
    config?: BuildAsyncStorageCreatorConfig,
  ): AsyncStorage<TSchema> {
    const { serializer, storage } = Object.assign(
      {},
      defaults,
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
      async delete() {
        await storage.removeItem(key);
      },
    };
  };
}

export const createAsyncStorage = buildAsyncStorageCreator();
