import { useCallback, useMemo, useState } from 'react';
import { Column, RowConstraint } from './table-utils';

export type ColumnFilter<Row extends RowConstraint, ColumnValue, FilterValue> = {
  id: string;
  value: ColumnValue
  filterFn: (data: {row: Row, columnValue: ColumnValue, filterValue: FilterValue}) => boolean;
};

export type UseColumnFiltersParams<Row extends RowConstraint, ColumnValue, FilterValue> = {
  initial?: ColumnFilter<Row, ColumnValue, FilterValue>[];
  columns: Column<Row>[]
};

export function useColumnFilters<Row extends RowConstraint, ColumnValue = any, FilterValue = any>({
  initial = [],
  columns,
}: UseColumnFiltersParams<Row, ColumnValue, FilterValue>) {
  const columnsMap = useMemo(() => new Map(columns.map(column => [column.key, column])), [])
  const [filters, setFilters] = useState(initial);

  const setFilter = useCallback(
    (id: string, filterFn: ColumnFilter<Row, ColumnValue, FilterValue>['filterFn'], value: any) => {
      setFilters((filters) => {
        const updatedFilters = [];
        let found = false;
        for (const filter of filters) {
          // update filter
          if (filter.id === id) {
            updatedFilters.push({ id, filterFn, value } satisfies ColumnFilter<Row, ColumnValue, FilterValue>);
            found = true;
            continue;
          }

          updatedFilters.push(filter);
        }
        if (found) return updatedFilters;

        // new filter
        return [...filters, { id, filterFn, value } satisfies ColumnFilter<Row, ColumnValue, FilterValue>];
      });
    },
    []
  );

  const setColumnFilter = useCallback((id: string, value: any) => {
    const columnDef = columnsMap.get(id)
    if (!columnDef) {
      console.warn('[DEV] Tried to filter by %s, but the column does not exist.', id)
      return
    }
    if (!columnDef.filterFn) {
      console.warn('[DEV] Tried to filter by %s, but the column does not have a filterFn defined.', id)
      return
    }
    setFilter(id, columnDef.filterFn, value)
  }, [])

  const updateFilter = useCallback((id: string, value: any) => {
    setFilters(filters => {
      const updatedFilters = [];
      let found = false;
      for (const filter of filters) {
        if (filter.id === id) {
          updatedFilters.push({...filter, value} satisfies ColumnFilter<Row, ColumnValue, FilterValue>)
          found= true
          continue
        }
        updatedFilters.push(filter)
      }
      if (found) return updatedFilters
      return filters
    })
  }, [])

  const removeFilter = useCallback((id: string) => {
    return setFilters((filters) =>
      filters.filter((filter) => filter.id !== id)
    );
  }, []);

  const resetFilters = useCallback(() => {
    return setFilters(initial);
  }, [initial])

  const clearFilters = useCallback(() => {
    return setFilters([]);
  }, [])

  return {
    filters,
    setFilters,
    setFilter,
    setColumnFilter,
    updateFilter,
    removeFilter,
    resetFilters,
    clearFilters,
  };
}
