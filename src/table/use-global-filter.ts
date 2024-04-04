import { useMemo } from 'react';
import { RowConstraint } from './table-utils';

export type GlobalFilter<Row extends RowConstraint, Search> = (
  rows: Row[],
  value: Search
) => Row[];

export type UseGlobalFilterParams<Row extends RowConstraint, Search> = {
  items: Row[];
  search?: Search;
  globalFilter: GlobalFilter<Row, Search>;
};

export type UseGlobalFilterOutput<Row extends RowConstraint> = Row[];

export function useGlobalFilter<Row extends RowConstraint, Search>({
  items,
  search,
  globalFilter,
}: UseGlobalFilterParams<Row, Search>): UseGlobalFilterOutput<Row> {
  return useMemo((): Row[] => {
    if (!globalFilter || !search) return items;
    return globalFilter(items, search);
  }, [items, globalFilter, search]);
}
