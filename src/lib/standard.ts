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
