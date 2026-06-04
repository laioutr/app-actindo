import { type ActindoClient, createActindoClient } from './actindoClient';
import { useRuntimeConfig } from '#imports';
import type { H3Event } from 'h3';
import { APP_CONFIG_KEY } from '../const';

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
 * The connection (`apiKey`, optional `baseUrl`) is delivered through the
 * Laioutr project config: each `laioutrrc.json` app entry's `config` is
 * injected into `runtimeConfig[APP_CONFIG_KEY]` by frontend-core — the same
 * pattern every standalone connector app uses.
 *
 * @param event - the current H3 request event, so per-request runtime config
 *   overrides are respected. Omit only outside a request (e.g. on startup).
 */
export function useActindoClient(event?: H3Event): ActindoClient {
  const config = useRuntimeConfig(event)[APP_CONFIG_KEY] as ActindoRuntimeConfig | undefined;

  return createActindoClient({
    baseUrl: config?.baseUrl || DEFAULT_BASE_URL,
    apiKey: config?.apiKey ?? '',
  });
}
