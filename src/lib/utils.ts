import type { StandardSchemaV1Dictionary } from "./standard";

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function ensureSchema<TSchemaDict extends StandardSchemaV1Dictionary>(
  schemaDict: TSchemaDict,
  key: keyof TSchemaDict & string,
) {
  const schema = schemaDict[key];
  if (!schema) throw new Error(`No schema found for key ${key}`);
  return schema;
}
