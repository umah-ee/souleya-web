/**
 * Client-seitiger Helper zum Loggen von Aktivitaeten.
 * Sendet fire-and-forget an /api/auth/log-event.
 * Fehler blockieren nie den Auth-Flow.
 */
export async function logActivity(
  activityType: string,
  title: string,
  description?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_type: activityType,
        title,
        description,
        metadata: {
          ...metadata,
          user_agent:
            typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        },
      }),
    });
  } catch {
    // Silent – Logging darf nie den Auth-Flow blockieren
  }
}
