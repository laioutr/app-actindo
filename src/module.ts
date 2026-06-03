/* eslint-disable @typescript-eslint/no-empty-object-type */
import { addServerImportsDir, createResolver, defineNuxtModule, installModule } from '@nuxt/kit';
import { defu } from 'defu';
import { registerLaioutrApp } from '@laioutr-core/kit';
import { name, version } from '../package.json';

/**
 * The options the module adds to the nuxt.config.ts.
 */
export interface ModuleOptions {
  /**
   * Base URL of the Actindo Storefront Data Service.
   *
   * @default 'https://laioutr.actindo.com'
   * @see https://laioutr.actindo.com/docs#/
   */
  baseUrl: string;
  /**
   * Per-tenant Bearer API key for the Actindo Storefront Data Service.
   *
   * Resolves server-side to exactly one Actindo tenant. This is a secret: it
   * lives in the private runtime config only and is never exposed to the
   * client. Prefer injecting it via the `ACTINDO_API_KEY` env var rather than
   * committing it to `nuxt.config`.
   *
   * @default '' (must be provided before the client can connect)
   */
  apiKey: string;
}

/**
 * The config the module adds to nuxt.runtimeConfig.public['my-laioutr-app'].
 *
 * Intentionally empty — this app holds no client-exposed config. The Actindo
 * connection (incl. the API key) is server-only.
 */
export interface RuntimeConfigModulePublic {}

/**
 * The config the module adds to nuxt.runtimeConfig['my-laioutr-app']
 */
export interface RuntimeConfigModulePrivate extends ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: name, // configKey must match package name
  },
  // Default configuration options of the Nuxt module
  defaults: {
    baseUrl: 'https://laioutr.actindo.com',
    apiKey: '',
  },
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path);

    nuxt.options.build.transpile.push(resolve('./runtime'));

    // Private runtime config: holds the Actindo connection incl. the secret
    // API key. Server-only — never merged into the public config below.
    nuxt.options.runtimeConfig[name] = defu(nuxt.options.runtimeConfig[name] as Parameters<typeof defu>[0], _options);
    // Public runtime config: deliberately carries no module options so the
    // API key cannot leak into the client bundle.
    nuxt.options.runtimeConfig.public[name] = defu(nuxt.options.runtimeConfig.public[name] as Parameters<typeof defu>[0], {});

    // Expose the server-side Actindo client (`useActindoClient`) as a Nitro
    // auto-import for use in server routes and Orchestr handlers.
    addServerImportsDir(resolveRuntimeModule('server/utils'));

    await registerLaioutrApp({
      name,
      version,
      orchestrDirs: [resolveRuntimeModule('server/orchestr')],
      sections: [resolveRuntimeModule('app/sections')],
      blocks: [resolveRuntimeModule('app/blocks')],
    });

    // Install peer-dependency modules only on prepare-step.
    // This makes auto-imports and import-aliases work. Remove any modules you might not need.
    if (nuxt.options._prepare) {
      await installModule('@nuxt/image');
      await installModule('@laioutr-core/frontend-core');
      await installModule('@laioutr-core/orchestr');
      await installModule('@laioutr-app/ui');
    }

    // Shared
    // Imports and other stuff which is shared between client and server

    // Client
    // Add plugins, composables, etc.

    // Server
    // Add server-only imports, etc.
  },
});
