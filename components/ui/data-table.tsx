import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  /** Optional unique id for React keys (use when multiple columns share same data key). */
  id?: string;
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  title: string;
  description?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
  loading?: boolean;
  selectable?: boolean;
  rowId?: (row: T) => string | number;
  onSelectionChange?: (selected: T[]) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  description,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onAddClick,
  loading = false,
  selectable = false,
  rowId,
  onSelectionChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const getRowStableId = (row: T, idx: number): string | number => {
    const raw = rowId ? rowId(row) : idx;
    // Avoid React key collisions like `undefined`/`null`.
    return raw === undefined || raw === null || raw === '' ? idx : raw;
  };

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSelectAll = () => {
    const allIds = data.map((row, idx) => getRowStableId(row, idx));
    const next = selectedRows.size === data.length ? new Set<string | number>() : new Set(allIds);
    setSelectedRows(next);
    onSelectionChange?.(data.filter((row, idx) => next.has(getRowStableId(row, idx))));
  };

  const toggleSelectRow = (row: T, idx: number) => {
    const id = getRowStableId(row, idx);
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((r, i) => newSelected.has(getRowStableId(r, i))));
  };

  const renderDefaultCell = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-sm text-gray-400 mt-1.5">{description}</p>
            )}
          </div>
          {onAddClick && (
            <Button onClick={onAddClick} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-5 w-5" />
              Add New
            </Button>
          )}
        </div>

        {onSearchChange && (
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 focus:border-blue-500"
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/30 bg-blue-500/5">
                {selectable && (
                  <th className="px-4 py-3 w-12">
                    <Checkbox
                      checked={selectedRows.size === data.length && data.length > 0}
                      onCheckedChange={() => toggleSelectAll()}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id ?? String(column.key)}
                    className={cn(
                      'px-5 py-3 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider',
                      column.width
                    )}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-2 hover:text-foreground transition-all duration-200"
                      >
                        {column.label}
                        {sortKey === column.key && (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-muted-foreground">
                    No data found
                  </td>
                </tr>
              ) : (
                sortedData.map((row, idx) => (
                  <tr
                    key={String(getRowStableId(row, idx))}
                    className={cn(
                      'border-b border-white/5 hover:bg-blue-500/10 transition-all duration-200',
                      idx % 2 === 0 && 'bg-white/2',
                      selectedRows.has(getRowStableId(row, idx)) && 'bg-blue-500/20'
                    )}
                  >
                    {selectable && (
                      <td className="px-5 py-4 w-12">
                        <Checkbox
                          checked={selectedRows.has(getRowStableId(row, idx))}
                          onCheckedChange={() => toggleSelectRow(row, idx)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id ?? String(column.key)}
                        className={cn('px-5 py-3 text-gray-300 text-sm', column.width)}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : renderDefaultCell(row[column.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
