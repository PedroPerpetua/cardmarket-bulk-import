import { parse } from 'csv-parse';
import memoize from 'memoize';

function readCsvImpl(file: File) {
  return new Promise<{ columns: string[], rows: Record<string, unknown>[] }>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (evt) => {
      if (typeof evt.target?.result !== 'string') {
        reject(new Error(`Reader returned ${typeof evt.target?.result} instead of string.`));
        return;
      }
      parse(
        evt.target.result,
        { columns: true, skipEmptyLines: true, bom: true },
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
    };
    reader.onerror = (evt) => {
      console.error('[cardmarket-bulk-import] Failed to read CSV', evt);
      reject(new Error('Failed to read CSV'));
    };
  });
}

export const readCsv = memoize(readCsvImpl);

export async function getCsvColumns(file: File) {
  return (await readCsv(file)).columns;
}
