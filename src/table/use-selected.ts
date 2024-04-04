import { useCallback, useMemo, useState } from 'react';

export type UseSelectedParams<T extends string | number = string> = {
  options: T[];
  initial?: T[];
  // hooks for composing nested selectable lists
  onSelect?: (items: T[]) => void;
  onUnselect?: (items: T[]) => void;
};

export function useSelected<T extends string | number = string>({
  options,
  initial = [],
  onSelect,
  onUnselect,
}: UseSelectedParams<T>) {
  // TODO: Could be useControlled state for composition instead of hooks
  const [selected, _setSelected] = useState<T[]>(initial);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const setSelected = useCallback((items: T[]) => {
    _setSelected((selected) => [...selected, ...items]);
    onSelect?.(items);
  }, []);

  const toggleItem = useCallback((item: T) => {
    _setSelected((selected) => {
      if (!selectedSet.has(item)) {
        return [...selected, item];
      }
      return selected;
    });
    onSelect?.([item]);
  }, []);

  const selectItem = useCallback((item: T) => {
    _setSelected((selected) => {
      if (!selectedSet.has(item)) {
        return [...selected, item];
      }
      return selected;
    });
    onSelect?.([item]);
  }, []);

  const unselectItem = useCallback((item: T) => {
    _setSelected((selected) => {
      if (selectedSet.has(item)) {
        return selected.filter((selectedItem) => selectedItem !== item);
      }
      return selected;
    });
    onUnselect?.([item]);
  }, []);

  const isSelected = useCallback(
    (item: T) => selectedSet.has(item),
    [selectedSet]
  );

  const areAllSelected = selected.length === options.length;

  const allSelectedState = useMemo(() => {
    if (areAllSelected) return 'checked';
    if (selected.length > 0) return 'indeterminate';
    return 'unchecked';
  }, [areAllSelected, selected]);

  const toggleAll = useCallback(() => {
    _setSelected(areAllSelected ? [] : options);
  }, [areAllSelected, options]);

  const selectAll = useCallback(() => {
    _setSelected(options);
  }, [options]);

  const unselectAll = useCallback(() => {
    _setSelected([]);
  }, []);

  return {
    selected,
    selectedSet,
    setSelected,
    toggleItem,
    selectItem,
    unselectItem,
    isSelected,
    areAllSelected,
    allSelectedState,
    toggleAll,
    selectAll,
    unselectAll,
  };
}
