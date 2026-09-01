import { $entity } from '#imports';
import {
  ProductBase,
  ProductBrand,
  ProductDefaultVariant,
  ProductDescription,
  ProductFlags,
  ProductInfo,
  ProductMedia,
  ProductOptionGroups,
  ProductPrices,
  ProductRating,
  ProductSeo,
} from '@laioutr-core/canonical-types/entity/product';
import type { ActindoProduct, ActindoVariant } from '../types/actindo';
import { mapLink } from '../actindo-helper/link';
import { mapImagesToMedia, mapMediaImage } from '../actindo-helper/media';
import { mapProductOptionGroups } from '../actindo-helper/optionGroups';
import { mapProductFlags } from '../actindo-helper/productFlags';

/**
 * Map Actindo products into canonical `Product` component slices.
 *
 * The service guarantees only `base`; the remaining blocks are optional, so
 * absent data degrades to its conventional "empty" canonical shape (e.g.
 * `rating` 0/0, empty `media`, an empty-sourced cover image). Values are lazy
 * so Orchestr only computes the components the frontend requested.
 *
 * `variantsByProduct` carries the variants the resolver loaded for `optionGroups`
 * and `defaultVariant`, keyed by product id. It is empty for queries that asked
 * for neither component, and for products that carried the data themselves.
 */
export const generateProductComponents = (
  products: ActindoProduct[],
  currency: string,
  variantsByProduct: ReadonlyMap<string, ActindoVariant[]> = new Map(),
) => products.map((product) => generateProductComponent(product, currency, variantsByProduct.get(product.id)));

const generateProductComponent = (product: ActindoProduct, currency: string, variants: ActindoVariant[] | undefined) => {
  const brandLink = mapLink(product.brand?.link);
  const coverSource = product.info?.cover ?? product.media?.images?.[0];
  const defaultVariant = product.defaultVariant?.id ? variants?.find((variant) => variant.id === product.defaultVariant?.id) : undefined;

  return $entity(
    [
      ProductBase,
      ProductDescription,
      ProductMedia,
      ProductInfo,
      ProductBrand,
      ProductPrices,
      ProductRating,
      ProductFlags,
      ProductDefaultVariant,
      ProductOptionGroups,
      ProductSeo,
    ],
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

      // Prefer whatever Actindo states over anything derived here. Today it
      // sends only `id`, so `sku`/`status` come from resolving that variant and
      // `origin` falls back to `derived` — Actindo names a variant but declares
      // no merchant intent, and a tile that pins `?variant=` on a derived choice
      // changes the product's URL every time a size sells out.
      defaultVariant: () => ({
        origin: product.defaultVariant?.origin ?? 'derived',
        id: product.defaultVariant?.id,
        options: product.defaultVariant?.options,
        sku: product.defaultVariant?.sku ?? defaultVariant?.base.sku,
        status: product.defaultVariant?.status ?? defaultVariant?.availability?.status,
      }),

      optionGroups: () => mapProductOptionGroups(product, variants),

      seo: () => ({
        title: product.seo?.title,
        description: product.seo?.description,
        robots: product.seo?.robots,
      }),
    },
  );
};
