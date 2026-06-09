/** Returns the current timestamp as an ISO-8601 string. */
export function nowIso(): string {
  return new Date().toISOString()
}

/** Formats an ISO timestamp into a short, human-readable representation. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
