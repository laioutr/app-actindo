# Actindo App for Laioutr

[![Laioutr][laioutr-src]][laioutr-href]
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A [Laioutr](https://laioutr.com) App that integrates the **Actindo** Order Management System into the Laioutr platform.

The app connects a Laioutr storefront to Actindo as its commerce data source — products, variants, categories, navigation and availability — through the **Actindo Storefront Data Service**, a read-only web service provided by Actindo. The API is documented at [laioutr.actindo.com/docs](https://laioutr.actindo.com/docs#/).

See [laioutr.com](https://laioutr.com) for more information about Laioutr.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## How it works

The Actindo Storefront Data Service is a **layout-facing read API** whose field shapes mirror the Laioutr canonical components, so its responses map cleanly onto the storefront. This app wraps that service and exposes its data to the storefront through [Orchestr](https://docs.laioutr.io) query handlers.

- **Authentication** — the service uses a per-tenant Bearer API key (`bearerAuth`) that resolves server-side to exactly one Actindo tenant.
- **Direction** — read-only. The app consumes Actindo data for rendering; it does not write back to Actindo.
- **Mapping** — response shapes follow the canonical layout components, minimizing transformation between Actindo and the storefront.

### Data the service provides

| Resource | Operations |
| --- | --- |
| **Products** | by slug, search (with filters & facets), batch fetch by IDs, breadcrumb |
| **Variants** | per-product variant IDs, batch fetch variants |
| **Availability** | batch availability check for multiple items |
| **Categories** | by slug, list all IDs, batch fetch, products within a category |
| **Navigation** | navigation tree by alias |
| **Health** | service health check |

## Features

- 🛒 &nbsp;Actindo as the storefront commerce data source
- 🔎 &nbsp;Product & category search with filters and facets
- 🧬 &nbsp;Variant and availability resolution
- 🧭 &nbsp;Category-driven navigation trees
- 🔌 &nbsp;Canonical-aligned responses, wired in via Orchestr handlers

## Quick Setup

Before installing dependencies, you need to create a copy of the `.npmrc.config` file called `.npmrc` and fill in the `NPM_LAIOUTR_TOKEN` with your npm token. You can find this token in your [project settings](https://cockpit.laioutr.cloud/o/_/p/_/settings).

- `pnpm i`
- `npx @laioutr/cli project fetch-rc -p <organization slug>/<project slug> -s <project secret key>` - This will load the `laioutrrc.json` file with the current remote project configuration.
- `pnpm dev:prepare`
- `pnpm orchestr-dev`

You also need to configure the Actindo connection. The Storefront Data Service expects a per-tenant Bearer API key; provide it through the module's runtime config so it is only available server-side and never exposed to the client.

That's it! You can now use the Actindo App in your [Laioutr Frontend](https://laioutr.com) ✨

You can find a thorough guide on getting started with Laioutr development in our [developer guide](https://docs.laioutr.io/developer-guide/setup).

## Linting and Formatting

We use ESLint and Prettier to lint and format the code. This repository contains opinionated configurations for both tools. You can - of course - replace them with your own configurations.

## Publishing

To publish a new version, run `pnpm release`. This will:

- Run the tests
- Update the changelog
- Publish the package to npmjs.org
- Push the changes to the repository

### Private publishing

If you want to publish a private package to npm.laioutr.cloud, you need to:

1. Make sure you have a `.npmrc` with your private npm registry token.
2. Add this line to the root of the `package.json` file: `"publishConfig": { "registry": "https://npm.laioutr.cloud/" }`
3. Make sure your package-name follows the `@laioutr-org/<organization-slug>_<package-name>` format.

After that you can run `pnpm release` to publish the package to npm.laioutr.cloud.

## Contribution

Follow the [setup guide](https://docs.laioutr.io/developer-guide/setup) to get started.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/my-laioutr-app/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/my-laioutr-app
[npm-downloads-src]: https://img.shields.io/npm/dm/my-laioutr-app.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/my-laioutr-app
[license-src]: https://img.shields.io/npm/l/my-laioutr-app.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/my-laioutr-app
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
[laioutr-src]: https://img.shields.io/badge/%F0%9F%A6%99_Laioutr_App-702DCE
[laioutr-href]: https://www.laioutr.com/
