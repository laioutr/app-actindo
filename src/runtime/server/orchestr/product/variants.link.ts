import { ProductVariantsLink } from '@laioutr-core/canonical-types/ecommerce';
import { defineActindoLink } from '../../middleware/defineActindo';
import { getVariantIdsByProduct } from '../../queries/product-variant';

/**
 * Product → its variant ids (hydrated by the `ProductVariant` resolver). Every
 * requested product gets a link entry (empty when it has no variants).
 */
export default defineActindoLink(ProductVariantsLink, async ({ entityIds, context }) => {
  const { items } = await getVariantIdsByProduct(context.client, entityIds);
  const variantIdsByProduct = new Map(items.map((item) => [item.productId, item.variantIds]));

  return {
    links: entityIds.map((productId) => ({
      sourceId: productId,
      targetIds: variantIdsByProduct.get(productId) ?? [],
    })),
  };
});
