
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

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: MediaCategory;
  status: MediaStatus;
  rating?: number; // 0-10
  tags: string[];
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFilterOptions {
  category?: MediaCategory | null;
  status?: MediaStatus | null;
  search?: string;
  tags?: string[];
}
