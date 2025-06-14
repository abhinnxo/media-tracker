
import { supabase } from './supabase';
import { Season, SeasonStatus } from './types';

export const seasonsService = {
  // Get all seasons for a media item
  async getSeasonsByMediaId(mediaId: string): Promise<Season[]> {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('media_id', mediaId)
      .order('season_number', { ascending: true });

    if (error) {
      console.error('Error fetching seasons:', error);
      throw new Error('Failed to fetch seasons');
    }

    return data || [];
  },

  // Create a new season
  async createSeason(season: Omit<Season, 'id' | 'created_at' | 'updated_at'>): Promise<Season> {
    const { data, error } = await supabase
      .from('seasons')
      .insert(season)
      .select()
      .single();

    if (error) {
      console.error('Error creating season:', error);
      throw new Error('Failed to create season');
    }

    return data;
  },

  // Update season progress
  async updateSeasonProgress(
    seasonId: string, 
    watchedEpisodes: number, 
    status?: SeasonStatus
  ): Promise<Season> {
    const updateData: any = {
      watched_episodes: watchedEpisodes,
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
      if (status === SeasonStatus.COMPLETED) {
        updateData.completion_date = new Date().toISOString();
      }
      if (status === SeasonStatus.WATCHING && !updateData.start_date) {
        updateData.start_date = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('seasons')
      .update(updateData)
      .eq('id', seasonId)
      .select()
      .single();

    if (error) {
      console.error('Error updating season:', error);
      throw new Error('Failed to update season');
    }

    return data;
  },

  // Mark season as complete
  async markSeasonComplete(seasonId: string, totalEpisodes: number, rating?: number): Promise<Season> {
    const updateData: any = {
      watched_episodes: totalEpisodes,
      status: SeasonStatus.COMPLETED,
      completion_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (rating) {
      updateData.rating = rating;
    }

    const { data, error } = await supabase
      .from('seasons')
      .update(updateData)
      .eq('id', seasonId)
      .select()
      .single();

    if (error) {
      console.error('Error marking season complete:', error);
      throw new Error('Failed to mark season complete');
    }

    return data;
  },

  // Rate a season
  async rateSeason(seasonId: string, rating: number): Promise<Season> {
    const { data, error } = await supabase
      .from('seasons')
      .update({ 
        rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', seasonId)
      .select()
      .single();

    if (error) {
      console.error('Error rating season:', error);
      throw new Error('Failed to rate season');
    }

    return data;
  },

  // Delete a season
  async deleteSeason(seasonId: string): Promise<void> {
    const { error } = await supabase
      .from('seasons')
      .delete()
      .eq('id', seasonId);

    if (error) {
      console.error('Error deleting season:', error);
      throw new Error('Failed to delete season');
    }
  },

  // Calculate overall progress for a TV show
  async calculateShowProgress(mediaId: string): Promise<{
    totalEpisodes: number;
    watchedEpisodes: number;
    progressPercentage: number;
    currentSeason?: number;
    currentEpisode?: number;
  }> {
    const seasons = await this.getSeasonsByMediaId(mediaId);
    
    const totalEpisodes = seasons.reduce((sum, season) => sum + season.total_episodes, 0);
    const watchedEpisodes = seasons.reduce((sum, season) => sum + season.watched_episodes, 0);
    
    const progressPercentage = totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;
    
    // Find current watching position
    let currentSeason: number | undefined;
    let currentEpisode: number | undefined;
    
    for (const season of seasons) {
      if (season.status === SeasonStatus.WATCHING || 
          (season.watched_episodes > 0 && season.watched_episodes < season.total_episodes)) {
        currentSeason = season.season_number;
        currentEpisode = season.watched_episodes + 1;
        break;
      }
    }

    return {
      totalEpisodes,
      watchedEpisodes,
      progressPercentage,
      currentSeason,
      currentEpisode
    };
  }
};
