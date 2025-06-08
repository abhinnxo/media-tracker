
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Film, Tv, Book, Zap, BookOpen } from 'lucide-react';
import { MediaCategory, MediaStatus } from '@/lib/types';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: MediaCategory;
  totalCount: number;
  statusBreakdown: Record<MediaStatus, number>;
  onQuickAdd: (category: MediaCategory) => void;
}

const getCategoryIcon = (category: MediaCategory) => {
  switch (category) {
    case MediaCategory.MOVIE:
      return <Film className="h-6 w-6" />;
    case MediaCategory.TV_SERIES:
      return <Tv className="h-6 w-6" />;
    case MediaCategory.ANIME:
      return <Zap className="h-6 w-6" />;
    case MediaCategory.BOOK:
      return <Book className="h-6 w-6" />;
    case MediaCategory.MANGA:
      return <BookOpen className="h-6 w-6" />;
    default:
      return <Film className="h-6 w-6" />;
  }
};

const getCategoryName = (category: MediaCategory): string => {
  switch (category) {
    case MediaCategory.MOVIE:
      return 'Movies';
    case MediaCategory.TV_SERIES:
      return 'TV Series';
    case MediaCategory.ANIME:
      return 'Anime';
    case MediaCategory.BOOK:
      return 'Books';
    case MediaCategory.MANGA:
      return 'Manga';
    default:
      return category;
  }
};

const getStatusColor = (status: MediaStatus): string => {
  switch (status) {
    case MediaStatus.COMPLETED:
      return 'text-green-600 dark:text-green-400';
    case MediaStatus.IN_PROGRESS:
      return 'text-blue-600 dark:text-blue-400';
    case MediaStatus.TO_CONSUME:
      return 'text-purple-600 dark:text-purple-400';
    case MediaStatus.ON_HOLD:
      return 'text-orange-600 dark:text-orange-400';
    case MediaStatus.DROPPED:
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusLabel = (status: MediaStatus): string => {
  switch (status) {
    case MediaStatus.TO_CONSUME:
      return 'Planned';
    case MediaStatus.IN_PROGRESS:
      return 'In Progress';
    case MediaStatus.COMPLETED:
      return 'Completed';
    case MediaStatus.ON_HOLD:
      return 'On Hold';
    case MediaStatus.DROPPED:
      return 'Dropped';
    default:
      return status;
  }
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  totalCount,
  statusBreakdown,
  onQuickAdd
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {getCategoryIcon(category)}
          <CardTitle className="text-lg font-medium">
            {getCategoryName(category)}
          </CardTitle>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onQuickAdd(category)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{totalCount}</div>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </div>
          
          <div className="space-y-2">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm">{getStatusLabel(status as MediaStatus)}</span>
                <span className={`text-sm font-medium ${getStatusColor(status as MediaStatus)}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
