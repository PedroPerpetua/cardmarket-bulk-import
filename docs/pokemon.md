# Pokémon CSV import

On `/LANG/Pokemon/Stock/ListingMethods/BulkListing`, the import dialog also offers
Rarity (required), Reverse Holo, Signed and First Edition column mappings.
The existing language, condition, comment, quantity and price mappings are reused.

## Extract the current page

The **Extract CSV** button beside the original import control downloads only the
currently displayed Pokémon rows. It includes name, rarity and current language,
condition, checkbox, comment, quantity and price values. Disabled checkboxes are
exported as false. It preserves separate rows; it does not collect pages or
combine files. Download each page, combine the CSVs manually in Excel (keep one
header row), fill quantities/prices, save as comma-delimited CSV, and import on
each relevant Cardmarket page. Rows on other pages are not matched until those
pages are opened. The UTF-8 BOM supports Excel; the shared CSV reader accepts it.
Use Excel's Data > From Text/CSV with UTF-8 and a comma delimiter if necessary.
No additional permission, storage or server is used.

Use the complete displayed name, including the set/collector number, and the
rarity text from the icon tooltip. Matching is exact after Unicode NFC and
whitespace normalization; it does not use fuzzy name matching.

```csv
name,rarity,language,condition,isReverseHolo,isSigned,isFirstEd,comments,quantity,price
Pawmi (PAL 074),Common,English,NM,true,false,false,,2,0.25
Pawmi (PAL 074),Promo,English,NM,false,false,false,,1,0.50
```

The CSV format is unchanged (comma delimiter, dot decimal). Checkbox columns
are optional. Missing/empty values mean false; accepted values are true/false,
1/0, yes/no, y/n and t/f (case insensitive). Invalid values are reported rather
than silently interpreted as false. Unmapped language/condition use the generic
manager's defaults; supplied invalid values are blocked.

The Issue column explains unavailable or invalid rows; use **Show disabled** to
see them. Disabled rows cannot be forced through the selection UI. Quantities
must be positive integers within the form limits, and prices must respect the
form minimum/maximum. If a CSV requests a disabled or absent checkbox, that checkbox is ignored and
the rest of the listing remains importable. The preview shows the effective
false value and an informational Issue message. Enabled checkboxes still use
the requested CSV value; disabled controls are never enabled or modified.

Multiple CSV rows for one product use the existing Copy row behaviour (for
example, normal and Reverse Holo copies). Both matching and filling use name +
rarity. If different product links share the same pair on the current page,
that pair is blocked: for example, some Tinkaton (PAL 105) variants share both
name and rarity. These variants need manual listing. Product links are only
used to detect ambiguity, not as a CSV identifier.

Only the currently displayed page is considered. This contribution does not
collect other pages automatically or submit listings. Review the filled form.

## Validation

Run the project's TypeScript check and Chrome build. For the focused DOM tests,
install jsdom without saving it to package.json, then run:

```sh
npm install --no-save --package-lock=false --legacy-peer-deps jsdom
node docs/test/pokemon/manager.cjs
```

The tests transpile the actual manager and shared helpers with the project's
TypeScript dependency and use jsdom for the form. The i18n runtime and the
Cardmarket Copy row handler are simulated. These tests do not substitute for
an authenticated browser test on Cardmarket.
