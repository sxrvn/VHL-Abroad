import React from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

function Table<T extends Record<string, any>>({ 
  data, 
  columns, 
  onRowClick,
  emptyMessage = 'No data available',
  loading = false 
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-white/5 rounded-xl border border-charcoal/10 dark:border-white/10">
        <span className="material-symbols-outlined text-5xl opacity-20">inbox</span>
        <p className="mt-3 text-sm opacity-60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal/10 dark:border-white/10">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`text-left px-4 py-3 text-sm font-semibold opacity-60 ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-charcoal/10 dark:border-white/10 last:border-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5' : ''
                } transition-colors`}
              >
                {columns.map((column, colIndex) => {
                  const value = column.key.toString().split('.').reduce((obj, key) => obj?.[key], row);
                  return (
                    <td key={colIndex} className={`px-4 py-4 ${column.className || ''}`}>
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick?.(row)}
            className={`bg-white dark:bg-white/5 rounded-xl border border-charcoal/10 dark:border-white/10 p-4 ${
              onRowClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/20' : ''
            } transition-all`}
          >
            {columns.map((column, colIndex) => {
              const value = column.key.toString().split('.').reduce((obj, key) => obj?.[key], row);
              return (
                <div key={colIndex} className="mb-3 last:mb-0">
                  <p className="text-xs opacity-60 mb-1">{column.label}</p>
                  <div className="text-sm font-semibold">
                    {column.render ? column.render(value, row) : value}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Table;
