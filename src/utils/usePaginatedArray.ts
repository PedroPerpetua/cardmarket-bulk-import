import { useCallback, useState } from 'react';

export function buildIndexArr(
  currentPage: number,
  totalPages: number,
  maxPages: number,
): (number | '...Start' | '...End')[] {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '...Start' | '...End')[] = [];
  const middleCount = maxPages - 2; // Excluding first and last
  const half = Math.floor(middleCount / 2);

  let start = Math.max(2, currentPage - half);
  const end = Math.min(totalPages - 1, start + middleCount - 1);

  // Readjust if we hit the end
  start = Math.max(2, end - middleCount + 1);

  pages.push(1);
  if (start > 2) {
    pages.push('...Start');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push('...End');
  }

  pages.push(totalPages);

  return pages;
}

export function paginateArray<T>(arr: T[], itemsPerPage: number) {
  const totalPages = Math.max(1, Math.ceil((arr ?? []).length / itemsPerPage));
  const indexArr = Array.from({ length: totalPages }, (_, i) => i + 1);
  const getPageLimits = (pageNumber: number) => {
    const start = (pageNumber - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return [start, end];
  };
  const getPage = (pageNumber: number) => {
    const [start, end] = getPageLimits(pageNumber);
    return arr.slice(start, end);
  };
  return { totalPages, indexArr, getPageLimits, getPage };
}

type Options = {
  initialPage: number,
  rowsPer: number,
  maxPages: number,
};

function usePaginatedArray<T>(array: T[], opts?: Partial<Options>) {
  const initialPage = opts?.initialPage ?? 1;
  const rowsPer = opts?.rowsPer ?? 10;
  const [page, setPage] = useState(initialPage);
  const { totalPages, indexArr, getPage } = paginateArray(array, rowsPer);

  const setPageClamped = useCallback((newPage: number) => {
    setPage(Math.min(Math.max(1, newPage), totalPages));
  }, [totalPages]);

  const currentPage = getPage(page);
  const emptySlots = rowsPer - currentPage.length;

  return {
    pageNumber: page,
    setPage: setPageClamped,
    currentPage,
    emptySlots,
    emptyArr: Array.from({ length: emptySlots }).map((_, i) => i),
    totalPages,
    indexArr: opts?.maxPages ? buildIndexArr(page, totalPages, opts.maxPages) : indexArr,
  };
}

export default usePaginatedArray;
