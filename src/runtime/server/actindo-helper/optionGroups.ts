import { mapMediaImage } from './media';
import { mapSwatch } from './swatch';
import { guessWellKnownName } from './wellKnownOptionName';
import type { ActindoMediaImage, ActindoOptionGroups, ActindoProduct, ActindoSwatch, ActindoVariant } from '../types/actindo';
import type { WellKnownOptionName } from '@laioutr-core/canonical-types/entity/product-variant';
import type { MediaImage, Swatch } from '@laioutr-core/core-types/common';

/** One selectable value on an axis, in canonical `ProductOptionGroups` shape. */
export interface OptionGroupValue {
  value: string;
  variantId?: string;
  available?: boolean;
  swatch?: Swatch;
  image?: MediaImage;
}

/** One option axis (e.g. Size → [S, M, L]). */
export interface OptionGroup {
  name: string;
  wellKnownName?: WellKnownOptionName;
  values: OptionGroupValue[];
}

/** The canonical `ProductOptionGroups` component payload. */
export interface ProductOptionGroupsComponent {
  groups: OptionGroup[];
}

/**
 * Translate a native Actindo option-group block onto the canonical component.
 *
 * The service does not send this block as of OpenAPI `0.1.0-mvp` — see
 * {@link ActindoOptionGroups}. It exists so that the day Actindo ships one,
 * {@link mapProductOptionGroups} starts using it with no other change, and the
 * per-product variant round-trip disappears on its own.
 */
export const mapNativeOptionGroups = (block: ActindoOptionGroups): ProductOptionGroupsComponent => ({
  groups: (block.groups ?? []).map((group) => ({
    name: group.name,
    wellKnownName: (group.wellKnownName as WellKnownOptionName | undefined) ?? guessWellKnownName(group.name),
    values: (group.values ?? []).map((value) => ({
      value: value.value,
      variantId: value.variantId,
      available: value.available,
      swatch: mapSwatch(value.swatch),
      image: value.image ? mapMediaImage(value.image) : undefined,
    })),
  })),
});

/** Mutable accumulator for one axis value while folding over the variants. */
interface ValueAccumulator {
  value: string;
  /** First variant carrying this value — a representative, not a stock statement. */
  variantId: string;
  available?: boolean;
  swatch?: ActindoSwatch;
  image?: ActindoMediaImage;
}

interface AxisAccumulator {
  name: string;
  wellKnownName?: WellKnownOptionName;
  values: Map<string, ValueAccumulator>;
}

/**
 * Aggregate the option axes a product offers from its variants.
 *
 * Actindo exposes no product-level option matrix, so the axes are folded out of
 * `variant.options.selected[]`. Insertion order is the presentation order: the
 * service returns variants in a stable order, so axes and values both keep
 * first-encounter order rather than being sorted into something arbitrary.
 */
export const deriveOptionGroupsFromVariants = (variants: ActindoVariant[]): ProductOptionGroupsComponent => {
  const axes = new Map<string, AxisAccumulator>();

  for (const variant of variants) {
    for (const option of variant.options?.selected ?? []) {
      let axis = axes.get(option.name);
      if (!axis) {
        axis = { name: option.name, values: new Map() };
        axes.set(option.name, axis);
      }
      axis.wellKnownName ??= option.wellKnownName as WellKnownOptionName | undefined;

      let value = axis.values.get(option.value);
      if (!value) {
        value = { value: option.value, variantId: variant.id };
        axis.values.set(option.value, value);
      }

      // `available` stays undefined until some variant carrying this value
      // actually reports stock; canonical reads absent as unknown ⇒ available.
      // Collapsing unknown into `false` would grey out every size on a tenant
      // that does not publish availability at all.
      const status = variant.availability?.status;
      if (status) value.available = (value.available ?? false) || status !== 'outOfStock';

      // Actindo hangs swatch/image off the variant, not off the selected value,
      // so keep the first one seen and decide below which axis may claim it.
      value.swatch ??= variant.options?.swatch;
      value.image ??= variant.options?.image;
    }
  }

  const groups = [...axes.values()].map((axis) => ({
    ...axis,
    wellKnownName: axis.wellKnownName ?? guessWellKnownName(axis.name),
  }));

  // A variant-level swatch describes the variant as a whole. Attributing it to
  // an axis is a judgement call, and the failure mode being avoided is a colour
  // swatch rendered onto a size chip. Only a colour axis may claim it — or the
  // sole axis of a single-axis product, where the attribution is unambiguous.
  const swatchAxis = groups.find((group) => group.wellKnownName === 'color') ?? (groups.length === 1 ? groups[0] : undefined);

  return {
    groups: groups.map((group) => ({
      name: group.name,
      wellKnownName: group.wellKnownName,
      values: [...group.values.values()].map((value) => ({
        value: value.value,
        variantId: value.variantId,
        available: value.available,
        swatch: group === swatchAxis ? mapSwatch(value.swatch) : undefined,
        image: group === swatchAxis && value.image ? mapMediaImage(value.image) : undefined,
      })),
    })),
  };
};

/**
 * Resolve the canonical `ProductOptionGroups` component for one product.
 *
 * Prefers whatever Actindo states over anything this connector infers: a native
 * block wins outright, and the variants are only folded when there is none.
 */
export const mapProductOptionGroups = (product: ActindoProduct, variants: ActindoVariant[] | undefined): ProductOptionGroupsComponent =>
  product.optionGroups ? mapNativeOptionGroups(product.optionGroups) : deriveOptionGroupsFromVariants(variants ?? []);
