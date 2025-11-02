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
