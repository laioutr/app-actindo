---
'@laioutr/app-actindo': patch
---

Fix and align the connector's configuration handling.

- **Runtime-config key:** the client factory, orchestr middleware and the `RuntimeConfig` type augmentation now read the scoped `@laioutr/app-actindo` key (matching the module `configKey`) instead of the unscoped `app-actindo`. A platform host configuring under the module's config key previously received an empty `apiKey`. The namespace is centralized as `APP_CONFIG_KEY` in `server/const`.
- **Credential delivery:** the connection (`apiKey`, optional `baseUrl`, `localeMap`) is now sourced solely from the Laioutr project config (`laioutrrc.json` → `apps[].config` → `runtimeConfig[configKey]`), matching every other standalone connector app. Dropped the bespoke `.env` / `ACTINDO_API_KEY` env-fallback path.
