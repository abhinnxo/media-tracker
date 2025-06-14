
import React, { useState, useEffect } from 'react';
import { MediaItem, Season, SeasonStatus } from '@/lib/types';
import { seasonsService } from '@/lib/seasons-service';
import { SeasonProgress } from './SeasonProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SeasonManagementProps {
  mediaItem: MediaItem;
  onProgressUpdate?: (totalWatched: number, totalEpisodes: number) => void;
}

export const SeasonManagement: React.FC<SeasonManagementProps> = ({
  mediaItem,
  onProgressUpdate
}) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSeasonNumber, setNewSeasonNumber] = useState('');
  const [newSeasonEpisodes, setNewSeasonEpisodes] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchSeasons();
  }, [mediaItem.id]);

  const fetchSeasons = async () => {
    try {
      const fetchedSeasons = await seasonsService.getSeasonsByMediaId(mediaItem.id);
      setSeasons(fetchedSeasons);
      
      // Calculate overall progress
      if (onProgressUpdate) {
        const totalEpisodes = fetchedSeasons.reduce((sum, s) => sum + s.total_episodes, 0);
        const watchedEpisodes = fetchedSeasons.reduce((sum, s) => sum + s.watched_episodes, 0);
        onProgressUpdate(watchedEpisodes, totalEpisodes);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      toast({
        title: "Error",
        description: "Failed to load seasons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeason = async () => {
    if (!user || !newSeasonNumber || !newSeasonEpisodes) return;

    try {
      const seasonNumber = parseInt(newSeasonNumber);
      const totalEpisodes = parseInt(newSeasonEpisodes);

      const newSeason = await seasonsService.createSeason({
        media_id: mediaItem.id,
        season_number: seasonNumber,
        total_episodes: totalEpisodes,
        watched_episodes: 0,
        status: SeasonStatus.NOT_STARTED,
        rating: null,
        start_date: null,
        completion_date: null,
        user_id: user.id
      });

      setSeasons([...seasons, newSeason].sort((a, b) => a.season_number - b.season_number));
      setShowAddDialog(false);
      setNewSeasonNumber('');
      setNewSeasonEpisodes('');

      toast({
        title: "Season added",
        description: `Season ${seasonNumber} added successfully`
      });
    } catch (error) {
      console.error('Error adding season:', error);
      toast({
        title: "Error",
        description: "Failed to add season",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProgress = async (seasonId: string, watchedEpisodes: number, status?: SeasonStatus) => {
    try {
      const updatedSeason = await seasonsService.updateSeasonProgress(seasonId, watchedEpisodes, status);
      
      setSeasons(seasons.map(s => s.id === seasonId ? updatedSeason : s));
      
      // Recalculate overall progress
      if (onProgressUpdate) {
        const totalEpisodes = seasons.reduce((sum, s) => sum + s.total_episodes, 0);
        const newWatchedTotal = seasons.reduce((sum, s) => 
          s.id === seasonId ? sum + updatedSeason.watched_episodes : sum + s.watched_episodes, 0
        );
        onProgressUpdate(newWatchedTotal, totalEpisodes);
      }

      toast({
        title: "Progress updated",
        description: `Updated to episode ${watchedEpisodes}`
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const handleMarkComplete = async (seasonId: string, rating?: number) => {
    try {
      const season = seasons.find(s => s.id === seasonId);
      if (!season) return;

      const updatedSeason = await seasonsService.markSeasonComplete(seasonId, season.total_episodes, rating);
      setSeasons(seasons.map(s => s.id === seasonId ? updatedSeason : s));

      toast({
        title: "Season completed",
        description: `Season ${season.season_number} marked as complete`
      });
    } catch (error) {
      console.error('Error marking season complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark season complete",
        variant: "destructive"
      });
    }
  };

  const handleRateSeason = async (seasonId: string, rating: number) => {
    try {
      const updatedSeason = await seasonsService.rateSeason(seasonId, rating);
      setSeasons(seasons.map(s => s.id === seasonId ? updatedSeason : s));

      toast({
        title: "Season rated",
        description: `Rated ${rating} stars`
      });
    } catch (error) {
      console.error('Error rating season:', error);
      toast({
        title: "Error",
        description: "Failed to rate season",
        variant: "destructive"
      });
    }
  };

  const getOverallStats = () => {
    const totalEpisodes = seasons.reduce((sum, s) => sum + s.total_episodes, 0);
    const watchedEpisodes = seasons.reduce((sum, s) => sum + s.watched_episodes, 0);
    const completedSeasons = seasons.filter(s => s.status === SeasonStatus.COMPLETED).length;
    
    return { totalEpisodes, watchedEpisodes, completedSeasons };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { totalEpisodes, watchedEpisodes, completedSeasons } = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{watchedEpisodes}</div>
              <div className="text-sm text-muted-foreground">Episodes Watched</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalEpisodes}</div>
              <div className="text-sm text-muted-foreground">Total Episodes</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{completedSeasons}</div>
              <div className="text-sm text-muted-foreground">Seasons Complete</div>
            </div>
          </div>
          {totalEpisodes > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{Math.round((watchedEpisodes / totalEpisodes) * 100)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(watchedEpisodes / totalEpisodes) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seasons List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Seasons</h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Season
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Season</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="season-number">Season Number</Label>
                  <Input
                    id="season-number"
                    type="number"
                    value={newSeasonNumber}
                    onChange={(e) => setNewSeasonNumber(e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>
                <div>
                  <Label htmlFor="episode-count">Total Episodes</Label>
                  <Input
                    id="episode-count"
                    type="number"
                    value={newSeasonEpisodes}
                    onChange={(e) => setNewSeasonEpisodes(e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
                <Button onClick={handleAddSeason} className="w-full">
                  Add Season
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {seasons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">No seasons added yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add First Season
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {seasons.map((season) => (
              <SeasonProgress
                key={season.id}
                season={season}
                onUpdateProgress={handleUpdateProgress}
                onMarkComplete={handleMarkComplete}
                onRateSeason={handleRateSeason}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
