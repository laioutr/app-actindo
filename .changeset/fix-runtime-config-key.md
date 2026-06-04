---
'@laioutr/app-actindo': patch
---

Fix runtime-config namespace mismatch introduced by the scoped package rename. The client factory, orchestr middleware and the `RuntimeConfig` type augmentation now read the scoped `@laioutr/app-actindo` key (matching the module `configKey`) instead of the unscoped `app-actindo`. A platform host configuring the connector under the module's config key previously received an empty `apiKey`. The namespace is centralized as `APP_CONFIG_KEY` in `server/const`.
