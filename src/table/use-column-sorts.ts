import { useCallback, useMemo, useState } from 'react';
import { Column, RowConstraint } from './table-utils';

export type ColumnSort<Row extends RowConstraint, Value> = {
  id: string;
  desc?: boolean
  sortFn: (data: {rowA: Row, rowB: Row, valueA: Value, valueB: Value}) => number;
};

export type UseColumnSortsParams<Row extends RowConstraint, Value> = {
  initial?: ColumnSort<Row, Value>[];
  columns: Column<Row>[]
};

export function useColumnSorts<Row extends RowConstraint, Value = any>({
  initial = [],
  columns,
}: UseColumnSortsParams<Row, Value>) {
  const columnsMap = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns]
  );

  const [sorts, setSorts] = useState(initial);
  const sortsMap = useMemo(() => new Map(sorts.map(sort => [sort.id, sort])), [sorts])

  const setSort = useCallback(
    (id: string, sortFn: ColumnSort<Row, Value>['sortFn'], desc?: boolean) => {
      setSorts((filters) => {
        const updatedFilters = [];
        let found = false;
        for (const filter of filters) {
          // update sort
          if (filter.id === id) {
            updatedFilters.push({ id, sortFn, desc } satisfies ColumnSort<Row, Value>);
            found = true;
            continue;
          }

          updatedFilters.push(filter);
        }
        if (found) return updatedFilters;

        // new sort
        return [...filters, { id, sortFn, desc } satisfies ColumnSort<Row, Value>];
      });
    },
    []
  );

  // ASC -> DESC -> remove
  const cycleSort = useCallback((id: string) => {
    setSorts((sorts) => {
      const updatedSorts = [];
      let found = false;
      for (const sort of sorts) {
        // update sort
        if (sort.id === id) {
          if (!sort.desc) {
            updatedSorts.push({ ...sort, desc: true } satisfies ColumnSort<Row, Value>);
          }
          found = true;
          continue;
        }

        updatedSorts.push(sort);
      }
      if (found) return updatedSorts;

      const columnDef = columnsMap.get(id)
      if (!columnDef) {
        console.warn('[DEV] Tried to cycle sort by %s, but the column does not exist.', id)
        return sorts
      }
      if (!columnDef.sortFn) {
        console.warn('[DEV] Tried to cycle sort by %s, but the column does not have a sortFn defined.', id)
        return sorts
      }
      return [...sorts, { id, sortFn: columnDef.sortFn } satisfies ColumnSort<Row, Value>]
    });
  }, [])

  const updateSort = useCallback((id: string, desc: boolean) => {
    setSorts(sorts => {
      const updatedSorts = [];
      let found = false;
      for (const sort of sorts) {
        if (sort.id === id) {
          updatedSorts.push({...sort, desc} satisfies ColumnSort<Row, Value>)
          found= true
          continue
        }
        updatedSorts.push(sort)
      }
      if (found) return updatedSorts
      return sorts
    })
  }, [])

  const removeSort = useCallback((id: string) => {
    return setSorts((sorts) =>
      sorts.filter((sort) => sort.id !== id)
    );
  }, []);

  const resetSorts = useCallback(() => {
    return setSorts(initial);
  }, [initial])

  const clearSorts = useCallback(() => {
    return setSorts([]);
  }, [])

  return {
    sorts,
    sortsMap,
    setSorts,
    setSort,
    updateSort,
    cycleSort,
    removeSort,
    resetSorts,
    clearSorts,
  };
}
