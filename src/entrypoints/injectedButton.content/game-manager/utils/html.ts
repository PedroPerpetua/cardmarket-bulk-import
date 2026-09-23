import memoize from 'memoize';

function getWebsiteRowsImpl() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

export const getWebsiteRows = memoize(getWebsiteRowsImpl);

/**
 * This function will build a Record of "name on the form" -> "name to match"; this is to handle
 * the scenarios where cards have translations beneath them.
 */
function getFormNamesImpl() {
  const formNames: Record<string, string> = {};

  for (const row of getWebsiteRows()) {
    const rowName = row.textContent;
    formNames[rowName] = rowName;
    // Look for a translated name besides it
    const translatedName = row.nextSibling?.textContent;
    if (translatedName) formNames[translatedName] = rowName;
  }

  return formNames;
}

export const getFormNames = memoize(getFormNamesImpl);

// Selectors for the fields from the tr Element for each row
export const languageElSelector = 'td select[name^="idLanguage"]';
export const conditionElSelector = 'td select[name^="idCondition"]';
export const commentElSelector = 'td input[name^="comments"]';
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';

const SUBMIT_BUTTON_SELECTOR = 'input[type="submit"][form="BulkListingForm"]';
const NEXT_PAGE_SELECTOR = 'a[data-direction="next"]';

export function getSubmitButton(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(SUBMIT_BUTTON_SELECTOR);
}

export function submitBulkForm(): boolean {
  const btn = getSubmitButton();
  if (!btn || btn.disabled) return false;
  btn.click();
  return true;
}

export function getNextPageHref(): string | null {
  const a = document.querySelector<HTMLAnchorElement>(NEXT_PAGE_SELECTOR);
  return a ? a.href : null;
}

export function getCurrentSiteParam(): number {
  const v = new URLSearchParams(window.location.search).get('site');
  return v ? Math.max(1, Number(v) || 1) : 1;
}

export function countFilledQuantityRows(): number {
  let n = 0;
  document.querySelectorAll<HTMLInputElement>(quantityElSelector).forEach((el) => {
    if (el.value && el.value !== '0') n += 1;
  });
  return n;
}

export async function waitForSubmitComplete(timeoutMs = 15000): Promise<boolean> {
  const initialFilled = countFilledQuantityRows();
  if (initialFilled === 0) return true;
  await new Promise((r) => setTimeout(r, 800));
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (countFilledQuantityRows() === 0) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

const HIGHLIGHT_CLASS = 'cardmarket-bulk-import-filled';

function ensureHighlightStyleInjected() {
  if (document.getElementById('cbi-highlight-style')) return;
  const style = document.createElement('style');
  style.id = 'cbi-highlight-style';
  style.textContent = `
    tr.${HIGHLIGHT_CLASS} > td {
      background-color: rgba(40, 167, 69, 0.18) !important;
    }
    tr.${HIGHLIGHT_CLASS} > td:first-child {
      box-shadow: inset 4px 0 0 0 #28a745;
    }
  `;
  document.head.appendChild(style);
}

export function bringFilledRowsToTop(filledTrs: HTMLTableRowElement[]) {
  if (filledTrs.length === 0) return;
  ensureHighlightStyleInjected();

  const tbody = filledTrs[0]!.parentElement;
  if (!tbody) return;

  for (const tr of [...filledTrs].reverse()) {
    tr.classList.add(HIGHLIGHT_CLASS);
    tbody.insertBefore(tr, tbody.firstChild);
  }

  const table = tbody.closest('table');
  if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
