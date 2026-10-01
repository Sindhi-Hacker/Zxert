# Zxert

Zxert is a provider-neutral AI chat client for iOS, Android, and web. It connects directly to user-configured OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, and configurable JSON endpoints. The interface is a modern, dark-first design system ("Acid Botanical") built with NativeWind — layered green-tinted graphite surfaces, an electric lime accent, Space Grotesk display type, aurora glows, and Reanimated micro-interactions, with automatic light/dark theming.

## Design system

- `global.css` — the token source of truth: semantic CSS variables for both themes (`:root` light, `.dark` dark)
- `tailwind.config.js` — maps semantic utilities (`bg-canvas`, `text-ink`, `bg-accent-soft`, `shadow-card`, `font-display`, …) onto those variables
- `src/theme/tokens.ts` — JS-side mirror for the few places that need raw values (Markdown styles, Switch colors)
- `src/components/ui/` — reusable primitives: Button, IconButton, Card, NavRow/ToggleRow, SegmentedControl, TextField, Screen, Glow, EmptyState, TabBar, Press
- `src/components/chat/` — Composer, MessageItem, TypingDots
- Dark mode is driven by a single `dark` class on the root view (`AppProviders`); every `dark:` variant and `.dark` variable override cascades from it
- `tests/ui.test.tsx` renders real components through the production Tailwind config so a broken NativeWind pipeline fails CI instead of shipping an unstyled app

## Included foundation

- Real provider configuration, secure native credential storage, connection diagnostics, and model discovery
- Extensible typed adapter boundary with OpenAI, Responses, Anthropic, and generic adapters
- Buffered SSE parsing, cancellation, usage/reasoning/tool event normalization, and persisted generation state
- Model search, provider filters, discovery refresh, manual model IDs, capability metadata, and selection
- Local SQLite conversations/messages/drafts with WAL and indexed pagination
- Markdown responses, collapsible reasoning, copy action, stop generation, intelligent auto-scroll, and keyboard-aware composer
- Onboarding, chat, library, providers, model picker, appearance, settings, diagnostics surfaces
- Centralized theme tokens, NativeWind-styled UI, floating tab bar, aurora empty states, haptic feedback, accessibility labels, minimum touch targets, responsive maximum widths, and safe areas
- Runtime Zod validation and privacy-safe error/redaction utilities

No API key, provider, model list, response, or stream is bundled or simulated in production paths.

## Requirements

- Node.js 20 or newer
- Xcode 16+ for iOS builds, or Android Studio with a current Android SDK
- A user-managed provider endpoint and credentials

## Setup

```bash
npm install
npm start
```

Then press `i`, `a`, or `w` for iOS, Android, or web. For native release projects:

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

The web target keeps credentials only for the current browser session. Native builds use `expo-secure-store` with device-only Keychain/Keystore access.

## Quality commands

```bash
npm run typecheck
npm test
npm run lint
npm run validate
```

## Project map

- `app/` — Expo Router routes and navigation flows
- `src/adapters/` — protocol request builders, parsers, discovery normalization
- `src/features/` — feature orchestration hooks
- `src/services/` — chat engine, secure credentials, provider diagnostics
- `src/repositories/` — persistence access boundaries
- `src/database/` — SQLite schema/bootstrap
- `src/components/` — reusable flat UI and chat components
- `src/store/` — Zustand application state
- `src/theme/` — centralized design tokens
- `src/types/`, `src/models/` — normalized domain types and Zod schemas
- `tests/` — unit and integration-ready tests
- `docs/` — architecture and adapter extension guides

Read [Architecture](docs/ARCHITECTURE.md), [Adapter Guide](docs/ADAPTERS.md), and [E2E Strategy](docs/E2E.md).

## Environment and release configuration

`EXPO_PUBLIC_APP_ENV` may be set to `development`, `staging`, or `production`. Do not place provider keys in `.env`; keys belong in the in-app secure vault. Use EAS environment variables only for non-user, build-time service configuration. Platform IDs and app metadata live in `app.json`.

## Security notes

- Credentials are never stored in Zustand, SQLite, AsyncStorage, exports, or provider records.
- Error text is scrubbed before display and sensitive headers are never logged.
- Remote provider URLs require HTTPS; localhost HTTP is permitted for development.
- Exports should omit secrets by default. Any future secret export must require explicit confirmation and encryption.

## CI baseline

A CI job should run `npm ci`, `npm run typecheck`, `npm test`, and `npx expo export --platform web`. Release pipelines should additionally build both native platforms and run the critical E2E journeys on physical-device-class simulators.
