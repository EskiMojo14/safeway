import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";

export function parseSync<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
): StandardSchemaV1.InferOutput<TSchema> {
  const result = schema["~standard"].validate(input);
  if (result instanceof Promise)
    throw new TypeError("Schema validation must be synchronous");
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

export async function parse<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  const result = await schema["~standard"].validate(input);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

export type StandardSchemaV1Dictionary<
  Input = Record<string, unknown>,
  Output extends Record<keyof Input, unknown> = Input,
> = {
  [K in keyof Input]: StandardSchemaV1<Input[K], Output[K]>;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace StandardSchemaV1Dictionary {
  export type InferInput<Schema extends StandardSchemaV1Dictionary> = {
    [K in keyof Schema]: StandardSchemaV1.InferInput<Schema[K]>;
  };
  export type InferOutput<Schema extends StandardSchemaV1Dictionary> = {
    [K in keyof Schema]: StandardSchemaV1.InferOutput<Schema[K]>;
  };
}
