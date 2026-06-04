import { SuggestedSearchSearchQuery } from '@laioutr-core/canonical-types/suggested-search';
import { SUGGESTED_SEARCH_ID_PREFIX, SUGGESTED_SEARCH_LIMIT } from '../../const';
import { suggestedSearchEntriesToken } from '../../const/passthroughTokens';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { generateSuggestedSearchEntries } from '../../orchestr-helper/generateSuggestedSearchEntries';
import { getProductsBatch, searchProducts } from '../../queries/product';

/**
 * Header autocomplete. Runs the term through `/v1/products/search`, hydrates the
 * top hits (Actindo search returns ids only), and forwards the built entries to
 * the entries link + resolver via passthrough. Returns the (stateless)
 * `SuggestedSearch` id; the term is encoded into it for the base resolver.
 */
export default defineActindoQuery(SuggestedSearchSearchQuery, async ({ input, context, passthrough }) => {
  const id = `${SUGGESTED_SEARCH_ID_PREFIX}${input.query ?? ''}`;
  const term = input.query?.trim();

  if (!term) {
    passthrough.set(suggestedSearchEntriesToken, []);
    return { id };
  }

  const { ids } = await searchProducts(context.client, {
    q: term,
    limit: SUGGESTED_SEARCH_LIMIT,
    locale: context.locale,
    currency: context.currency,
  });

  const products = ids.length
    ? (
        await getProductsBatch(context.client, ids, {
          locale: context.locale,
          currency: context.currency,
          components: ['base', 'info', 'media'],
        })
      ).items
    : [];

  passthrough.set(suggestedSearchEntriesToken, generateSuggestedSearchEntries(term, products));

  return { id };
});
