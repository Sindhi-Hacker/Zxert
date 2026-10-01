import { BaseAdapter } from './base';import { getPath,joinUrl,type AdapterContext,type ChatRequest } from './providerAdapter';import type { StreamEvent } from '@/types/chat';
export class GenericAdapter extends BaseAdapter{
 constructor(private readonly mapping?:AdapterContext['provider']['responseMapping']){super();}
 buildRequest(c:AdapterContext,r:ChatRequest){const body={model:r.model,messages:r.messages.map(m=>({role:m.role,content:m.blocks.filter(b=>b.type==='text').map(b=>b.text).join('\n')})),stream:r.stream,...r.options?.custom};return{url:joinUrl(c.provider.baseUrl,c.provider.endpoint.chatPath),init:{method:c.provider.endpoint.method,headers:this.buildHeaders(c),signal:c.signal,body:JSON.stringify(body)}};}
 parseResponse(v:unknown){const value=getPath(v,this.mapping?.contentPath);if(typeof value!=='string')throw new Error('Configured response path did not resolve to text');return value;}
 parseStreamEvent(v:any):StreamEvent[]{const text=getPath(v,this.mapping?.contentPath);return typeof text==='string'?[{type:'text-delta',text}]:[];}
 configure(c:AdapterContext){return new GenericAdapter(c.provider.responseMapping);}
}
