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
    // The Actindo connection (apiKey + localeMap) lives in `laioutrrc.json`
    // under the `@laioutr/app-actindo` app entry — same pattern as the other
    // standalone connector apps. frontend-core injects each app's `config`
    // into `runtimeConfig[<app name>]`, which the client factory reads.
    laioutrrc: laioutrrc as any,
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-09-11',
});
