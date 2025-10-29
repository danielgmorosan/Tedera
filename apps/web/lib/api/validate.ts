import { ZodSchema } from "zod";

export function parseBody<T>(schema: ZodSchema<T>, raw: unknown): T {
  return schema.parse(raw);
}
