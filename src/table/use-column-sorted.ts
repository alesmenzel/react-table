import { useMemo } from 'react';
import { Column, RowConstraint } from './table-utils';
import { ColumnSort } from './use-column-sorts';

export type UseColumnSortedParams<Row extends RowConstraint, Value> = {
  items: Row[];
  sorts: ColumnSort<Row, Value>[];
  columns: Column<Row>[];
};

export type UseColumnSortedOutput<Row extends RowConstraint> = Row[];

export function useColumnSorted<Row extends RowConstraint, Value = any>({
  items,
  sorts,
  columns,
}: UseColumnSortedParams<Row, Value>): UseColumnSortedOutput<Row> {
  const columnsMap = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    []
  );

  return useMemo((): Row[] => {
    if (!items.length || !sorts.length) return items;

    return items.toSorted((rowA, rowB) => {
      for (const sort of sorts) {
        const columnDef = columnsMap.get(sort.id);
        if (!columnDef) {
          console.warn(
            '[DEV] Tried to sort by %s, but the column does not exist.',
            sort.id
          );
          return;
        }
        if (!columnDef.sortFn) {
          console.warn(
            '[DEV] Tried to sort by %s, but the column does not have a sortFn defined.',
            sort.id
          );
          return;
        }
        let result = sort.sortFn({
          rowA,
          rowB,
          valueA: columnDef.getValue?.(rowA),
          valueB: columnDef.getValue?.(rowB),
        });
        if (result === 0) continue;
        if (sort.desc) result *= -1;
        return result;
      }
      return 0; // All sorts report the items as equal.
    });
  }, [items, sorts, columnsMap]);
}
