export type AdapterKind = 'openai-chat' | 'openai-responses' | 'anthropic' | 'generic';
export type AuthStyle = 'bearer' | 'api-key' | 'query' | 'none';

export interface ProviderEndpoint {
  chatPath: string;
  modelsPath?: string;
  method: 'POST' | 'PUT' | 'PATCH';
}
export interface ResponseMapping {
  contentPath?: string;
  modelsPath?: string;
  errorPath?: string;
  idPath?: string;
}
export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  adapter: AdapterKind;
  enabled: boolean;
  order: number;
  authStyle: AuthStyle;
  apiKeyHeader?: string;
  organization?: string;
  project?: string;
  customHeaders: Record<string, string>;
  endpoint: ProviderEndpoint;
  responseMapping?: ResponseMapping;
  timeoutMs: number;
  streaming: boolean;
  allowInsecureHttp: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ModelCapability = 'text' | 'vision' | 'image-generation' | 'audio' | 'reasoning' | 'tools' | 'json' | 'streaming';
export interface AIModel {
  id: string;
  providerId: string;
  displayName: string;
  contextWindow?: number;
  capabilities: ModelCapability[];
  inputModalities: string[];
  outputModalities: string[];
  custom: boolean;
  favorite: boolean;
  pricing?: { inputPerMillion?: number; outputPerMillion?: number; currency?: string };
  parameters?: Record<string, unknown>;
  lastUsedAt?: number;
}
