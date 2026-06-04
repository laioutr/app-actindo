import { SuggestedSearchEntriesLink } from '@laioutr-core/canonical-types/suggested-search';
import { suggestedSearchEntriesToken } from '../../const/passthroughTokens';
import { defineActindoLink } from '../../middleware/defineActindo';

/**
 * SuggestedSearch → its entry ids. Reads the entries the `search` query already
 * built (via passthrough); empty on cache restore / cross-app composition.
 */
export default defineActindoLink(SuggestedSearchEntriesLink, async ({ entityIds, passthrough }) => {
  const entries = passthrough.get(suggestedSearchEntriesToken) ?? [];

  return {
    links: entityIds.map((sourceId) => ({
      sourceId,
      targetIds: entries.map((entry) => entry.id),
    })),
  };
});
