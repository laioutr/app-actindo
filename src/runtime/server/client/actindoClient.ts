import { ofetch } from 'ofetch';
import type { $Fetch, FetchOptions } from 'ofetch';

/**
 * Connection configuration for the Actindo Storefront Data Service.
 *
 * @see https://laioutr.actindo.com/docs#/
 */
export interface ActindoClientConfig {
  /**
   * Base URL of the Actindo Storefront Data Service, e.g.
   * `https://laioutr.actindo.com`.
   */
  baseUrl: string;
  /**
   * Per-tenant Bearer API key. Resolves server-side to exactly one Actindo
   * tenant. This is a secret and must never reach the client bundle.
   */
  apiKey: string;
  /**
   * Request timeout in milliseconds.
   *
   * @default 10000
   */
  timeout?: number;
}

/**
 * Result of a connectivity probe against the service.
 *
 * Discriminated on `ok` so callers can branch without optional chaining.
 */
export type ActindoHealthStatus = { ok: true; payload: unknown } | { ok: false; error: string };

/**
 * A configured, authenticated entry point to the Actindo Storefront Data
 * Service. Created once per request via {@link createActindoClient}.
 *
 * This is the foundational connectivity layer only — it carries auth and a
 * raw request escape hatch, but does not yet map any entities onto the
 * Laioutr canonical components.
 */
export interface ActindoClient {
  /**
   * The underlying `ofetch` instance with `baseURL` and the `Authorization`
   * header pre-applied. Use this (or {@link ActindoClient.request}) to build
   * entity-specific calls later.
   */
  readonly raw: $Fetch;
  /**
   * Low-level typed request against the service. Paths are resolved against
   * the configured `baseUrl`; the Bearer header is applied automatically.
   */
  request: <T = unknown>(path: string, options?: FetchOptions) => Promise<T>;
  /**
   * Probe service reachability and authentication via `GET /health`.
   *
   * Never throws: transport, auth (401) and HTTP errors are caught and
   * reported through {@link ActindoHealthStatus} so this can be used as a
   * safe connectivity smoke-test.
   */
  health: () => Promise<ActindoHealthStatus>;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Create an authenticated client for the Actindo Storefront Data Service.
 *
 * Pure and side-effect free: it only configures an `ofetch` instance, so it
 * is safe to unit-test in isolation (no Nitro / runtime-config dependency).
 * For use inside Orchestr handlers and server routes prefer the auto-imported
 * `useActindoClient(event)`, which wires this up from runtime config.
 *
 * @throws if `baseUrl` or `apiKey` is missing — failing loud here surfaces
 *   misconfiguration at the call site instead of as an opaque 401 later.
 */
export function createActindoClient(config: ActindoClientConfig): ActindoClient {
  if (!config.baseUrl) {
    throw new Error('[actindo] baseUrl is required to reach the Storefront Data Service.');
  }
  if (!config.apiKey) {
    throw new Error('[actindo] apiKey is required — set the per-tenant Bearer key in the `@laioutr/app-actindo` app config (laioutrrc.json → apps).');
  }

  const raw = ofetch.create({
    baseURL: config.baseUrl,
    timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  const request = <T = unknown>(path: string, options?: FetchOptions): Promise<T> => raw<T>(path, options) as Promise<T>;

  const health = async (): Promise<ActindoHealthStatus> => {
    try {
      const payload = await raw('/health', { method: 'GET' });
      return { ok: true, payload };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  return { raw, request, health };
}
