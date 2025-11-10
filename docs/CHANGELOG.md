# Changelog


## [UNRELEASED]

### Changes
- Sets now supported! You can select a column for "SET" and the extension will only match cards from your CSV that are part of the set you have open (as given by the `idExpansion` in the page).
- Modified form flow to work around batches and use row selection instead.
- Foil values now show an icon instead of "yes" / "no".

### Housekeeping
- Upgraded engines:
  - `node`: `22.20.0` -> `24.11.0`.
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
