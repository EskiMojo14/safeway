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
