
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MediaSearch } from '@/components/MediaSearch';
import { MediaSearchResult } from '@/lib/api';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { DetailedMediaView } from '@/components/DetailedMediaView';
import { EmptyState } from '@/components/EmptyState';
import { Search } from 'lucide-react';
import { MediaCategory, MediaStatus } from '@/lib/types';

const Explore: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);

  // Map MediaSearchResult to a MediaItem-like object for DetailedMediaView
  const toMediaItem = (media: MediaSearchResult | null) => {
    if (!media) return null;
    // Use fallbacks for required fields
    return {
      id: media.id || 'placeholder',
      title: media.title || 'Untitled',
      description: media.description || '',
      image_url: media.imageUrl || null,
      category: (media.category as MediaCategory) || MediaCategory.MOVIE,
      status: MediaStatus.TO_CONSUME,
      rating: null,
      tags: [],
      start_date: null,
      end_date: null,
      notes: null,
      created_at: '',
      updated_at: '',
      user_id: '',
      year: media.year,
      creator: media.creator,
      genres: media.genres
    };
  };

  return (
    <Layout>
      <AnimatedTransition variant="fadeIn">
        <div className="container max-w-7xl mx-auto py-8">
          <h1 className="text-3xl font-bold mb-2">Explore Media</h1>
          <p className="text-muted-foreground mb-6">
            Search for movies, TV shows, anime, manga, and books to discover details and where to watch or read them.
          </p>

          <div className="grid grid-cols-1 gap-8">
            <div className="w-full">
              <MediaSearch 
                onSelect={(result) => setSelectedMedia(result)} 
                className="mb-8"
              />
            </div>
            {selectedMedia ? (
              <DetailedMediaView item={toMediaItem(selectedMedia)} />
            ) : (
              <EmptyState
                type="noResults"
                title="Search for Media"
                description="Use the search box above to find movies, TV shows, anime, manga, and books."
                actionLabel=""
                actionLink=""
              />
            )}
          </div>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default Explore;
