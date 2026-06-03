import { $entity } from '#imports';
import {
  ProductBase,
  ProductBrand,
  ProductDefaultVariant,
  ProductDescription,
  ProductFlags,
  ProductInfo,
  ProductMedia,
  ProductPrices,
  ProductRating,
  ProductSeo,
} from '@laioutr-core/canonical-types/entity/product';
import type { ActindoProduct } from '../types/actindo';
import { mapLink } from '../actindo-helper/link';
import { mapImagesToMedia, mapMediaImage } from '../actindo-helper/media';
import { mapProductFlags } from '../actindo-helper/productFlags';

/**
 * Map Actindo products into canonical `Product` component slices.
 *
 * The service guarantees only `base`; the remaining blocks are optional, so
 * absent data degrades to its conventional "empty" canonical shape (e.g.
 * `rating` 0/0, empty `media`, an empty-sourced cover image). Values are lazy
 * so Orchestr only computes the components the frontend requested.
 */
export const generateProductComponents = (products: ActindoProduct[], currency: string) =>
  products.map((product) => generateProductComponent(product, currency));

const generateProductComponent = (product: ActindoProduct, currency: string) => {
  const brandLink = mapLink(product.brand?.link);
  const coverSource = product.info?.cover ?? product.media?.images?.[0];

  return $entity(
    [ProductBase, ProductDescription, ProductMedia, ProductInfo, ProductBrand, ProductPrices, ProductRating, ProductFlags, ProductDefaultVariant, ProductSeo],
    {
      id: product.id,

      base: () => ({
        name: product.base.name,
        slug: product.base.slug,
      }),

      description: () => ({ html: product.description?.html ?? '' }),

      media: () => ({
        images: (product.media?.images ?? []).map(mapMediaImage),
        media: mapImagesToMedia(product.media?.images),
      }),

      info: () => ({
        cover: coverSource ? mapMediaImage(coverSource) : { type: 'image', sources: [] },
        shortDescription: product.info?.shortDescription,
        brand: product.info?.brand,
        brandLink,
      }),

      brand: () => ({
        name: product.brand?.name,
        link: brandLink,
      }),

      // Actindo returns `prices` for every product; the fallback is purely defensive.
      // NOTE: Actindo unitPrice {price, referenceAmount, referenceUnit} lacks the package
      // quantity required by canonical UnitPrice {price, quantity, reference} — omitted.
      prices: () => ({
        price: product.prices?.price ?? { amount: 0, currency },
        isOnSale: product.prices?.isOnSale ?? false,
        isStartingFrom: product.prices?.isStartingFrom ?? false,
        strikethroughPrice: product.prices?.strikethroughPrice,
        savingsPercent: product.prices?.savingsPercent,
      }),

      rating: () => ({
        average: product.rating?.average ?? 0,
        count: product.rating?.count ?? 0,
      }),

      flags: () => mapProductFlags(product.flags),

      defaultVariant: () => ({
        id: product.defaultVariant?.id,
        options: product.defaultVariant?.options,
      }),

      seo: () => ({
        title: product.seo?.title,
        description: product.seo?.description,
        robots: product.seo?.robots,
      }),
    },
  );
};
