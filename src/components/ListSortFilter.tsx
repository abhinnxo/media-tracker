
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, SortAsc, Filter, X } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  dateRange: string;
  showMetadata: boolean;
}

interface ListSortFilterProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  filter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  itemCount: number;
}

const sortOptions: SortOption[] = [
  { value: 'position', label: 'Custom Order' },
  { value: 'date-newest', label: 'Recently Added' },
  { value: 'date-oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'rating-high', label: 'Highest Rated' },
  { value: 'rating-low', label: 'Lowest Rated' }
];

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 3 Months' }
];

export const ListSortFilter: React.FC<ListSortFilterProps> = ({
  sortBy,
  onSortChange,
  filter,
  onFilterChange,
  itemCount
}) => {
  const hasActiveFilters = filter.dateRange !== 'all';

  const clearFilters = () => {
    onFilterChange({
      dateRange: 'all',
      showMetadata: filter.showMetadata
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between py-3 border-b">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={filter.dateRange} 
            onValueChange={(value) => onFilterChange({ ...filter, dateRange: value })}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange({ ...filter, showMetadata: !filter.showMetadata })}
          className="h-8"
        >
          <CalendarDays className="h-3 w-3 mr-1" />
          {filter.showMetadata ? 'Hide' : 'Show'} Details
        </Button>
        
        <Badge variant="secondary" className="text-xs">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>
    </div>
  );
};
