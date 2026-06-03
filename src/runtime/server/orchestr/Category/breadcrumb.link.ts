import { $entity } from '#imports';
import { CategoryBreadcrumbLink } from '@laioutr-core/canonical-types/ecommerce';
import { BreadcrumbItemBase } from '@laioutr-core/canonical-types/entity/breadcrumb-item';
import { ancestorSlugs, humanizeSlug } from '../../actindo-helper/breadcrumb';
import { defineActindoLink } from '../../middleware/defineActindo';
import { getCategoriesBatch } from '../../queries/category';

/**
 * Category → its breadcrumb trail (root → current). The service has no category
 * breadcrumb endpoint, but category ids are path-like slugs, so the trail is the
 * slug's ancestor prefixes — each prefix is itself a category id, hydrated in one
 * batch for the titles. Emitted as inline `BreadcrumbItem`s with synthetic ids.
 */
export default defineActindoLink({
  implements: CategoryBreadcrumbLink,
  provides: [BreadcrumbItemBase],
  run: async ({ entityIds, context }) => {
    const ancestors = [...new Set(entityIds.flatMap(ancestorSlugs))];

    const titleBySlug = new Map<string, string>();
    if (ancestors.length) {
      const { items } = await getCategoriesBatch(context.client, ancestors, { locale: context.locale });
      for (const category of items) titleBySlug.set(category.base.slug, category.base.title);
    }

    return {
      links: entityIds.map((categorySlug) => ({
        sourceId: categorySlug,
        entities: ancestorSlugs(categorySlug).map((slug) =>
          $entity([BreadcrumbItemBase], {
            id: `breadcrumb:${categorySlug}:${slug}`,
            base: () => ({
              name: titleBySlug.get(slug) ?? humanizeSlug(slug),
              link: { type: 'reference', reference: { type: 'Category', slug, id: slug } },
              isCurrentPage: slug === categorySlug,
            }),
          }),
        ),
      })),
    };
  },
});
