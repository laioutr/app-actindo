import { defineOrchestr, useRuntimeConfig } from '#imports';
import { useActindoClient } from '../client/useActindoClient';

/**
 * Orchestr middleware for the Actindo connector. Builds the request-scoped
 * Actindo client once and exposes it as `context.client` to every handler, so
 * individual handlers don't each wire up `useActindoClient(event)`.
 *
 * Locale and currency stay on `clientEnv` (provided per request by Orchestr)
 * and are read directly in the handlers that forward them to the service.
 */
export const defineActindo = defineOrchestr
  .meta({
    app: 'actindo',
    label: 'Actindo',
  })
  .extendRequest(async ({ event, clientEnv }) => {
    // Map the storefront locale to the tenant's locale dialect (e.g. de → de-DE);
    // the service does not fall back from a bare language tag for slug lookups.
    const localeMap = useRuntimeConfig(event)['app-actindo'].localeMap as Record<string, string> | undefined;
    const locale = localeMap?.[clientEnv.locale] ?? clientEnv.locale;

    return {
      context: {
        client: useActindoClient(event),
        locale,
        currency: clientEnv.currency,
      },
    };
  });

export const defineActindoQuery = defineActindo.queryHandler;
export const defineActindoLink = defineActindo.linkHandler;
export const defineActindoComponentResolver = defineActindo.componentResolver;
export const defineActindoQueryTemplateProvider = defineActindo.queryTemplateProvider;
