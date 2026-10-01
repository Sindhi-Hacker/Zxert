# Architecture

Zxert uses Expo Router for deep-link-safe navigation, Zustand for local UI/application state, TanStack Query for cacheable server operations, SQLite for conversations/messages/drafts, AsyncStorage for non-sensitive configuration, and SecureStore for provider credentials.

## Data flow

`Screen -> feature hook -> service/adapter -> repository -> SQLite or secure storage`

External provider formats terminate at the adapter boundary. UI code consumes only normalized `AIModel`, `ChatMessage`, `ContentBlock`, and `StreamEvent` structures.

## Privacy boundaries

Provider configuration and credentials are separate records. Native credentials use iOS Keychain and Android Keystore-backed SecureStore. Web credentials are session-only because browsers do not offer an equivalent non-exportable application vault. Logs must pass through redaction and must never include prompts, attachment data, authorization headers, or API keys.

## Persistence

SQLite runs in WAL mode with indexed message pagination. Repository interfaces keep SQL outside screen and feature code. Model/provider configuration is schema-validated on read and write. Database migrations should be additive and transactional.

## Streaming

The engine handles SSE frames incrementally, preserves incomplete chunks, maps provider events, and responds to AbortSignal cancellation. The chat hook saves an in-progress assistant record and marks interrupted requests as cancelled/failed.

## Production follow-up

Before shipping, configure EAS credentials, platform privacy manifests, an application-specific network security policy, error monitoring with the redaction boundary, and device-level E2E tests. Test provider behavior against the exact services your organization supports; compatible APIs vary in edge cases.
