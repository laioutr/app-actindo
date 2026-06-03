import { $entity } from '#imports';
import { ProductBreadcrumbLink } from '@laioutr-core/canonical-types/ecommerce';
import { BreadcrumbItemBase } from '@laioutr-core/canonical-types/entity/breadcrumb-item';
import { mapBreadcrumbBase } from '../../actindo-helper/breadcrumb';
import { defineActindoLink } from '../../middleware/defineActindo';
import { getProductBreadcrumb } from '../../queries/product';

/**
 * Product → its breadcrumb trail. Steps have no stable cross-request entity ids
 * in the service, so each is emitted as an inline `BreadcrumbItem` with a
 * synthetic, per-product id (`breadcrumb:<productId>:<stepId>`).
 */
export default defineActindoLink({
  implements: ProductBreadcrumbLink,
  provides: [BreadcrumbItemBase],
  run: async ({ entityIds, context }) => {
    const links = await Promise.all(
      entityIds.map(async (productId) => {
        const { items } = await getProductBreadcrumb(context.client, productId, { locale: context.locale });
        return {
          sourceId: productId,
          entities: items.map((item) =>
            $entity([BreadcrumbItemBase], {
              id: `breadcrumb:${productId}:${item.id}`,
              base: () => mapBreadcrumbBase(item),
            }),
          ),
        };
      }),
    );

    return { links };
  },
});
