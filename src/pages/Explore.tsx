
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MediaSearch } from '@/components/MediaSearch';
import { MediaSearchResult } from '@/lib/api';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { DetailedMediaView } from '@/components/DetailedMediaView';
import { EmptyState } from '@/components/EmptyState';
import { Search } from 'lucide-react';

const Explore: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);
  
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
              <DetailedMediaView media={selectedMedia} />
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
