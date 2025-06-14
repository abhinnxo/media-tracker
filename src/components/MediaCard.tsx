
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MediaItem, MediaCategory } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Book, Film, Tv, Star, ImageOff, Crown, Play } from 'lucide-react';
import { AnimatedTransition } from './AnimatedTransition';
import { cn } from '@/lib/utils';
import { MediaCardMenu } from './MediaCardMenu';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface MediaCardProps {
  item: MediaItem;
  delay?: number;
  variant?: 'grid' | 'list';
  onAddToShowcase?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canAddToShowcase?: boolean;
  isInShowcase?: boolean;
  showcaseCount?: number;
  maxShowcaseItems?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  item, 
  delay = 0,
  variant = 'grid',
  onAddToShowcase,
  onEdit,
  onDelete,
  canAddToShowcase = true,
  isInShowcase = false,
  showcaseCount = 0,
  maxShowcaseItems = 3,
}) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Category icon mapping
  const CategoryIcon = {
    [MediaCategory.MOVIE]: Film,
    [MediaCategory.TV_SERIES]: Tv,
    [MediaCategory.ANIME]: Tv,
    [MediaCategory.BOOK]: Book,
    [MediaCategory.MANGA]: Book,
  }[item.category];

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

  const cardLink = `/details/${item.id}`;
  const isShowcaseFull = showcaseCount >= maxShowcaseItems;
  const showDisabledAdd = !isInShowcase && isShowcaseFull;

  // Determine showcase button state
  const getShowcaseButtonState = () => {
    if (isInShowcase) return 'in-showcase';
    if (isShowcaseFull) return 'showcase-full';
    return 'can-add';
  };

  // TV Show progress info
  const isShowWithProgress = (item.category === MediaCategory.TV_SERIES || item.category === MediaCategory.ANIME) 
    && (item.current_season || item.current_episode || item.overall_progress_percentage);

  const ProgressInfo = () => {
    if (!isShowWithProgress) return null;

    return (
      <div className="space-y-1">
        {item.current_season && item.current_episode && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Play className="w-3 h-3 mr-1" />
            S{item.current_season}E{item.current_episode}
          </div>
        )}
        {item.overall_progress_percentage !== null && item.overall_progress_percentage > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{item.overall_progress_percentage}%</span>
            </div>
            <Progress value={item.overall_progress_percentage} className="h-1" />
          </div>
        )}
      </div>
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
          to={cardLink}
          className="block"
          tabIndex={-1}
          style={{ textDecoration: 'none' }}
        >
          <div className={cn(
            "bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-md transition-all-200 flex h-32",
            isInShowcase && "ring-2 ring-amber-400/50 border-amber-400/50"
          )}>
            <div className="w-32 flex-shrink-0 relative overflow-hidden bg-muted">
              <ImageComponent 
                className="w-full h-full object-cover"
                size={32}
              />
              <div className="absolute top-2 right-2">
                <StatusBadge status={item.status} size="sm" showText={false} />
              </div>
              {isInShowcase && (
                <div className="absolute top-2 left-2">
                  <Badge variant="default" className="bg-amber-500 text-amber-50 text-xs px-1.5 py-0.5">
                    <Crown size={10} className="mr-1" />
                    Showcase
                  </Badge>
                </div>
              )}
            </div>
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
                <ProgressInfo />
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
              </div>
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
                <span onClick={e => e.stopPropagation()}>
                  <MediaCardMenu 
                    onAddToShowcase={onAddToShowcase}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    canAddToShowcase={canAddToShowcase && !showDisabledAdd}
                    showcaseButtonState={getShowcaseButtonState()}
                    showcaseCount={showcaseCount}
                    maxShowcaseItems={maxShowcaseItems}
                  />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </AnimatedTransition>
    );
  }

  // Grid variant
  return (
    <AnimatedTransition
      variant="slideUp"
      delay={delay * 0.05}
      className="hover-lift group"
    >
      <Link
        to={cardLink}
        className="block h-full"
        tabIndex={-1}
        style={{ textDecoration: "none" }}
      >
        <div className={cn(
          "bg-card rounded-xl overflow-hidden h-full border border-border hover:border-primary/30 hover:shadow-md transition-all-200 flex flex-col",
          isInShowcase && "ring-2 ring-amber-400/50 border-amber-400/50"
        )}>
          <div className="aspect-[2/3] relative overflow-hidden bg-muted">
            <ImageComponent 
              className="w-full h-full object-cover transition-transform-300 group-hover:scale-105"
              size={48}
            />
            <div className="absolute top-2 right-2 z-10">
              <StatusBadge status={item.status} size="sm" showText={false} />
            </div>
            {isInShowcase && (
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="default" className="bg-amber-500 text-amber-50 text-xs px-1.5 py-0.5">
                  <Crown size={10} className="mr-1" />
                  Showcase
                </Badge>
              </div>
            )}
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
          </div>
          <div className="p-3 pt-2 flex grow flex-col justify-between">
            <div>
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <CategoryIcon size={12} className="mr-1" />
                <span>{categoryLabels[item.category]}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium leading-tight truncate" title={item.title}>
                  {item.title}
                </h3>
                <span
                  className="ml-2 z-10"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MediaCardMenu 
                    onAddToShowcase={onAddToShowcase}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    canAddToShowcase={canAddToShowcase && !showDisabledAdd}
                    showcaseButtonState={getShowcaseButtonState()}
                    showcaseCount={showcaseCount}
                    maxShowcaseItems={maxShowcaseItems}
                  />
                </span>
              </div>
              {item.rating !== null && (
                <div className="flex items-center text-amber-500 text-xs mb-2">
                  <Star size={12} className="mr-0.5 fill-amber-500" />
                  <span>{item.rating}/10</span>
                </div>
              )}
              <ProgressInfo />
            </div>
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
