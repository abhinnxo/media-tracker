
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type EmptyStateType = 'noItems' | 'noResults' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'noItems',
  title,
  description,
  actionLabel,
  actionLink = '/add',
  className,
}) => {
  // Default content based on type
  const content = {
    noItems: {
      icon: PlusCircle,
      title: title || 'No Media Items Yet',
      description: description || 'Start building your collection by adding your first media item.',
      actionLabel: actionLabel || 'Add Your First Item',
    },
    noResults: {
      icon: Search,
      title: title || 'No Results Found',
      description: description || 'Try adjusting your search or filters to find what you're looking for.',
      actionLabel: actionLabel || 'Reset Filters',
    },
    error: {
      icon: AlertCircle,
      title: title || 'Something Went Wrong',
      description: description || 'There was an error. Please try again later.',
      actionLabel: actionLabel || 'Try Again',
    },
  };

  const { icon: Icon, ...contentProps } = content[type];

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card/50 border border-border",
        className
      )}
    >
      <Icon 
        className="text-muted-foreground mb-4" 
        size={48}
      />
      <h3 className="text-lg font-medium mb-2">
        {contentProps.title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {contentProps.description}
      </p>
      {contentProps.actionLabel && actionLink && (
        <Button asChild>
          <Link to={actionLink}>
            {contentProps.actionLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
