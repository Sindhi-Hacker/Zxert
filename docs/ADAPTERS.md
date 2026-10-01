# Provider adapter guide

Adapters translate the normalized Zxert message model to an external protocol. They implement `ProviderAdapter` in `src/adapters/providerAdapter.ts` and are registered by protocol key in `src/adapters/registry.ts`.

## Adding a protocol

1. Add a stable adapter key to `AdapterKind`.
2. Extend `BaseAdapter` and implement `buildRequest`, `parseResponse`, and `parseStreamEvent`.
3. Normalize all stream output to `StreamEvent`; never pass provider payloads directly into UI state.
4. Normalize discovery responses to `AIModel`. Return an empty list when discovery is unsupported.
5. Add parser and request-shape tests. Include fragmented frames, errors, usage, tool deltas, and completion events.
6. Register the implementation and add it to the provider format selector.

Secrets are supplied through `AdapterContext` only at request time. Never retain the context, serialize headers, or include raw response/request bodies in production diagnostics.

## Generic JSON format

The generic adapter supports custom endpoint paths, methods, custom headers, auth style, response content paths, and model list/id paths. The persisted provider record excludes its credential. The secure credential vault is keyed by provider ID.

## Example configuration

```json
{
  "name": "Internal gateway",
  "baseUrl": "https://gateway.example.com",
  "adapter": "openai-chat",
  "authStyle": "bearer",
  "endpoint": {
    "method": "POST",
    "chatPath": "/v1/chat/completions",
    "modelsPath": "/v1/models"
  },
  "streaming": true,
  "timeoutMs": 60000
}
```

The API key is intentionally absent and must be entered on-device.
