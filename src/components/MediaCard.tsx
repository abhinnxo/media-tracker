
import React from 'react';
import { Link } from 'react-router-dom';
import { MediaItem, MediaCategory } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Book, Film, Tv, Star } from 'lucide-react';
import { AnimatedTransition } from './AnimatedTransition';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  item: MediaItem;
  delay?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, delay = 0 }) => {
  // Category icon mapping
  const CategoryIcon = {
    [MediaCategory.MOVIE]: Film,
    [MediaCategory.TV_SERIES]: Tv,
    [MediaCategory.ANIME]: Tv,
    [MediaCategory.BOOK]: Book,
    [MediaCategory.MANGA]: Book,
  }[item.category];

  // Category labels
  const categoryLabels = {
    [MediaCategory.MOVIE]: 'Movie',
    [MediaCategory.TV_SERIES]: 'TV Series',
    [MediaCategory.ANIME]: 'Anime',
    [MediaCategory.BOOK]: 'Book',
    [MediaCategory.MANGA]: 'Manga',
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AnimatedTransition 
      variant="slideUp" 
      delay={delay * 0.05}
      className="hover-lift"
    >
      <Link 
        to={`/details/${item.id}`} 
        className="block"
      >
        <div className="bg-card rounded-xl overflow-hidden h-full border border-border hover:border-primary/30 hover:shadow-md transition-all-200">
          <div className="aspect-[2/3] relative overflow-hidden bg-muted">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <CategoryIcon size={48} className="text-muted-foreground/40" />
              </div>
            )}
            
            {/* Status badge positioned absolutely */}
            <div className="absolute top-2 right-2">
              <StatusBadge status={item.status} size="sm" showText={false} />
            </div>
          </div>
          
          <div className="p-3">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <CategoryIcon size={12} className="mr-1" />
              <span>{categoryLabels[item.category]}</span>
            </div>
            
            <h3 className="font-medium leading-tight mb-1 truncate" title={item.title}>
              {item.title}
            </h3>
            
            {item.rating !== undefined && (
              <div className="flex items-center text-amber-500 text-xs">
                <Star size={12} className="mr-0.5 fill-amber-500" />
                <span>{item.rating}/10</span>
              </div>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </AnimatedTransition>
  );
};

export default MediaCard;
