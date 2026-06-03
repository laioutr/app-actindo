import { $entity } from '#imports';
import { CategoryBase, CategoryContent, CategoryMedia, CategorySeo } from '@laioutr-core/canonical-types/entity/category';
import type { ActindoCategory } from '../types/actindo';
import { mapImagesToMedia } from '../actindo-helper/media';

/**
 * Map Actindo categories into canonical `Category` component slices.
 *
 * The service guarantees only `base` (slug + title); `content`, `media` and
 * `seo` degrade to their empty canonical shapes when absent. The service
 * delivers the description as plain text, wrapped here into an `HtmlFragment`.
 */
export const generateCategoryComponents = (categories: ActindoCategory[]) => categories.map(generateCategoryComponent);

const generateCategoryComponent = (category: ActindoCategory) =>
  $entity([CategoryBase, CategoryContent, CategoryMedia, CategorySeo], {
    id: category.id,

    base: () => ({
      slug: category.base.slug,
      title: category.base.title,
    }),

    content: () => ({ description: { html: category.content?.description ?? '' } }),

    media: () => ({ media: mapImagesToMedia(category.media?.images) }),

    seo: () => ({
      title: category.seo?.title,
      description: category.seo?.description,
      robots: category.seo?.robots,
    }),
  });
