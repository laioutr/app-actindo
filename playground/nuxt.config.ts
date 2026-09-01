import laioutrrc from '../laioutrrc.json';
import srcModule from '../src/module';

// Keep the fetched project secret key so the Studio preview handshake validates.
// (The scaffold disabled it with `= false`, which made the preview SSR throw
// `Invalid secret` mid-stream → "Cannot set headers after they are sent".)

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt', // Added to show in devtools
    // frontend-core must set up before this app: it copies each `laioutrrc.json`
    // app entry's `config` onto `nuxt.options[<app name>]`, and this module reads
    // that key into its runtime config during its own setup. Listed first, the
    // app would read the key before frontend-core writes it and come up with an
    // empty `apiKey`.
    '@laioutr-core/frontend-core',
    srcModule,
    '@laioutr-core/devtools',
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
