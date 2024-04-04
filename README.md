# @alesmenzel/react-table

The idea is to come up with a simple extendable table design by using optional hooks to compose the exact table behaviour that you need for given usecase.

## Initial ideas

```tsx
// Columns
const columns = [
  {
    key: 'columm_a',
    getValue: (row) => row.profile,
    // Could be defined outside
    globalFilterFn: createObjectContains({ id: stringEqual, name: stringContains, username: stringContains }),
    // Could be defined outside
    sortFn: createLocaleCompare((value, row) => value.name),
    Header: () => {},
    Cell: ({value, row}) => {},
    Footer: () => {},
  },
  {
    key: 'columm_b',
    getValue: (row) => row.name,
    globalFilterFn: stringContains,
    sortFn: localeCompare,
    Header: () => {},
    Cell: ({value, row}) => {},
  },
  {
    key: 'columm_c',
    getValue: (row) => row.labels,
    // not filterable by createColumnFilter
    // globalFilterFn: createArrayContains(createObjectContains({ id: stringEqual, name: stringContains })),
    // sortFn: localeCompare, -> not sortable
    Header: () => {},
    Cell: ({value, row}) => {},
  }
]

// optional for TS types
const { createColumns, createColumn, createColumnFilter, createGlobalFilter } = createTableHelpers<SomeType>()

const columns = createColumns(
  createColumn({ ... }),
  createColumn({ ... }),
  something && createColumn({ ... }),
  createColumn({ ... }),
  createColumn({ ... }),
)

// Selectable
const { selectedIds, setSelected, selectItem, unselectItem, selectItems, unselectItems, selectedSet, selectedRef, isSelected, areAllSelected, allSelectedState, selectAll } = useSelectableList({ selectableIds })

// Global search
const { search, setSearch, resetSearch, clearSearch } = useSearch({ initialSearch: '' })

// Filterable
const { filters, setFilters, setFilter, addFilter, removeFilter, resetFilters, clearFilters } = useFilters({ initialFilters: [(items) => items.filter(item => true)] })
const { filtered } = useFilterableList({ items, filters })

const { debouncedSearch, setDebouncedSearch } = useDebounced({
  initialDebouncedValue: search,
  onChange(search) {
    // Call through the original fn to update the UI
    setSearch(search)
  },
  onDebounce(debouncedSearch) {
    // Set the global filter
    setFilter('global', createGlobalFilter(columns, debouncedSearch))
  }
})

// id - can be used to update a specific filter
setFilter('profile', createColumnFilter('profile', createObjectContains({ id: stringEqual, name: stringContains, username: stringContains }), 'some filter value'))
setFilter('profile', createColumnFilter('profile', createObjectMatch, { id: 'something', name: 'something else' }))

// Groupable
const { groups, setGroupBy } = useGroupable({ rows: filtered })

setGroupBy('profile', { getGroup: (row) => row.profile.network + '-' + row.profile.profileId })

// Sortable
const { orders, setOrders, setOrder, addOrder, toggleOrder } = useOrders({ initialOrders: [{ compare: (itemA, itemB) => localeCompare(itemA.profile.name, itemB.profile.name, { missing: 'last | first' }), desc: false }] })
const { sorted } = useSortableList({ items, selectedIds, orders })
// when used with groups OR we could use the sortable list per group when rendering the group
useGroupableSort()

setOrder('profile', createColumnOrder('profile', nestedValueOrder((value) => value.name), localeCompare))

// Virtualized
const { rows } = useVirtualized()
```
