import type { AdapterKind } from '@/types/provider';
import type { ProviderAdapter } from './providerAdapter';
import { OpenAIChatAdapter, OpenAIResponsesAdapter } from './openai';
import { AnthropicAdapter } from './anthropic';
import { GenericAdapter } from './generic';
const adapters:Record<AdapterKind,ProviderAdapter>={
  'openai-chat':new OpenAIChatAdapter(),'openai-responses':new OpenAIResponsesAdapter(),anthropic:new AnthropicAdapter(),generic:new GenericAdapter(),
};
export function getAdapter(kind:AdapterKind):ProviderAdapter{return adapters[kind];}
