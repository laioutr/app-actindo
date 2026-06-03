# Bug: Header search submit (Enter) routes to `/search` without `?q=`

> Hand-off note for a separate session. Self-contained — no prior context needed.

## Symptom
Typing a term (e.g. `krawatte`) in the shop header search and pressing **Enter**
navigates to `http://localhost:3000/search` **without** the `?q=` query param.
The search results page then renders empty: header shows `Deine Suche: ""` and
`0 Produkte`, because the page's root query reads `route.query.q`, which is
`undefined`.

## Root cause (UPSTREAM UI — not the Actindo connector)
The search term never reaches the URL builder. The submit chain:

```
SearchBar (inside HeaderShop)
  --@search($event)-->  HeaderShop.vue            (@laioutr-core/ui)
  --@search-->          SectionHeaderShop.vue     (@laioutr-app/ui)
  --handleSearch(value)--> linkResolver --> router.push("/search?q=" + value)
```

- `@laioutr-app/ui` → `dist/runtime/app/section/SectionHeaderShop.vue` (~line 116-121):
  ```ts
  const searchTerm = ref('');
  const { searchSuggestions, isSearchLoading } = useSearchSuggestions(searchTerm);
  const router = useRouter();
  const handleSearch = (value) => {
    router.push(resolve({ type: 'pageType', pageType: ProductSearchPage, query: { q: value } }));
  };
  ```
  Template: `<HeaderShop v-model:search-term="searchTerm" ... @search="handleSearch" />`

- `@laioutr-core/ui` → `dist/runtime/components/HeaderShop/HeaderShop.vue`:
  ```
  line 42: const searchValue = defineModel('searchTerm', { type: String, default: '' });
  line 43: const emit = defineEmits(['search', ...]);
  line 64: <SearchBar ... @search="$emit('search', $event)" />   // re-emits child $event verbatim
  ```

- `@laioutr-core/frontend-core` → `dist/runtime/app/lib/page/links/linkResolver.js`
  (pageType branch, ~line 77-84) is **correct** — it passes `query: link.query`
  into `router.resolve({ name, params, query }).fullPath`. So if `value` were
  `"krawatte"`, the resolved URL would be `/search?q=krawatte`.

**Conclusion:** because the resolved URL is `/search` (no `?q=`), the `value`
passed to `handleSearch` is **empty**. The internal `SearchBar` component (inside
`HeaderShop`, `@laioutr-core/ui`) emits `@search` with an empty payload on Enter
(the typed term / `v-model:search-term` value is not in the emit). This is an
upstream `@laioutr-core/ui` SearchBar/HeaderShop issue, **not** the Actindo
connector.

## Verified CORRECT — do NOT re-investigate these
- `ecommerce/product/search` query handler returns real hits
  (`POST /api/orchestr/query` with `{query:"krawatte"}` → entities, `status:ok`).
  Empty string `query:""` → returns all (45). Missing `query` arg → ZodError
  (`query` is a required string on the canonical token).
- `ProductSearchPage` page type is registered (connector
  `src/runtime/app/plugins/pagetypes.ts`) and resolves to `/search`.
- The RC page `/search → ecommerce/product-search-page` binds the root `products`
  query to `ecommerce/product/search` with `inputRules: { query: { var: "route.query.q" } }` — correct.
- `linkResolver` appends `query` for `pageType` links — correct.

## Reproduce
1. `pnpm dev`, open the storefront, type `krawatte` in the header search, press Enter.
2. Observe URL `= /search` (no `?q=`), results empty.
3. Direct check works: open `/search?q=krawatte` manually → results render.
   (Confirms everything except the header's term-capture.)

## Where to fix (upstream)
Find the `SearchBar` component rendered inside
`@laioutr-core/ui` `dist/runtime/components/HeaderShop/HeaderShop.vue` (line ~64,
`<...SearchBar... @search="$emit('search', $event)" />`). Its `search` emit must
carry the current input value (the `searchTerm` / `v-model` value) on Enter.
Currently the emitted `$event` is empty.

Options:
1. **Report upstream** to the Laioutr team (`@laioutr-core/ui` SearchBar emits an
   empty `search` payload on Enter) and/or check whether a newer `@laioutr-core/ui`
   release fixes it. (Source: <https://github.com/laioutr/ui-source>.)
2. **Local override / fork** the `HeaderShop` (or its `SearchBar`) per the
   three-layer-architecture ladder (prop override → local component → fork from
   `ui-source`), wiring the `@search` emit to the actual input value.

## Working workaround (no code change)
The autocomplete **dropdown** works (it uses each entry's own link, bypassing the
broken `handleSearch`):
1. Restart `pnpm dev` (to load the connector's `query-suggestion` entry).
2. Type `krawatte` → dropdown shows a `query-suggestion` entry "krawatte"
   (links to `/search?q=krawatte`) plus product hits (link to PDPs).
3. **Click** the "krawatte" suggestion → navigates to `/search?q=krawatte` →
   results populate.

The connector emits that `query-suggestion` entry in
`src/runtime/server/orchestr-helper/generateSuggestedSearchEntries.ts`
(`type: 'query-suggestion'`, `link: { type:'pageType', pageType: ProductSearchPage, query:{ q: term } }`).

## Version context
`@laioutr-core/ui` `2.2.3`, `@laioutr-app/ui` `2.2.3`,
`@laioutr-core/frontend-core` `0.30.3`, `@laioutr-core/canonical-types` `0.22.25`.
