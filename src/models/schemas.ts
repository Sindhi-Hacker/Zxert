import { z } from 'zod';

export const providerSchema = z.object({
  id: z.string().min(1), name: z.string().trim().min(1).max(80),
  baseUrl: z.string().url().refine(v => /^https:\/\//.test(v) || /^http:\/\/(localhost|127\.0\.0\.1)/.test(v), 'Use HTTPS for remote providers'),
  adapter: z.enum(['openai-chat','openai-responses','anthropic','generic']), enabled: z.boolean(),
  order: z.number().int().nonnegative(), authStyle: z.enum(['bearer','api-key','query','none']),
  apiKeyHeader: z.string().max(80).optional(), organization: z.string().max(200).optional(), project: z.string().max(200).optional(),
  customHeaders: z.record(z.string(), z.string()),
  endpoint: z.object({ chatPath: z.string().min(1), modelsPath: z.string().optional(), method: z.enum(['POST','PUT','PATCH']) }),
  responseMapping: z.object({ contentPath: z.string().optional(), modelsPath: z.string().optional(), errorPath: z.string().optional(), idPath: z.string().optional() }).optional(),
  timeoutMs: z.number().int().min(1000).max(300000), streaming: z.boolean(), allowInsecureHttp: z.boolean(),
  createdAt: z.number(), updatedAt: z.number(),
}).passthrough();

export const modelSchema = z.object({
  id: z.string().min(1), providerId: z.string().min(1), displayName: z.string().min(1), contextWindow: z.number().positive().optional(),
  capabilities: z.array(z.enum(['text','vision','image-generation','audio','reasoning','tools','json','streaming'])).default(['text']),
  inputModalities: z.array(z.string()).default(['text']), outputModalities: z.array(z.string()).default(['text']),
  custom: z.boolean(), favorite: z.boolean(), pricing: z.object({ inputPerMillion: z.number().nonnegative().optional(), outputPerMillion: z.number().nonnegative().optional(), currency: z.string().optional() }).optional(),
  parameters: z.record(z.string(), z.unknown()).optional(), lastUsedAt: z.number().optional(),
}).passthrough();

export type ProviderInput = z.input<typeof providerSchema>;
