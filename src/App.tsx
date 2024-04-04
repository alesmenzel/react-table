import { createTableInitialHelpers } from './table/table-utils';
import { useDebounced } from './table/use-debounced';
import { useSearch } from './table/use-search';
import { useSelected } from './table/use-selected';
import { useColumnFilters } from './table/use-column-filters';
import { useColumnFiltered } from './table/use-column-filtered';
import { useColumnSorts } from './table/use-column-sorts';
import { useColumnSorted } from './table/use-column-sorted';
import { useGlobalFilter } from './table/use-global-filter';
import { ReactNode, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ITEMS, PersonRow } from './data';

const DEBUG = false;

function globalSearch(rows: PersonRow[], search: string) {
  const searchLowerCase = search.toLowerCase();
  return rows.filter((row) => row.index.includes(searchLowerCase));
}

const TableHeader = ({ children }: { children: ReactNode }) => <>{children}</>;

function makeHeader(label: string) {
  return () => <TableHeader>{label}</TableHeader>;
}

const { createColumns, createColumn } = createTableInitialHelpers<PersonRow>();

const columns = createColumns(
  createColumn({
    key: 'id',
    Header: makeHeader('Id'),
    Cell: ({ value }) => value,
    getValue: (row) => row.id,
    filterFn: ({ row, filterValue }) => row.id === filterValue,
    sortFn: ({ valueA, valueB }) => valueA.localeCompare(valueB),
  }),
  createColumn({
    key: 'person',
    Header: makeHeader('Person'),
    Cell: ({ value }) => (
      <div>
        <div>
          {value.firstName} {value.lastName}
        </div>
        <div>{value.email}</div>
      </div>
    ),
    getValue: (row) => row.person,
    filterFn: ({ row, filterValue }) =>
      row.personSearchIndex.includes(filterValue),
    sortFn: ({ rowA, rowB }) =>
      rowA.personSortValue.localeCompare(rowB.personSortValue),
  }),
  createColumn({
    key: 'firstName',
    Header: makeHeader('First Name'),
    Cell: ({ value }) => value,
    getValue: (row) => row.firstName,
    filterFn: ({ row, filterValue }) =>
      row.firstNameLowerCased.includes(filterValue),
    sortFn: ({ valueA, valueB }) => valueA.localeCompare(valueB),
  }),
  createColumn({
    key: 'lastName',
    Header: makeHeader('Last Name'),
    Cell: ({ value }) => value,
    getValue: (row) => row.lastName,
    filterFn: ({ row, filterValue }) =>
      row.lastNameLowerCased.includes(filterValue),
    sortFn: ({ valueA, valueB }) => valueA.localeCompare(valueB),
  }),
  createColumn({
    key: 'email',
    Header: makeHeader('Email'),
    Cell: ({ value }) => value,
    getValue: (row) => row.email,
    filterFn: ({ row, filterValue }) =>
      row.emailLowerCased.includes(filterValue),
    sortFn: ({ valueA, valueB }) => valueA.localeCompare(valueB),
  }),
  createColumn({
    key: 'usage',
    Header: makeHeader('Usage'),
    Cell: ({ value }) => value,
    getValue: (row) => row.usage,
    filterFn: ({ columnValue, filterValue }) => columnValue === filterValue,
    sortFn: ({ valueA, valueB }) => valueB - valueA,
    // TODO_sortNulls: 'first' | 'last' | undefined
    // TODO_sortInverse: boolean // invert asc/desc
  })
);

function App() {
  // TODO: Selection
  const { selected } = useSelected({ options: ITEMS.map((item) => item.id) });

  // Global filter
  const { search, setSearch } = useSearch();
  const { debouncedSearch, updateSearch } = useDebounced({
    onChange: setSearch,
  });
  const globallyFiltered = useGlobalFilter({
    items: ITEMS,
    globalFilter: globalSearch,
    search: debouncedSearch,
  });

  // Column filters
  const { filters, setColumnFilter, removeFilter } =
    useColumnFilters<PersonRow>({
      columns,
    });
  const filtered = useColumnFiltered({
    items: globallyFiltered,
    filters,
    columns,
  });

  // Sorting
  const { sorts, sortsMap, cycleSort } = useColumnSorts<PersonRow>({
    columns,
    // TODO_allowMultisort: false,
    // TODO_sortCycle: ['asc', 'desc', null],
    // TODO_allowSortRemoval: false,
  });
  const sorted = useColumnSorted({ items: filtered, sorts, columns });

  // TODO: Grouping
  // const { groupBys, setGroupBy, ... } = useGroupBys()
  // const grouped = useGrouped({ groupBys })

  // Virtualizing
  const parentRef = useRef<HTMLTableElement>(null);
  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 20,
  });

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <input
        value={search}
        onChange={(e) => updateSearch(e.currentTarget.value)}
        placeholder="Global search ..."
      />
      <div ref={parentRef} style={{ flex: '1 1', overflow: 'auto' }}>
        <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                {columns.map((column) => {
                  const sort = sortsMap.get(column.key);

                  return (
                    <th key={column.key}>
                      <div>{column.Header()}</div>
                      <input
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          if (!value) {
                            removeFilter(column.key);
                            return;
                          }
                          // NOTE: In real app, you would define a component for each type (e.g. SearchExactInput, SearchIncludesInput, NumberInput, RangeInput etc.)
                          if (column.key === 'id') {
                            setColumnFilter(column.key, value);
                            return;
                          }
                          if (column.key === 'usage') {
                            setColumnFilter(column.key, Number(value));
                            return;
                          }
                          setColumnFilter(
                            column.key,
                            value.toLocaleLowerCase()
                          );
                        }}
                      />
                      {/* // TODO: Table could provide the cycle / getNextDirection so user can display the reverse instead of showing the current direction. */}
                      <button onClick={() => cycleSort(column.key)}>
                        Sorted {sort ? (sort.desc ? '↑desc' : '↓asc') : '-'}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {virtualizer.getVirtualItems().map((virtualRow, index) => {
                const row = sorted[virtualRow.index];

                return (
                  <tr
                    key={row.id}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${
                        virtualRow.start - index * virtualRow.size
                      }px)`,
                    }}
                    // ref={virtualizer.measureElement}
                  >
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.Cell({ row, value: column.getValue?.(row) })}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {DEBUG && (
        <>
          Columns
          <pre>{JSON.stringify(columns, null, 2)}</pre>
          Items
          <pre>{JSON.stringify(ITEMS, null, 2)}</pre>
          Globally filtered
          <pre>{JSON.stringify(globallyFiltered, null, 2)}</pre>
          Column filters
          <pre>{JSON.stringify(filters, null, 2)}</pre>
          Column filtered
          <pre>{JSON.stringify(filtered, null, 2)}</pre>
          Sorts
          <pre>{JSON.stringify(sorts, null, 2)}</pre>
          Sorted
          <pre>{JSON.stringify(sorted, null, 2)}</pre>
          Selected
          <pre>{JSON.stringify(selected, null, 2)}</pre>
        </>
      )}
    </div>
  );
}

export default App;
