
import React from 'react';
import { Season, SeasonStatus } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Play, CheckCircle, Pause, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeasonProgressProps {
  season: Season;
  onUpdateProgress: (seasonId: string, watchedEpisodes: number, status?: SeasonStatus) => void;
  onMarkComplete: (seasonId: string, rating?: number) => void;
  onRateSeason: (seasonId: string, rating: number) => void;
}

export const SeasonProgress: React.FC<SeasonProgressProps> = ({
  season,
  onUpdateProgress,
  onMarkComplete,
  onRateSeason
}) => {
  const progressPercentage = (season.watched_episodes / season.total_episodes) * 100;
  const isCompleted = season.status === SeasonStatus.COMPLETED;
  const isWatching = season.status === SeasonStatus.WATCHING;
  const isNotStarted = season.status === SeasonStatus.NOT_STARTED;

  const getStatusIcon = () => {
    switch (season.status) {
      case SeasonStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case SeasonStatus.WATCHING:
        return <Play className="w-4 h-4 text-blue-500" />;
      case SeasonStatus.ON_HOLD:
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      [SeasonStatus.COMPLETED]: "default",
      [SeasonStatus.WATCHING]: "secondary",
      [SeasonStatus.ON_HOLD]: "outline",
      [SeasonStatus.NOT_STARTED]: "outline"
    } as const;

    const labels = {
      [SeasonStatus.COMPLETED]: "Completed",
      [SeasonStatus.WATCHING]: "Watching", 
      [SeasonStatus.ON_HOLD]: "On Hold",
      [SeasonStatus.NOT_STARTED]: "Not Started"
    };

    return (
      <Badge variant={variants[season.status]} className="flex items-center gap-1">
        {getStatusIcon()}
        {labels[season.status]}
      </Badge>
    );
  };

  const handleContinueWatching = () => {
    if (isNotStarted) {
      onUpdateProgress(season.id, 1, SeasonStatus.WATCHING);
    } else if (season.watched_episodes < season.total_episodes) {
      onUpdateProgress(season.id, season.watched_episodes + 1);
    }
  };

  const handleMarkComplete = () => {
    onMarkComplete(season.id);
  };

  const StarRating = ({ rating, onRate }: { rating: number | null; onRate: (rating: number) => void }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={cn(
            "transition-colors",
            rating && star <= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
          )}
        >
          <Star className="w-4 h-4 fill-current" />
        </button>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Season {season.season_number}</h3>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{season.watched_episodes} of {season.total_episodes} episodes</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isCompleted && (
              <Button 
                size="sm" 
                onClick={handleContinueWatching}
                variant={isNotStarted ? "default" : "secondary"}
              >
                {isNotStarted ? "Start Season" : "Continue Watching"}
              </Button>
            )}
            
            {!isCompleted && season.watched_episodes > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleMarkComplete}
              >
                Mark Complete
              </Button>
            )}
          </div>

          {(isCompleted || season.watched_episodes > 0) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rate:</span>
              <StarRating 
                rating={season.rating} 
                onRate={(rating) => onRateSeason(season.id, rating)} 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
