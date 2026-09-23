import { parse } from 'csv-parse';
import memoize from 'memoize';

export function readTextFromFile(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (evt) => {
      if (typeof evt.target?.result !== 'string') {
        reject(new Error(`Reader returned ${typeof evt.target?.result} instead of string.`));
        return;
      }
      resolve(evt.target.result);
    };
    reader.onerror = (evt) => {
      console.error('[cardmarket-bulk-import] Failed to read CSV', evt);
      reject(new Error('Failed to read CSV'));
    };
  });
}

function parseCsvText(text: string) {
  return new Promise<{ columns: string[], rows: Record<string, unknown>[] }>((resolve, reject) => {
    parse(
      text,
      { columns: true, skipEmptyLines: true },
      (err, records: Record<string, unknown>[], info) => {
        if (err) reject(err);
        if (!Array.isArray(info?.columns)) {
          reject(Error(`Invalid columns :${info?.columns}`));
          return;
        };
        resolve({
          columns: info.columns.filter((c) => 'name' in c).map(({ name }) => name),
          rows: records,
        });
      },
    );
  });
}

async function readCsvImpl(input: File | string) {
  const text = typeof input === 'string' ? input : await readTextFromFile(input);
  return parseCsvText(text);
}

export const readCsv = memoize(readCsvImpl);

export async function getCsvColumns(input: File | string) {
  return (await readCsv(input)).columns;
}
