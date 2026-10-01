import type { AdapterContext, ProviderAdapter } from './providerAdapter';
import { getPath, joinUrl } from './providerAdapter';
import type { AIModel } from '@/types/provider';

export abstract class BaseAdapter implements ProviderAdapter {
  abstract buildRequest(context: AdapterContext, request: import('./providerAdapter').ChatRequest): {url:string;init:RequestInit};
  abstract parseResponse(value: unknown): string;
  abstract parseStreamEvent(value: unknown): import('@/types/chat').StreamEvent[];
  buildHeaders({provider,apiKey}:AdapterContext):Record<string,string>{
    const headers:Record<string,string>={'Content-Type':'application/json',Accept:'application/json',...provider.customHeaders};
    if(apiKey){if(provider.authStyle==='bearer')headers.Authorization=`Bearer ${apiKey}`; else if(provider.authStyle==='api-key')headers[provider.apiKeyHeader||'x-api-key']=apiKey;}
    if(provider.organization)headers['OpenAI-Organization']=provider.organization;
    if(provider.project)headers['OpenAI-Project']=provider.project; return headers;
  }
  async discoverModels(context:AdapterContext):Promise<AIModel[]>{
    const {provider}=context;if(!provider.endpoint.modelsPath)return [];
    const response=await fetch(joinUrl(provider.baseUrl,provider.endpoint.modelsPath),{headers:this.buildHeaders(context),signal:context.signal});
    if(!response.ok)throw new Error(`Model discovery failed (${response.status})`); const body=await response.json();
    const raw=getPath(body,provider.responseMapping?.modelsPath ?? 'data'); if(!Array.isArray(raw))throw new Error('Models response did not contain a model list');
    return raw.map((item:any):AIModel=>{const id=String(getPath(item,provider.responseMapping?.idPath ?? 'id') ?? '');return {id,providerId:provider.id,displayName:String(item?.display_name??item?.name??id),capabilities:provider.streaming?['text','streaming']:['text'],inputModalities:item?.input_modalities??['text'],outputModalities:item?.output_modalities??['text'],contextWindow:item?.context_window,custom:false,favorite:false};}).filter(m=>m.id);
  }
}
