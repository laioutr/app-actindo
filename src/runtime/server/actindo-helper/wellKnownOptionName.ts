import type { WellKnownOptionName } from '@laioutr-core/canonical-types/entity/product-variant';

/**
 * Guess the canonical axis a merchant-authored option name refers to.
 *
 * The service sends `wellKnownName` on some options but not all — the staging
 * tenant tags `color` and leaves `size` untagged — and a consumer that picks its
 * size axis with `wellKnownName === 'size'` then finds none. The option `name`
 * itself is locale-resolved free text, so the table is keyed by term rather
 * than by language.
 *
 * Deliberately narrower than the 34-language table in the Adobe Commerce
 * connector: this connector serves German-market tenants, so the list covers
 * de/en properly and the neighbouring markets thinly. Add terms as tenants
 * arrive — a miss costs an undefined `wellKnownName`, never a wrong axis.
 *
 * Aliases are compared after {@link normalizeOptionName}, so casing, accents and
 * `ß` need no separate entries — list a term once, in its natural spelling.
 */
const OPTION_NAME_ALIASES: Record<'color' | 'size' | 'material' | 'style' | 'type', string[]> = {
  color: [
    'color', // en (US), es
    'colour', // en (GB)
    'farbe', // de
    'kleur', // nl
    'couleur', // fr
    'colore', // it
    'cor', // pt
    'farg', // sv, da/no `farge` folds separately
    'farge', // no
    'farve', // da
  ],
  size: [
    'size', // en
    'größe', // de
    'groesse', // de, ASCII transliteration — "oe" survives diacritic folding
    'konfektionsgröße', // de, apparel
    'maat', // nl
    'grootte', // nl
    'taille', // fr
    'pointure', // fr, footwear
    'taglia', // it
    'misura', // it
    'talla', // es
    'tamaño', // es
    'storlek', // sv
    'størrelse', // da, no
  ],
  material: [
    'material', // en, de, es, pt, sv
    'materiaal', // nl
    'matière', // fr
    'matériau', // fr
    'materiale', // it, da, no
  ],
  style: [
    'style', // en, fr
    'stil', // de, sv, da, no
    'stijl', // nl
    'stile', // it
    'estilo', // es, pt
    'passform', // de, apparel cut
  ],
  type: [
    'type', // en, nl, fr, da, no
    'typ', // de, sv
    'tipo', // it, es, pt
    'art', // de
  ],
};

/**
 * Fold the spelling variants of one term onto a single key: case, surrounding
 * whitespace, diacritics (`färg` → `farg`) and `ß` (`größe` → `grosse`, which
 * also matches Swiss `grösse`).
 *
 * Decomposing first is what makes the mark-stripping work — `ö` is one code
 * point until NFD splits it into `o` plus a combining diaeresis.
 */
const normalizeOptionName = (name: string) => name.trim().toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/\p{M}/gu, '');

const OPTION_NAME_LOOKUP = new Map<string, WellKnownOptionName>(
  Object.entries(OPTION_NAME_ALIASES).flatMap(([wellKnownName, aliases]) =>
    aliases.map((alias) => [normalizeOptionName(alias), wellKnownName as WellKnownOptionName] as const),
  ),
);

/** Resolve an option name to its canonical axis, or `undefined` when unrecognised. */
export const guessWellKnownName = (name: string): WellKnownOptionName | undefined => OPTION_NAME_LOOKUP.get(normalizeOptionName(name));
