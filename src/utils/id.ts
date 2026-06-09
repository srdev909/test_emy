/**
 * Generates a unique identifier. Uses `crypto.randomUUID()` when available
 * (all modern browsers and Node 19+), otherwise falls back to a sufficiently
 * unique time + random combination.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
