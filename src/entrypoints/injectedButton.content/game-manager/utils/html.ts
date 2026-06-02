// Always query the live DOM — never cache. The CM BulkListing table re-renders
// when the rarity/expansion filter changes, so any cached elements become detached.
export function getWebsiteRows() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

// Selectors for the fields from the tr Element for each row
export const quantityElSelector  = 'td input[name^="amount"]';
export const priceElSelector     = 'td input[name^="price"]';
export const languageElSelector  = 'td select[name^="idLanguage"]';

// YGO-specific selectors (confirmed via DevTools on live BulkListing page 2026-05-21)
export const conditionElSelector = 'td select[name^="idCondition"]';
export const firstEdElSelector   = 'td input[name^="isFirstEd"]';
export const signedElSelector    = 'td input[name^="isSigned"]';
export const commentsElSelector  = 'td input[name^="comments"]';
export const idProductElSelector = 'td input[name^="idProduct"]';

// ---------------------------------------------------------------------------
// Framework-safe value setters
//
// Cardmarket uses Vue.js on some pages. Setting .value / .checked directly via
// JS works on the DOM but does NOT notify Vue's reactivity system. Using the
// native property setter and dispatching events keeps both the DOM and any
// framework state in sync.
// ---------------------------------------------------------------------------

const _nativeInputSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype, 'value',
)!.set!;

const _nativeSelectSetter = Object.getOwnPropertyDescriptor(
  HTMLSelectElement.prototype, 'value',
)!.set!;

const _nativeCheckedSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype, 'checked',
)!.set!;

/** Set a text/number input value and notify the framework. */
export function setInputValue(el: HTMLInputElement, value: string) {
  _nativeInputSetter.call(el, value);
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Set a <select> value and notify the framework. */
export function setSelectValue(el: HTMLSelectElement, value: string) {
  _nativeSelectSetter.call(el, value);
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Set a checkbox checked state and notify the framework. */
export function setChecked(el: HTMLInputElement, checked: boolean) {
  _nativeCheckedSetter.call(el, checked);
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// ---------------------------------------------------------------------------
// CM BulkListing filter utilities
// ---------------------------------------------------------------------------

/**
 * Read the idExpansion dropdown and return a name→id mapping.
 * Called once per page load and cached for the session.
 */
export function readExpansionMap(): Record<string, number> {
  const sel = document.querySelector<HTMLSelectElement>('select[name="idExpansion"]');
  if (!sel) return {};
  const map: Record<string, number> = {};
  for (const opt of sel.options) {
    const name = opt.text.trim();
    const id   = parseInt(opt.value, 10);
    if (name && !isNaN(id) && id > 0) map[name] = id;
  }
  return map;
}

/**
 * Read the idRarity dropdown and return a name→id mapping.
 */
export function readRarityMap(): Record<string, number> {
  const sel = document.querySelector<HTMLSelectElement>('select[name="idRarity"]');
  if (!sel) return {};
  const map: Record<string, number> = {};
  for (const opt of sel.options) {
    const name = opt.text.trim();
    const id   = parseInt(opt.value, 10);
    if (name && name !== 'All' && !isNaN(id) && id > 0) map[name] = id;
  }
  return map;
}

/** Apply expansion + rarity filter and submit the GET form. Returns true if navigating. */
export function applyBulkListingFilter(idExpansion: number, idRarity: number): boolean {
  const expSel    = document.querySelector<HTMLSelectElement>('select[name="idExpansion"]');
  const rarSel    = document.querySelector<HTMLSelectElement>('select[name="idRarity"]');
  const filterBtn = document.querySelector<HTMLButtonElement>(
    'button.btn-primary[type="submit"], button.btn-primary'
  );
  if (!expSel || !rarSel || !filterBtn) return false;

  expSel.value = String(idExpansion);
  expSel.dispatchEvent(new Event('change', { bubbles: true }));
  rarSel.value = String(idRarity);
  rarSel.dispatchEvent(new Event('change', { bubbles: true }));
  filterBtn.click();
  return true;
}

/** Submit the CM BulkListing Add-to-Stock POST form. */
export function submitBulkListingForm(): boolean {
  // The "Add to Stock" button is a submit button in the main POST form
  const submitBtn = document.querySelector<HTMLButtonElement>(
    'form[method="post"] button[type="submit"]:not(.btn-secondary)'
  );
  if (submitBtn) { submitBtn.click(); return true; }
  return false;
}
