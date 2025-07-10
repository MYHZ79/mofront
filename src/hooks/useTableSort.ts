import { useState, useMemo } from 'react';
import { Goal } from '../types/api';
import { getGoalPriority } from '../components/GoalStatusDisplay';
import { toTomans } from '../config/constants';

type SortKey = 'title' | 'amount' | 'deadline' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export function useTableSort(data: Goal[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'deadline',
    direction: 'desc' // Assuming 'desc' for most recent goals first
  });

  const sortedData = useMemo(() => {
    if (!data.length) return data;

    const sorted = [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'title':
          aValue = a.goal?.toLowerCase() || '';
          bValue = b.goal?.toLowerCase() || '';
          break;
        
        case 'amount':
          aValue = a.value ? toTomans(a.value) : 0;
          bValue = b.value ? toTomans(b.value) : 0;
          break;
        
        case 'deadline':
          aValue = a.deadline || 0;
          bValue = b.deadline || 0;
          break;
        
        case 'status':
          aValue = getGoalPriority(a);
          bValue = getGoalPriority(b);
          break;
        
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return {
    sortedData,
    sortConfig,
    handleSort
  };
}
