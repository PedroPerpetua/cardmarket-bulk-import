Testing
===

Currently the project is missing actual tests. However, the `test_eoe.csv` file can be used to test a good deal of things with the extension, to ensure things don't break.

It features most of the same card (Banishing Light EOE) in the following settings:
- All supported conditions;
- All different foil values;
- All different (modern) languages;
- A single card of every other rarity;
- A single version of another set to show disabled (BLB);
- A single unrelated card (Abandon Hope, TMP).

This CSV can be imported with the filter "Edge of Eternities" + "All" + "Collector Number".


## Pokémon and CSV extraction

Use `test_pokemon_pal.csv` with Pokémon, Paldea Evolved, all rarities, sorted by
collector number. Navigate to the page #2 containing Pawmi (PAL 074). Each CSV row
explains its expected result in the comment column. These descriptions are test
data: mapping this column to Comments copies them into the listing form. Keep
them in this test fixture, but clear or replace them before any real listing. Tinkaton (PAL 105) can be
checked on its page if it is not displayed with Pawmi.

Map the columns to their matching names. Confirm that Common and Promo are
filled separately; repeated Common rows use Copy row. A true value for a
disabled checkbox must be ignored while the other fields still fill. The import
preview shows the CSV values (including ignored options); check the final form.
Use Show disabled to see unmatched names/rarities. Ambiguous pairs are not
matched. Rarity is required for Pokémon; optional flags use the existing
parseBoolean behaviour, including false for empty or unrecognised values.
Common fields retain the original importer behaviour and defaults.

For extraction, click Extract CSV on any game's Bulk Listing page. Each download
contains only the current page and current form values, including copied rows.
Combine files manually, retaining one header row. Pokémon adds rarity and its
flags; Magic adds Foil and Signed. The export does not resolve set codes: keep
the appropriate expansion filter when importing. Other games get common fields.

Check extraction both before and after filling the form. Re-import the exported
CSV to verify accented comments, commas, quotes and the UTF-8 BOM. The format is
comma-delimited with dot-decimal prices; if Excel opens it in a single column,
use Data > From Text/CSV with UTF-8 and comma delimiter. Ensure Excel saves that
same format. The listing selection checkboxes and sale submission remain manual.

Finally, repeat the original `test_eoe.csv` checks in Magic: Pokémon columns must
not appear in its import dialog, while Extract CSV must be available. Verify
that Magic's exported CSV includes its Foil and Signed values. This is a manual
checklist, not an automated test suite.

When testing repeated Pokémon listings, verify ten filled Pawmi rows (nine
Common and one Promo). Pincurchin (PAL 073) must remain untouched. The test uses
Mint rather than the unsupported M abbreviation in the existing condition matcher.
