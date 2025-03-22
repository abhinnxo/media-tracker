
import React, { useState } from 'react';
import { MediaCategory, MediaStatus, MediaFilterOptions } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatedTransition } from './AnimatedTransition';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface MediaFiltersProps {
  onFilterChange: (filters: MediaFilterOptions) => void;
  className?: string;
}

export const MediaFilters: React.FC<MediaFiltersProps> = ({ 
  onFilterChange, 
  className 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<MediaFilterOptions>({
    category: null,
    status: null,
    search: '',
    tags: [],
  });

  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: MediaCategory.MOVIE, label: 'Movies' },
    { value: MediaCategory.TV_SERIES, label: 'TV Series' },
    { value: MediaCategory.ANIME, label: 'Anime' },
    { value: MediaCategory.BOOK, label: 'Books' },
    { value: MediaCategory.MANGA, label: 'Manga' },
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: MediaStatus.TO_CONSUME, label: 'To Watch/Read' },
    { value: MediaStatus.IN_PROGRESS, label: 'In Progress' },
    { value: MediaStatus.COMPLETED, label: 'Completed' },
    { value: MediaStatus.ON_HOLD, label: 'On Hold' },
    { value: MediaStatus.DROPPED, label: 'Dropped' },
  ];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    const newFilters = { ...filters, search };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    const category = value ? value as MediaCategory : null;
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    const status = value ? value as MediaStatus : null;
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Reset all filters
  const handleReset = () => {
    const newFilters = {
      category: null,
      status: null,
      search: '',
      tags: [],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = filters.category || filters.status || filters.search || (filters.tags && filters.tags.length > 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search media..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Toggle filters button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="relative"
        >
          <Filter size={18} />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
        
        {/* Reset button (only visible when filters are active) */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1 text-xs"
          >
            <X size={14} />
            Reset
          </Button>
        )}
      </div>
      
      {/* Expandable filters */}
      {expanded && (
        <AnimatedTransition variant="slideUp" className="flex flex-wrap gap-2">
          {/* Category filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {filters.category 
                  ? categoryOptions.find(opt => opt.value === filters.category)?.label 
                  : 'Category'}
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={filters.category || ''} 
                onValueChange={handleCategoryChange}
              >
                {categoryOptions.map((option) => (
                  <DropdownMenuRadioItem 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {filters.status 
                  ? statusOptions.find(opt => opt.value === filters.status)?.label 
                  : 'Status'}
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={filters.status || ''} 
                onValueChange={handleStatusChange}
              >
                {statusOptions.map((option) => (
                  <DropdownMenuRadioItem 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </AnimatedTransition>
      )}
    </div>
  );
};

export default MediaFilters;
