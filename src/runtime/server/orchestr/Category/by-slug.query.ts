import { CategoryBySlugQuery } from '@laioutr-core/canonical-types/ecommerce';
import { isActindoNotFound } from '../../actindo-helper/errors';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { getCategoryBySlug } from '../../queries/category';

/**
 * Category page: slug → opaque category id. The `Category` resolver hydrates
 * the entity; the `CategoryProducts` link resolves its product listing. An
 * unknown slug yields an empty result so the frontend can render a 404.
 */
export default defineActindoQuery(CategoryBySlugQuery, async ({ input, context }) => {
  try {
    const { id } = await getCategoryBySlug(context.client, input.slug, { locale: context.locale });
    return { id };
  } catch (error) {
    if (isActindoNotFound(error)) return {};
    throw error;
  }
});
