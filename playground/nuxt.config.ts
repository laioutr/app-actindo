import laioutrrc from '../laioutrrc.json';
import srcModule from '../src/module';

// Keep the fetched project secret key so the Studio preview handshake validates.
// (The scaffold disabled it with `= false`, which made the preview SSR throw
// `Invalid secret` mid-stream → "Cannot set headers after they are sent".)

export default defineNuxtConfig({
  modules: [
    srcModule,
    '@pinia/nuxt', // Added to show in devtools
    '@laioutr-core/frontend-core',
    '@laioutr-core/orchestr-devtools',
  ],
  laioutr: {
    laioutrrc: laioutrrc as any,
  },
  // Private (server-only) runtime config for the Actindo connector. The
  // per-tenant Bearer key lives here instead of a local .env file.
  runtimeConfig: {
    'app-actindo': {
      apiKey: 'robert-ley-staging-demo-key',
      // The storefront language is `de`, but the Actindo tenant keys its catalog
      // under `de-DE` (and does not fall back) — map it so slugs resolve.
      localeMap: { de: 'de-DE' },
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-09-11',
});
