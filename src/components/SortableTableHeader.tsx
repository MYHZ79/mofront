import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort: (key: string) => void;
  className?: string;
}

export function SortableTableHeader({ 
  label, 
  sortKey, 
  currentSort, 
  onSort, 
  className = '' 
}: SortableTableHeaderProps) {
  const isActive = currentSort.key === sortKey;
  const direction = currentSort.direction;

  const getSortIcon = () => {
    if (!isActive) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-500" />;
    }
    
    return direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-red-500" />
      : <ChevronDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <th 
      className={`
        text-right py-3 px-4 cursor-pointer select-none group
        hover:bg-gray-800/30 transition-colors duration-200
        ${isActive ? 'text-red-400' : 'text-gray-300 hover:text-white'}
        ${className}
      `}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{label}</span>
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
          {getSortIcon()}
        </div>
      </div>
    </th>
  );
}