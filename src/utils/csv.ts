import { parse } from 'csv-parse';
import memoize from 'memoize';

function readCsvImpl(file: File) {
  return new Promise<{ columns: string[], rows: Record<string, unknown>[] }>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (evt) => {
      if (typeof evt.target?.result !== 'string') {
        reject(`Reader returned ${typeof evt.target?.result} instead of string.`);
        return;
      }
      parse(
        evt.target.result,
        { columns: true, skipEmptyLines: true },
        (err, records: Record<string, unknown>[], info) => {
          if (err) reject(err);
          if (!Array.isArray(info?.columns)) {
            reject(Error(`Invalid columns :${info?.columns}`));
            return;
          };
          // @ts-ignore
          resolve({ columns: info.columns.map(({ name }) => name as string), rows: records });
        },
      );
    };
    reader.onerror = (evt) => reject(evt);
  });
}

export const readCsv = memoize(readCsvImpl);

export async function getCsvColumns(file: File) {
  return (await readCsv(file)).columns;
}
