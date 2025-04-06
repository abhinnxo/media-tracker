
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MediaSearch } from '@/components/MediaSearch';
import { MediaSearchResult } from '@/lib/api';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { DetailedMediaView } from '@/components/DetailedMediaView';
import { EmptyState } from '@/components/EmptyState';
import { TrendingTrailers } from '@/components/TrendingTrailers';
import { EntertainmentNews } from '@/components/EntertainmentNews';
import { Search, Film, Newspaper } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

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
          
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger value="trending">
                <Film className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="news">
                <Newspaper className="h-4 w-4 mr-2" />
                News
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-8">
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
            </TabsContent>
            
            <TabsContent value="trending" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Trending Trailers</h2>
                <TrendingTrailers />
              </div>
            </TabsContent>
            
            <TabsContent value="news" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Entertainment News</h2>
                <EntertainmentNews />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default Explore;
