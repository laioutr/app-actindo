import { type ActindoClient, createActindoClient } from './actindoClient';
import { useRuntimeConfig } from '#imports';
import type { H3Event } from 'h3';

/**
 * Runtime-config slice this module owns. The key mirrors the module
 * `configKey` (the package name). Kept local so this runtime util does not
 * have to import the build-time module definition.
 */
interface ActindoRuntimeConfig {
  baseUrl?: string;
  apiKey?: string;
}

/** Default service base URL; matches the module's `baseUrl` default. */
const DEFAULT_BASE_URL = 'https://laioutr.actindo.com';

/**
 * Build an authenticated {@link ActindoClient} from the server runtime
 * config. Auto-imported in Nitro (server routes, Orchestr handlers).
 *
 * The API key is read from private runtime config, with an `ACTINDO_API_KEY`
 * env fallback so the secret can be injected per deployment without rebuilding
 * (the hyphenated module config key does not map cleanly to a `NUXT_*` env
 * var, so we resolve the secret explicitly here).
 *
 * @param event - the current H3 request event, so per-request runtime config
 *   overrides are respected. Omit only outside a request (e.g. on startup).
 */
export function useActindoClient(event?: H3Event): ActindoClient {
  const config = useRuntimeConfig(event)['app-actindo'] as ActindoRuntimeConfig | undefined;
  // Both fall back to env then a sane default, so the client works even when the
  // consuming app overrides the runtime-config key without re-stating every field.
  const baseUrl = config?.baseUrl || process.env.ACTINDO_BASE_URL || DEFAULT_BASE_URL;
  const apiKey = config?.apiKey || process.env.ACTINDO_API_KEY || '';

  return createActindoClient({ baseUrl, apiKey });
}
