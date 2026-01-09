import { z } from "zod";

const envSchema = z.object({
  API_PORT: z.coerce.number().optional(),
  API_PREFIX: z.string().optional(),
});

export type ApiEnv = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): ApiEnv {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(`API env validation failed: ${issues}`);
  }
  return parsed.data;
}
