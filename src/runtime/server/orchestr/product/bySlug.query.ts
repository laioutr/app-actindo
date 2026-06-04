import { ProductBySlugQuery } from '@laioutr-core/canonical-types/ecommerce';
import { isActindoNotFound } from '../../actindo-helper/errors';
import { productsFragmentToken } from '../../const/passthroughTokens';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { getProductBySlug } from '../../queries/product';

/**
 * Product detail page: slug → opaque product id.
 *
 * Fetches the product with `expand` and forwards it to the `Product` resolver
 * via passthrough, so the PDP hydrates without a second batch round-trip. An
 * unknown slug yields an empty result so the frontend can render a 404.
 */
export default defineActindoQuery(ProductBySlugQuery, async ({ input, context, passthrough }) => {
  try {
    const { id, product } = await getProductBySlug(context.client, input.slug, {
      locale: context.locale,
      currency: context.currency,
      expand: true,
    });

    if (product) {
      passthrough.set(productsFragmentToken, [product]);
    }

    return { id };
  } catch (error) {
    if (isActindoNotFound(error)) return {};
    throw error;
  }
});
