// Run with Node after installing jsdom; see docs/pokemon.md.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../../..');
const strings = JSON.parse(fs.readFileSync(path.join(root, 'src/locales/en.json'), 'utf8'));
const originalLoad = Module._load;
Module._load = function(id, ...args) {
  if (id === '#imports') return { i18n: { t: key => key.split('.').reduce((v, k) => v[k], strings) } };
  if (id === 'webext-bridge/content-script') return { sendMessage: () => { throw Error('Unexpected MTG request'); } };
  return originalLoad.call(this, id, ...args);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};
function row(name, rarity, link, reverseDisabled = false) {
  return `<tr><td><div class="col-product text-start"><a href="/${link}">${name}</a></div></td>
<td><span class="rarity-symbol" aria-label="${rarity}"></span></td>
<td><select class="form-select" name="idLanguage[0]"><option value="1">English</option><option value="8">Portuguese</option></select></td>
<td><select name="idCondition[0]"><option value="1">Mint</option><option value="2" selected>Near Mint</option><option value="3">Excellent</option></select></td>
<td><input type="checkbox" name="isReverseHolo[0]" ${reverseDisabled ? 'disabled' : ''}></td>
<td><input type="checkbox" name="isSigned[0]"></td><td><input type="checkbox" name="isFirstEd[0]" disabled></td>
<td><input name="comments[0]"></td><td><input name="amount[0]" value="0" min="0" max="30"></td>
<td><input name="price[0]" data-min-amount="0.02" data-max-amount="1000000"></td>
<td><button class="copy-row-button" type="button">Copy</button></td></tr>`;
}
const html = `<table><tbody>${row('Pawmi  (PAL 074)', 'Common', 'pawmi-v1')}${row('Pawmi  (PAL 074)', 'Promo', 'pawmi-v2', true)}${row('Tinkaton (PAL 105)', 'Rare', 'tinkaton-v1')}${row('Tinkaton (PAL 105)', 'Rare', 'tinkaton-v2')}</tbody></table>`;
const dom = new JSDOM(html, { url: 'https://www.cardmarket.com/en/Pokemon/Stock/ListingMethods/BulkListing' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Event: dom.window.Event, FileReader: dom.window.FileReader });
const basePath = path.join(root, 'src/entrypoints/injectedButton.content/game-manager');
const Generic = require(path.join(basePath, 'managers/generic.ts')).default;
const Pokemon = require(path.join(basePath, 'managers/pokemon.ts')).default;
const { getCurrentManager } = require(path.join(basePath, 'index.ts'));
let count = 0;
function check(value, label) { assert.ok(value, label); count++; }
(async () => {
  const manager = getCurrentManager();
  check(manager instanceof Pokemon, 'Pokémon route selects Pokémon manager');
  const mapping = Object.fromEntries(['name','rarity','language','condition','comment','quantity','price','isReverseHolo','isSigned','isFirstEd'].map(k=>[k,k]));
  const base = { name: 'Pawmi (PAL 074)', rarity: 'Common', language: 'English', condition: 'NM', quantity: '2', price: '0.25', isReverseHolo: 'true', isSigned: 'false', isFirstEd: 'false' };
  const parse = overrides => manager.parseRow(0, { ...base, ...overrides }, mapping);
  const common = await parse({});
  const promo = await parse({ rarity: 'Promo', isReverseHolo: 'false' });
  check(common.enabled && promo.enabled, 'Common and Promo match separately');
  const disabledReverse = await parse({rarity:'Promo'});
  check(disabledReverse.enabled && !disabledReverse.isReverseHolo && disabledReverse.issue.includes('isReverseHolo'), 'Disabled Reverse Holo ignored without blocking row');
  const disabledFirst = await parse({isFirstEd:'true'});
  check(disabledFirst.enabled && !disabledFirst.isFirstEd, 'Disabled First Edition ignored');
  const extracted = manager.extractCsv();
  const exportFile = new dom.window.File([extracted], 'export.csv');
  const csvReader = require(path.join(root, 'src/utils/csv.ts'));
  const table = await csvReader.readCsv(exportFile);
  check(table.rows.length === 4 && table.columns[0] === 'name', 'Export includes current rows and BOM imports correctly');
  check(table.rows[0].rarity === 'Common' && table.rows[1].rarity === 'Promo', 'Export retains distinct rarities');
  check(table.rows[0].quantity === '0' && table.rows[0].language === 'English', 'Export captures current form fields');

  for (const [overrides, label] of [
    [{rarity:''},'Missing rarity'], [{name:'Pawmi'},'No fuzzy matching'],
    [{name:'Tinkaton (PAL 105)',rarity:'Rare'},'Same name and rarity ambiguity'],
    [{isSigned:'maybe'},'Invalid boolean'], [{language:'Japanese'},'Unavailable language'],
    [{condition:'incorrect'},'Unknown condition'], [{quantity:'0'},'Zero quantity'],
    [{quantity:'31'},'Maximum quantity'], [{quantity:'1.5'},'Fractional quantity'],
    [{price:'0.01'},'Minimum price'], [{price:'Infinity'},'Non-finite price'],
  ]) {
    const data = await parse(overrides);
    check(!data.enabled && data.name.matchedName === null && !!data.issue, label);
  }
  check((await parse({name:'  Pawmi   (PAL 074)  '})).enabled, 'Whitespace normalized');
  const optional = await manager.parseRow(1, {name:base.name,rarity:'Common',quantity:'1',price:'0.2'}, {name:'name',rarity:'rarity',quantity:'quantity',price:'price'});
  check(optional.enabled && !optional.isSigned && !optional.isReverseHolo, 'Optional fields use defaults');
  document.addEventListener('click', e => {
    const button = e.target.closest('.copy-row-button');
    if (button) { const original = button.closest('tr'); original.before(original.cloneNode(true)); }
  });
  check(await manager.fillPage([common,disabledReverse]) === 2, 'Fill count');
  let trs = [...document.querySelectorAll('tr')];
  const input = (r,n) => r.querySelector(`input[name^="${n}["]`);
  check(input(trs[0],'isReverseHolo').checked && !input(trs[1],'isReverseHolo').checked, 'Flags land on correct rarity');
  const second = await parse({isReverseHolo:'false',isSigned:'true'});
  await manager.fillPage([second]);
  trs = [...document.querySelectorAll('tr')];
  check(trs.length === 5 && !input(trs[0],'isReverseHolo').checked && input(trs[0],'isSigned').checked && input(trs[1],'isReverseHolo').checked, 'Duplicate rows reset extra flags and preserve previous listing');
  const valid = await parse({});
  const before = document.body.innerHTML;
  await assert.rejects(manager.fillPage([valid, {...valid,rarity:'Missing'}])); count++;
  check(document.body.innerHTML === before, 'Preflight prevents partial writes for stale matches');
  const file = new dom.window.File(['name,rarity,language,condition,quantity,price\n"Pawmi (PAL 074)",Common,English,NM,1,0.25'], 'pokemon.csv');
  const parsed = await manager.parseCsv(file,mapping);
  check(parsed.length === 1 && parsed[0].enabled, 'Actual CSV reader and manager round trip');
  if (process.argv[2]) {
    document.body.innerHTML = fs.readFileSync(process.argv[2], 'utf8');
    check((await parse({})).enabled, 'Supplied HTML Common match');
    check((await parse({rarity:'Promo',isReverseHolo:'false'})).enabled, 'Supplied HTML Promo match');
    check(!(await parse({name:'Tinkaton (PAL 105)',rarity:'Rare'})).enabled, 'Supplied HTML ambiguity blocked');
  }
  Generic._instance = undefined;
  dom.reconfigure({url:'https://www.cardmarket.com/en/Magic/Stock/ListingMethods/BulkListing'});
  check(getCurrentManager().constructor.name === 'MtgGameManager', 'Magic routing unchanged');
  Generic._instance = undefined;
  dom.reconfigure({url:'https://www.cardmarket.com/en/YuGiOh/Stock/ListingMethods/BulkListing'});
  check(getCurrentManager().constructor.name === 'GenericGameManager', 'Generic routing unchanged');
  console.log(`${count} Pokémon manager checks passed (actual TypeScript sources; jsdom; simulated Copy row).`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>dom.window.close());
