/**
 * True when an error thrown by the client is the service's `404` (unknown
 * slug/id). Lets single-entity query handlers translate a missing resource
 * into an empty result instead of a 500.
 */
export function isActindoNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { statusCode?: number; status?: number; response?: { status?: number } };
  return candidate.statusCode === 404 || candidate.status === 404 || candidate.response?.status === 404;
}
