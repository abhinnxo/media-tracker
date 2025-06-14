
export enum MediaCategory {
  MOVIE = "movie",
  TV_SERIES = "tv-series",
  ANIME = "anime",
  BOOK = "book",
  MANGA = "manga"
}

export enum MediaStatus {
  TO_CONSUME = "to-consume", // Watchlist/To Read
  IN_PROGRESS = "in-progress", // Currently Watching/Reading
  COMPLETED = "completed",
  DROPPED = "dropped",
  ON_HOLD = "on-hold"
}

export enum SeasonStatus {
  NOT_STARTED = "not-started",
  WATCHING = "watching", 
  COMPLETED = "completed",
  ON_HOLD = "on-hold"
}

export interface Season {
  id: string;
  media_id: string;
  season_number: number;
  total_episodes: number;
  watched_episodes: number;
  status: SeasonStatus;
  rating: number | null;
  start_date: string | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: MediaCategory;
  status: MediaStatus;
  rating: number | null;
  tags: string[];
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  year?: string;
  creator?: string;
  genres?: string[];
  total_seasons?: number | null;
  current_season?: number | null;
  current_episode?: number | null;
  overall_progress_percentage?: number | null;
}

export interface MediaFilterOptions {
  category?: MediaCategory | null;
  status?: MediaStatus | null;
  search?: string;
  tags?: string[];
}
