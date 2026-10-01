import type { ChatMessage, GenerationOptions, StreamEvent } from '@/types/chat';
import type { AIModel, ProviderConfig } from '@/types/provider';
export interface AdapterContext { provider: ProviderConfig; apiKey: string | null; signal?: AbortSignal; }
export interface ChatRequest { model: string; messages: ChatMessage[]; options?: GenerationOptions; stream: boolean; }
export interface ProviderAdapter {
  buildHeaders(context: AdapterContext): Record<string,string>;
  buildRequest(context: AdapterContext, request: ChatRequest): {url:string; init:RequestInit};
  parseResponse(value: unknown): string;
  parseStreamEvent(value: unknown): StreamEvent[];
  discoverModels(context: AdapterContext): Promise<AIModel[]>;
}
export function joinUrl(base:string,path:string){return `${base.replace(/\/$/,'')}/${path.replace(/^\//,'')}`;}
export function getPath(value:unknown,path?:string):any { return path?.split('.').filter(Boolean).reduce((v:any,k)=>v?.[k],value) ?? value; }
