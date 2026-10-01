import { getAdapter } from '@/adapters/registry';import { GenericAdapter } from '@/adapters/generic';import { SSEParser } from '@/adapters/streamParser';import type { ChatMessage,GenerationOptions,StreamEvent } from '@/types/chat';import type { ProviderConfig } from '@/types/provider';import { secureCredentials } from './secureCredentials';import { safeError } from '@/utils/redact';
export async function* generate(provider:ProviderConfig,model:string,messages:ChatMessage[],options:GenerationOptions={},signal?:AbortSignal):AsyncGenerator<StreamEvent>{
 const apiKey=await secureCredentials.get(provider.id);let adapter=getAdapter(provider.adapter);if(adapter instanceof GenericAdapter)adapter=adapter.configure({provider,apiKey,signal});
 const stream=provider.streaming;const req=adapter.buildRequest({provider,apiKey,signal},{model,messages,options,stream});let response:Response;
 try{response=await fetch(req.url,req.init);}catch(e){throw new Error(signal?.aborted?'Generation stopped':safeError(e));}
 if(!response.ok){let message=`Provider request failed (${response.status})`;try{const body=await response.json() as any;message=body?.error?.message??body?.message??message;}catch{}throw new Error(safeError(message));}
 if(!stream){const body=await response.json();yield {type:'text-delta',text:adapter.parseResponse(body)};yield{type:'done'};return;}
 if(!response.body){throw new Error('Streaming is unavailable in this network environment');}
 const parser=new SSEParser(v=>adapter.parseStreamEvent(v));const reader=response.body.getReader();const decoder=new TextDecoder();
 try{while(true){const {done,value}=await reader.read();if(done)break;for(const event of parser.push(decoder.decode(value,{stream:true})))yield event;}for(const event of parser.flush())yield event;}finally{if(signal?.aborted)await reader.cancel().catch(()=>{});reader.releaseLock();}
}
