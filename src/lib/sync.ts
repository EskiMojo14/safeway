import type { StandardSchemaV1 } from "@standard-schema/spec";
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
  delete(): void;
}

interface BuildStorageCreatorConfig {
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

const defaults: Required<BuildStorageCreatorConfig> = {
  serializer: JSON,
  storage: localStorage,
};

export function buildStorageCreator(creatorConfig?: BuildStorageCreatorConfig) {
  return function createStorage<TSchema extends StandardSchemaV1>(
    key: string,
    schema: TSchema,
    config?: BuildStorageCreatorConfig,
  ): Storage<TSchema> {
    const { serializer, storage } = Object.assign(
      {},
      defaults,
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
      delete() {
        storage.removeItem(key);
      },
    };
  };
}

export const createStorage = buildStorageCreator();
