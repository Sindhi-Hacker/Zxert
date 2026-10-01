const SENSITIVE = /^(authorization|api[-_]?key|x-api-key|token|secret|password)$/i;
export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SENSITIVE.test(k) ? '[REDACTED]' : redactSensitive(v)]));
  return value;
}
export function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  return message.replace(/(bearer\s+|sk-|key=)[A-Za-z0-9._-]+/gi, '$1[REDACTED]');
}
