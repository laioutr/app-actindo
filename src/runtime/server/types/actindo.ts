/**
 * DTO shapes returned by the Actindo Storefront Data Service.
 *
 * These mirror the service's OpenAPI document (`GET /docs/json`) verbatim —
 * they are the *wire* shapes, deliberately kept separate from the Laioutr
 * canonical component types. The Orchestr handlers translate from these DTOs
 * into canonical entities; see `../orchestr/lib/mappers`.
 *
 * Conventions (from the service description):
 * - Money is an integer in minor units + ISO-4217: `{ amount: 14900, currency: 'EUR' }`.
 * - `id` is an opaque, stable string — never assume it equals the SKU.
 * - Queries/links return ids; entity data is hydrated via the `:batch` endpoints.
 *
 * @see https://laioutr.actindo.com/docs
 */

/** Integer minor units + ISO-4217 code. Structurally identical to the canonical Money. */
export interface ActindoMoney {
  amount: number;
  currency: string;
}

/** A single responsive image source. */
export interface ActindoImageSource {
  provider: string;
  src: string;
  width?: number;
  height?: number;
}

/** An image media object (the only media `type` the service currently emits). */
export interface ActindoMediaImage {
  type: 'image';
  alt?: string;
  sources: ActindoImageSource[];
}

/** Link kinds the service can emit. Mirrors the canonical Link discriminator. */
export type ActindoLinkType = 'anchor' | 'page' | 'pageType' | 'reference' | 'url';

/** A polymorphic link. Most fields are optional and gated by `type`. */
export interface ActindoLink {
  type: ActindoLinkType;
  fragment?: string;
  href?: string;
  reference?: {
    id?: string;
    slug?: string;
    type?: string;
  };
}

/** Unit-price block as emitted by the service (note: no package quantity). */
export interface ActindoUnitPrice {
  price: ActindoMoney;
  referenceAmount: number;
  referenceUnit: string;
}

/** Aggregate product price block (across variants). */
export interface ActindoProductPrices {
  isOnSale: boolean;
  price: ActindoMoney;
  savingsPercent?: number;
  strikethroughPrice?: ActindoMoney;
  unitPrice?: ActindoUnitPrice;
  /** True when variants have differing prices ("from €X"). */
  isStartingFrom: boolean;
}

/** A fully hydrated product, as returned by `/v1/products/batch` and by-slug `expand`. */
export interface ActindoProduct {
  id: string;
  base: {
    name: string;
    slug: string;
  };
  brand?: {
    name: string;
    link?: ActindoLink;
  };
  defaultVariant?: {
    id?: string;
    options?: string[];
  };
  description?: {
    html: string;
  };
  flags?: Array<{
    label: string;
    style?: string;
  }>;
  info?: {
    brand?: string;
    cover?: ActindoMediaImage;
    shortDescription?: string;
  };
  media?: {
    images: ActindoMediaImage[];
  };
  prices?: ActindoProductPrices;
  rating?: {
    average: number;
    count: number;
  };
  seo?: {
    description?: string;
    robots?: string;
    title?: string;
  };
}

/** Availability of a single variant. */
export interface ActindoAvailability {
  status: 'backorder' | 'inStock' | 'outOfStock' | 'preorder';
  quantity: number;
  availabilityDate?: string;
}

/** Variant option swatch. */
export interface ActindoSwatch {
  type: 'color' | 'colors' | 'gradient' | 'thumbnail';
  colors?: string[];
  image?: ActindoMediaImage;
}

/** A fully hydrated product variant, as returned by `/v1/variants/batch`. */
export interface ActindoVariant {
  id: string;
  base: {
    name: string;
    sku: string;
    gtin?: string;
  };
  availability?: ActindoAvailability;
  info?: {
    image?: ActindoMediaImage;
    shortDescription?: string;
  };
  options?: {
    selected: Array<{
      name: string;
      value: string;
      wellKnownName?: string;
    }>;
    image?: ActindoMediaImage;
    swatch?: ActindoSwatch;
  };
  prices?: {
    isOnSale: boolean;
    price: ActindoMoney;
    savingsPercent?: number;
    strikethroughPrice?: ActindoMoney;
    unitPrice?: ActindoUnitPrice;
  };
  quantityPrices?: Array<{
    minQuantity: number;
    price: ActindoMoney;
  }>;
  quantityRule?: {
    increment: number;
    max?: number;
    min: number;
  };
  shipping?: {
    freeShipping?: boolean;
    weight?: number;
  };
}

/** A single search/listing facet. */
export interface ActindoFacet {
  id: string;
  label: string;
  type: 'boolean' | 'intervals' | 'list' | 'range';
  presentation?: 'swatch' | 'text';
  wellKnownName?: string;
  min?: number | ActindoMoney;
  max?: number | ActindoMoney;
  values?: Array<{
    id: string;
    label: string;
    count: number;
  }>;
}

/** A single sort option. */
export interface ActindoSorting {
  id: string;
  label: string;
  isDefault?: boolean;
}

/**
 * A page of entity ids, returned by every listing/search endpoint.
 * Entity data is hydrated separately via the `:batch` endpoints.
 */
export interface ActindoIdPage {
  ids: string[];
  total: number;
  /** The active sort (always echoed, for deterministic cache keys). */
  sorting: string;
  limit?: number;
  sortings?: ActindoSorting[];
  facets?: ActindoFacet[];
}

/** A single breadcrumb step. */
export interface ActindoBreadcrumbItem {
  id: string;
  label: string;
  link?: ActindoLink;
}

/** A category, as returned by `/v1/categories/batch`. */
export interface ActindoCategory {
  id: string;
  base: {
    slug: string;
    title: string;
  };
  content?: {
    description: string;
  };
  media?: {
    images: ActindoMediaImage[];
  };
  seo?: {
    description?: string;
    robots?: string;
    title?: string;
  };
}

// ---------------------------------------------------------------------------
// Envelope response shapes
// ---------------------------------------------------------------------------

export interface ActindoProductBySlugResponse {
  id: string;
  product?: ActindoProduct;
}

export interface ActindoProductsBatchResponse {
  items: ActindoProduct[];
}

export interface ActindoVariantIdsByProductResponse {
  items: Array<{
    productId: string;
    variantIds: string[];
  }>;
}

export interface ActindoVariantsBatchResponse {
  items: ActindoVariant[];
}

export interface ActindoAvailabilityBatchResponse {
  items: Array<{
    id: string;
    availability: ActindoAvailability;
  }>;
}

export interface ActindoBreadcrumbResponse {
  items: ActindoBreadcrumbItem[];
}

export interface ActindoCategoryBySlugResponse {
  id: string;
}

export interface ActindoCategoryIdsResponse {
  ids: string[];
}

export interface ActindoCategoriesBatchResponse {
  items: ActindoCategory[];
}

/** A navigation tree node from `GET /v1/navigation/{alias}` (recursive). */
export interface ActindoNavItem {
  id: string;
  base: {
    label: string;
    link?: ActindoLink;
    children?: ActindoNavItem[];
  };
}

export interface ActindoNavigationResponse {
  items: ActindoNavItem[];
}

/** A navigation node flattened out of the tree, carrying parent/child links by id. */
export interface FlattenedActindoNavItem {
  id: string;
  label: string;
  link?: ActindoLink;
  childIds?: string[];
  parentId?: string;
}

/** Locale/currency context forwarded to the service on every read. */
export interface ActindoLocaleContext {
  locale?: string;
  currency?: string;
}

/**
 * Canonical filter record as it arrives from Orchestr query/link args:
 * `filter-id => boolean | { min, max } | string[]`.
 */
export type ActindoFilterInput = Record<string, boolean | { min?: number; max?: number } | string[]>;

/** Shared listing parameters accepted by search + category-product endpoints. */
export interface ActindoListingParams extends ActindoLocaleContext {
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  filter?: ActindoFilterInput;
}
