import { SuggestedSearchEntryBase } from '@laioutr-core/canonical-types/entity/suggested-search-entry';
import { suggestedSearchEntriesToken } from '../../const/passthroughTokens';
import { defineActindoComponentResolver } from '../../middleware/defineActindo';

/**
 * Hydrates `SuggestedSearchEntry` entities. The entries were fully built by the
 * `search` query and forwarded via passthrough, so this resolver just returns them.
 */
export default defineActindoComponentResolver({
  label: 'Actindo Suggested Search Entries Resolver',
  entityType: 'SuggestedSearchEntry',
  provides: [SuggestedSearchEntryBase],
  resolve: async ({ passthrough }) => ({
    entities: passthrough.get(suggestedSearchEntriesToken) ?? [],
  }),
});
