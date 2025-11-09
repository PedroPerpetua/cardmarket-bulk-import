import { useCallback, useState } from 'react';

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
};

function usePaginatedArray<T>(array: T[], opts?: Options) {
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
    indexArr,
  };
}

export default usePaginatedArray;
