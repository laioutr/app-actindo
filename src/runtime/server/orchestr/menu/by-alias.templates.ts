import { MenuByAliasQuery } from '@laioutr-core/canonical-types/ecommerce';
import type { RemoteQueryTemplate } from '@laioutr-core/core-types/orchestr';
import { MENU_ALIASES } from '../../const';
import { defineActindoQueryTemplateProvider } from '../../middleware/defineActindo';

/** Title-case an alias for the Studio label (`main` → `Main`). */
const humanize = (alias: string) => alias.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Offers the known navigation aliases as Studio template options for the menu
 * query. Actindo has no endpoint to list aliases, so the set is the static
 * {@link MENU_ALIASES} list (filtered by the editor's search term).
 */
export default defineActindoQueryTemplateProvider({
  for: MenuByAliasQuery,
  run: ({ input }) => {
    const term = input.term?.trim().toLowerCase();
    const aliases = term ? MENU_ALIASES.filter((alias) => alias.toLowerCase().includes(term)) : MENU_ALIASES;

    const templates: RemoteQueryTemplate[] = aliases.map((alias) => ({
      inputRules: { alias: { literal: alias } },
      label: humanize(alias),
    }));

    return templates;
  },
});
