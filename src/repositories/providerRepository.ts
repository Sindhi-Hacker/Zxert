import AsyncStorage from '@react-native-async-storage/async-storage';
import { providerSchema, modelSchema } from '@/models/schemas';
import type { AIModel, ProviderConfig } from '@/types/provider';
import { secureCredentials } from '@/services/secureCredentials';

const PROVIDERS = 'zxert.providers.v1'; const MODELS = 'zxert.models.v1';
async function parseList<T>(key: string, parser: (v: unknown) => T): Promise<T[]> {
  try { const raw = JSON.parse((await AsyncStorage.getItem(key)) ?? '[]'); return Array.isArray(raw) ? raw.map(parser) : []; } catch { return []; }
}
export const providerRepository = {
  list: () => parseList(PROVIDERS, v => providerSchema.parse(v) as ProviderConfig),
  async save(provider: ProviderConfig, apiKey?: string) {
    const list = await this.list(); const next = [...list.filter(p => p.id !== provider.id), provider].sort((a,b) => a.order-b.order);
    await AsyncStorage.setItem(PROVIDERS, JSON.stringify(next)); if (apiKey !== undefined) await secureCredentials.set(provider.id, apiKey);
  },
  async remove(id: string) { const list = await this.list(); await AsyncStorage.setItem(PROVIDERS, JSON.stringify(list.filter(p => p.id !== id))); await secureCredentials.remove(id); const models = await this.listModels(); await AsyncStorage.setItem(MODELS, JSON.stringify(models.filter(m => m.providerId !== id))); },
  listModels: () => parseList(MODELS, v => modelSchema.parse(v) as AIModel),
  async saveModels(providerId: string, models: AIModel[]) { const all = await this.listModels(); const custom = all.filter(m => m.providerId !== providerId || m.custom); const merged = [...custom, ...models.filter(m => !m.custom)]; await AsyncStorage.setItem(MODELS, JSON.stringify(merged)); },
  async saveModel(model: AIModel) { const all = await this.listModels(); await AsyncStorage.setItem(MODELS, JSON.stringify([...all.filter(m => !(m.providerId===model.providerId && m.id===model.id)), model])); },
};
