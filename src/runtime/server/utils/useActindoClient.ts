import { type ActindoClient, createActindoClient } from './actindoClient';
import { useRuntimeConfig } from '#imports';
import type { H3Event } from 'h3';

/**
 * Runtime-config slice this module owns. The key mirrors the module
 * `configKey` (the package name). Kept local so this runtime util does not
 * have to import the build-time module definition.
 */
interface ActindoRuntimeConfig {
  baseUrl: string;
  apiKey: string;
}

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
  const config = useRuntimeConfig(event)['my-laioutr-app'] as ActindoRuntimeConfig;
  const apiKey = config.apiKey || process.env.ACTINDO_API_KEY || '';

  return createActindoClient({
    baseUrl: config.baseUrl,
    apiKey,
  });
}
