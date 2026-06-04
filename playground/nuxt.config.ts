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
  // The platform supplies the key (module option / `ACTINDO_API_KEY`); the client
  // factory resolves it from runtime config with an env fallback.
  runtimeConfig: {
    'app-actindo': {
      apiKey: import.meta.env.ACTINDO_API_KEY,
      // The storefront language is `de`, but the Actindo tenant keys its catalog
      // under `de-DE` (and does not fall back) — map it so slugs resolve.
      localeMap: { de: 'de-DE' },
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-09-11',
});
