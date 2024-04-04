import { useMemo } from 'react';
import { Column, RowConstraint } from './table-utils';
import { ColumnFilter } from './use-column-filters';

export type UseColumnFilteredParams<Row extends RowConstraint> = {
  items: Row[];
  filters: ColumnFilter<Row>[];
  columns: Column<Row>[];
};

export type UseColumnFilteredOutput<Row extends RowConstraint> = Row[];

export function useColumnFiltered<Row extends RowConstraint>({
  items,
  filters,
  columns,
}: UseColumnFilteredParams<Row>): UseColumnFilteredOutput<Row> {
  // TODO: Used by a lot of hooks, could just accept the Map instead
  const columnsMap = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns]
  );
  return useMemo((): Row[] => {
    if (!items.length || !filters.length) return items;

    return items.filter((row) =>
      filters.every((filter) => {
        const columnDef = columnsMap.get(filter.id);
        return filter.filterFn({
          row,
          columnValue: columnDef?.getValue?.(row),
          filterValue: filter.value,
        });
      })
    );
  }, [items, filters]);
}
