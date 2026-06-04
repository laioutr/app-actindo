import { $entity } from '#imports';
import {
  ProductVariantAvailability,
  ProductVariantBase,
  ProductVariantInfo,
  ProductVariantOptions,
  ProductVariantPrices,
  ProductVariantQuantityPrices,
  ProductVariantQuantityRule,
  ProductVariantShipping,
} from '@laioutr-core/canonical-types/entity/product-variant';
import type { ActindoVariant } from '../types/actindo';
import { mapMediaImage } from '../actindo-helper/media';
import { mapSwatch } from '../actindo-helper/swatch';

/**
 * Map Actindo variants into the full canonical `ProductVariant` component set.
 *
 * Every variant component is provided so the PDP never hits a
 * `NonResolvableComponentsError`. Two carry best-effort values the service does
 * not expose directly: `quantityPrices.savingsPercent` is computed against the
 * variant base price, and `shipping.required` defaults to `true` (physical
 * goods) with a zero `rate` when the service flags free shipping.
 */
export const generateVariantComponents = (variants: ActindoVariant[], currency: string) =>
  variants.map((variant) => generateVariantComponent(variant, currency));

const generateVariantComponent = (variant: ActindoVariant, currency: string) => {
  const swatch = mapSwatch(variant.options?.swatch);

  return $entity(
    [
      ProductVariantBase,
      ProductVariantInfo,
      ProductVariantOptions,
      ProductVariantPrices,
      ProductVariantAvailability,
      ProductVariantQuantityPrices,
      ProductVariantQuantityRule,
      ProductVariantShipping,
    ],
    {
      id: variant.id,

      base: () => ({
        sku: variant.base.sku,
        name: variant.base.name,
        gtin: variant.base.gtin,
      }),

      info: () => ({
        image: variant.info?.image ? mapMediaImage(variant.info.image) : undefined,
      }),

      options: () => ({
        selected: (variant.options?.selected ?? []).map((option) => ({
          name: option.name,
          value: option.value,
          wellKnownName: option.wellKnownName,
        })),
        swatch,
        image: variant.options?.image ? mapMediaImage(variant.options.image) : undefined,
      }),

      // Actindo returns `prices` for every variant; the fallback is purely defensive.
      prices: () => ({
        price: variant.prices?.price ?? { amount: 0, currency },
        isOnSale: variant.prices?.isOnSale ?? false,
        strikethroughPrice: variant.prices?.strikethroughPrice,
        savingsPercent: variant.prices?.savingsPercent,
      }),

      availability: () => ({
        status: variant.availability?.status ?? 'outOfStock',
        quantity: variant.availability?.quantity ?? 0,
        availabilityDate: variant.availability?.availabilityDate ? new Date(variant.availability.availabilityDate) : undefined,
      }),

      quantityRule: () => ({
        increment: variant.quantityRule?.increment ?? 1,
        min: variant.quantityRule?.min ?? 1,
        max: variant.quantityRule?.max,
      }),

      quantityPrices: () =>
        (variant.quantityPrices ?? []).map((tier) => {
          const base = variant.prices?.price?.amount;
          // The service gives no savings figure for a tier — derive it from the base price.
          const savingsPercent = base && base > 0 ? Math.max(0, Math.round((1 - tier.price.amount / base) * 100)) : 0;
          return { quantity: tier.minQuantity, price: tier.price, savingsPercent };
        }),

      // The service exposes only `freeShipping`/`weight`; `required` defaults to
      // `true` (physical goods), and free shipping maps to a zero rate.
      shipping: () => ({
        required: true,
        ...(variant.shipping?.freeShipping ? { rate: { amount: 0, currency } } : {}),
      }),
    },
  );
};
