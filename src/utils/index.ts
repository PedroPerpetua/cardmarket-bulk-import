export function normalizeString(str?: string) {
  if (!str) return '';
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function compareNormalized(str1: string, str2: string) {
  return normalizeString(str1) === normalizeString(str2);
}

export function setInArray<T>(arr: T[], value: T, setAs: boolean) {
  const includes = arr.includes(value);
  if (setAs) {
    if (includes) return [...arr];
    return [...arr, value];
  }
  if (!includes) return [...arr];
  return arr.filter((v) => v != value);
}

export function splitIntoBatches(count: number, batchSize: number = 100) {
  const retval = [];
  for (let start = 1; start <= count; start += batchSize) {
    const end = Math.min(start + batchSize - 1, count);
    retval.push([start, end] as const);
  }
  return retval;
}
