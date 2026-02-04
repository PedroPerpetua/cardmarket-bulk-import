# Changelog


## [Unreleased]

### Changes
- Added language support.
  - Thank you [@danimp94](https://github.com/danimp94)!

### Housekeeping
- Upgraded dependencies:
  - `@types/react`: `19.2.10` -> `19.2.11`.
  - `eslint-plugin-react-refresh`: `0.4.26` -> `0.5.0`.


## [1.3.1] 2026-01-28

### Bugfixes
- Fixed item name not matching correctly in MTG.

### Housekeeping
- Upgraded dependencies:
  - `react`: `19.2.3` -> `19.2.4`.
  - `react-dom`: `19.2.3` -> `19.2.4`.
  - `@stylistic/eslint-plugin`: `5.7.0` -> `5.7.1`.
  - `@types/react`: `19.2.9` -> `19.2.10`.
  - `typescript-eslint`: `8.53.1` -> `8.54.0`.


## [1.3.0] 2026-01-32

### Changes
- Added the ability to select disabled rows that still match the form.
- Improved set matching with mtgjson; now `keyruneCode` is also considered.
- Improved name-row matching: if there is not an row in the form with the exact name of the form, it'll look for an row that contains said name (normalized comparison).

### Bugfixes
- Large pagination on the SelectedRowsForm no longer breaks layout.
- Sets without a cardmarket id will no longer be matched.

### Housekeeping
- Upgraded engines:
  - `node`: `24.12.0` -> `24.13.0`.
- Upgraded dependencies:
  - `react-hook-form`: `7.68.0` -> `7.71.1`.
  - `vite-plugin-node-polyfills`: `0.24.0` -> `0.25.0`.
  - `@stylistic/eslint-plugin`: `5.6.1` -> `5.7.0`.
  - `@types/react`: `19.2.7` ->  `19.2.9`.
  - `eslint-plugin-react-refresh`: `0.4.25` ->  `0.4.26`.
  - `typescript-eslint`: `8.49.0` ->  `8.53.1`.
  - `wxt`: `0.20.11` ->  `0.20.13`.


## [1.2.0] 2025-12-15

### Changes
- Added GameManagerInterface and GenericGameManager! These handle different support for different games. Now all games support at the least the GenericGameManager, so imports should be possible for all.

### Housekeeping:
- Upgraded engines:
  - `node`: `24.11.0` -> `24.12.0`.
  - `yarn`: `4.11.0` -> `4.12.0`.
- Upgraded dependencies:
  - `react`: `19.2.0` -> `19.2.3`.
  - `react-dom`: `19.2.0` -> `19.2.3`.
  - `react-hook-form`: `7.66.1` -> `7.68.0`.
  - `@stylistic/eslint-plugin`: `5.6.0` -> `5.6.1`.
  - `@types/react`: `19.2.6` -> `19.2.7`.
  - `eslint`: `9.39.1` -> `9.39.2`.
  - `eslint-plugin-react-refresh`: `0.4.24` -> `0.4.25`.
  - `typescript-eslint`: `8.47.0` -> `8.49.0`.


## [1.1.0] 2025-11-18

### Changes
- Sets now supported! You can select a column for "SET" and the extension will only match cards from your CSV that are part of the set you have open (as given by the `idExpansion` in the page).
- Modified form flow to work around batches and use row selection instead.
- Foil values now show an icon instead of "yes" / "no".

### Bugfixes
- Added proper error handling to the import form.

### Housekeeping
- Upgraded engines:
  - `node`: `22.20.0` -> `24.11.1`.
  - `yarn`: `4.10.3` -> `4.11.0`.
- Upgraded dependencies:
  - `react`: `19.1.1` -> `19.2.0`.
  - `react-dom`: `19.1.1` -> `19.2.0`.
  - `react-hook-form`: `7.63.0` -> `7.66.0`.
  - `@stylistic/eslint-plugin`: `5.4.0` -> `5.5.0`.
  - `@types/react`: `19.1.15` -> `19.2.2`.
  - `@types/react-dom`: `19.1.9` -> `19.2.2`.
  - `eslint`: `9.36.0` -> `9.39.1`.
  - `eslint-plugin-react-hooks`: `5.2.0` -> `7.0.1`.
  - `eslint-plugin-react-refresh`: `0.4.22` -> `0.4.24`.
  - `typescript`: `5.9.2` -> `5.9.3`.
  - `typescript-eslint`: `8.44.1` -> `8.46.3`.


## [1.0.1] - 2025-09-29

### Bugfixes
- Fixed issue where an undefined string could crash the CSV submission.

### Housekeeping
- Upgraded engines:
  - `node`: `22.19.0` -> `22.20.0`.
  - `yarn`: `4.9.4` -> `4.10.3`.
- Upgraded dependencies:
  - `react-hook-form`: `7.62.0` -> `7.63.0`.
  - `yup`: `1.7.0` -> `1.7.1`.
  - `@stylistic/eslint-plugin`: `5.3.1` -> `5.4.0`.
  - `@types/react`: `19.1.13` -> `19.1.15`.
  - `eslint`: `9.35.0` -> `9.36.0`.
  - `eslint-plugin-react-refresh`: `0.4.20` -> `0.4.22`,
  - `typescript-eslint`: `8.43.0` -> `8.44.1`.


## [1.0.0] - 2025-09-14
First official build!
