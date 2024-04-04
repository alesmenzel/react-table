import { ReactNode } from 'react';
import { ColumnFilter } from './use-column-filters';
import { ColumnSort } from './use-column-sorts';

export type RowConstraint = Record<string, unknown>;

export type Column<
  Row extends RowConstraint,
  Key extends string = string,
  ColumnValue = any,
  FilterValue = any
> = {
  key: Key;
  getValue?: (row: Row) => ColumnValue;
  filterFn?: ColumnFilter<Row, ColumnValue, FilterValue>['filterFn'];
  sortFn?: ColumnSort<Row, ColumnValue>['sortFn'];
  Header: () => ReactNode;
  Cell: ({ value, row }: { value: ColumnValue; row: Row }) => ReactNode;
  Footer?: () => ReactNode;
};

export function createTableInitialHelpers<
  Row extends Record<string, unknown>
>() {
  function createColumns(
    ...columns: (Column<Row> | undefined | false | null)[]
  ) {
    return columns.filter(Boolean) as Column<Row>[];
  }

  function createColumn(column: Column<Row>) {
    return column;
  }

  return {
    createColumns,
    createColumn,
  };
}

export function createTableHelpers<Row extends RowConstraint>(
  columns: Column<Row>[]
) {
  function createColumnFilter(
    key: typeof columns[number]['key'],
    filterFn,
    value
  ) {
    return {
      filterFn: (row: Row) => {
        return filterFn(row[key], value);
      },
    };
  }

  function createGlobalFilter(filterFn, value: string) {
    return {
      filterFn: (row: Row) => {
        filterFn(row, value);
      },
    };
  }

  return {
    createColumnFilter,
    createGlobalFilter,
  };
}
