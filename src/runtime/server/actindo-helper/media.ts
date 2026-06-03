import type { ActindoImageSource, ActindoMediaImage } from '../types/actindo';
import type { Media, MediaImage, MediaSourceImage } from '@laioutr-core/core-types/common';

/**
 * Map one Actindo image source to a canonical `MediaSourceImage`.
 *
 * The `provider` is pinned to `actindo` (the Nuxt Image provider registered by
 * the module), not the service's per-tenant provider tag — the latter is not a
 * registered Nuxt Image provider, so images would otherwise fail to resolve.
 * The absolute media URL is carried unchanged in `src`.
 */
export function mapImageSource(source: ActindoImageSource): MediaSourceImage {
  return {
    provider: 'actindo',
    src: source.src,
    width: source.width,
    height: source.height,
  };
}

/** Map an Actindo image media object to a canonical `MediaImage`. */
export function mapMediaImage(image: ActindoMediaImage): MediaImage {
  return {
    type: 'image',
    alt: image.alt,
    // Defensive: never let a malformed image (missing `sources`) throw inside an
    // SSR resolver — that surfaces as an opaque "headers already sent" 500.
    sources: (image.sources ?? []).map(mapImageSource),
  };
}

/** Map a list of Actindo images to canonical `Media[]` (all images are valid `Media`). */
export function mapImagesToMedia(images: ActindoMediaImage[] | undefined): Media[] {
  return (images ?? []).map(mapMediaImage);
}
