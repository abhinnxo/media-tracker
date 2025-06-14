import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MediaItem, MediaCategory } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Book, Film, Tv, Star, ImageOff } from 'lucide-react';
import { AnimatedTransition } from './AnimatedTransition';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  item: MediaItem;
  delay?: number;
  variant?: 'grid' | 'list';
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  item, 
  delay = 0,
  variant = 'grid' 
}) => {
  const [imageError, setImageError] = useState(false);

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

  const handleImageError = () => {
    setImageError(true);
  };

  const ImageComponent = ({ className, size }: { className: string; size: number }) => {
    if (!item.image_url || imageError) {
      return (
        <div className={cn("flex items-center justify-center bg-secondary", className)}>
          <CategoryIcon size={size} className="text-muted-foreground/40" />
        </div>
      );
    }

    return (
      <img
        src={item.image_url}
        alt={item.title}
        className={className}
        loading="lazy"
        onError={handleImageError}
        crossOrigin="anonymous"
      />
    );
  };

  if (variant === 'list') {
    return (
      <AnimatedTransition
        variant="slideUp"
        delay={delay * 0.05}
        className="hover-lift group"
      >
        <Link
          to={`/details/${item.id}`}
          className="block"
        >
          <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-md transition-all-200">
            <div className="flex h-32">
              {/* Left side - Media thumbnail (30-40% width) */}
              <div className="w-32 flex-shrink-0 relative overflow-hidden bg-muted">
                <ImageComponent 
                  className="w-full h-full object-cover"
                  size={32}
                />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={item.status} size="sm" showText={false} />
                </div>
              </div>

              {/* Right side - Item information (60-70% width) */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div className="flex-1">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <CategoryIcon size={12} className="mr-1" />
                    <span>{categoryLabels[item.category]}</span>
                  </div>

                  <h3 className="font-medium text-lg leading-tight mb-1 line-clamp-2" title={item.title}>
                    {item.title}
                  </h3>

                  {item.rating !== null && (
                    <div className="flex items-center text-amber-500 text-sm mb-1">
                      <Star size={14} className="mr-1 fill-amber-500" />
                      <span>{item.rating}/10</span>
                    </div>
                  )}

                  {/* Always show description in list view */}
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Bottom section with tags and metadata */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0">
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
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
                  {item.creator && (
                    <p className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {item.creator}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </AnimatedTransition>
    );
  }

  return (
    <AnimatedTransition
      variant="slideUp"
      delay={delay * 0.05}
      className="hover-lift group"
    >
      <Link
        to={`/details/${item.id}`}
        className="block"
      >
        <div className="bg-card rounded-xl overflow-hidden h-full border border-border hover:border-primary/30 hover:shadow-md transition-all-200">
          <div className="aspect-[2/3] relative overflow-hidden bg-muted">
            <ImageComponent 
              className="w-full h-full object-cover transition-transform-300 group-hover:scale-105"
              size={48}
            />

            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-4 overflow-y-auto">
              <div className="text-white space-y-2">
                {item.description && (
                  <p className="text-sm line-clamp-6">
                    {item.description}
                  </p>
                )}
                {item.creator && (
                  <p className="text-xs">
                    Creator: {item.creator}
                  </p>
                )}
              </div>
            </div>

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

            {item.rating !== null && (
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
