# End-to-end test strategy

Use Maestro for black-box native journeys and a disposable local HTTPS fixture server implementing each protocol. The fixture belongs to the test environment only and must never be reachable from production code.

## Critical journeys

1. Fresh install, onboarding, provider validation, secure-key save, connection test, and model discovery.
2. Manual model creation when discovery is unavailable.
3. Send a multimessage conversation, receive fragmented SSE, background/foreground the app, stop generation, retry, and restore the conversation after restart.
4. Long conversation auto-scroll: generation follows at the bottom, pauses when the user scrolls up, and resumes only after “jump to latest.”
5. Composer behavior on small Android, notched iPhone, tablet split view, hardware keyboard, and large dynamic type.
6. Invalid key, rate limit, timeout, malformed JSON, dropped stream, unsupported model, and offline recovery.
7. Theme follows system and explicit light/dark choice persists.
8. Delete a provider and confirm credentials and cached models are removed without deleting unrelated conversations.
9. Screen-reader traversal, labels, focus order, and 44-point touch targets.

Run protocol parser fault cases as fast unit tests; reserve native E2E for platform integration. Production provider accounts should not be used in CI.
