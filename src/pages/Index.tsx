import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MediaItem, MediaStatus } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { MediaCard } from '@/components/MediaCard';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { EmptyState } from '@/components/EmptyState';
import { ArrowRight, PlayCircle, CheckCircle, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyWatching, setCurrentlyWatching] = useState<MediaItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<MediaItem[]>([]);
  const [upNext, setUpNext] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all media items
        const allItems = await mediaStore.getAll();

        // Currently watching/in progress
        const inProgress = await mediaStore.getByStatus(MediaStatus.IN_PROGRESS);
        setCurrentlyWatching(inProgress.slice(0, 6));

        // Recently added (all items, sorted by created_at)
        const recent = [...allItems].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentlyAdded(recent.slice(0, 6));

        // Up next (to consume)
        const next = await mediaStore.getByStatus(MediaStatus.TO_CONSUME);
        setUpNext(next.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasAnyMedia = recentlyAdded.length > 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10">
        <AnimatedTransition variant="fadeIn">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-1">Your Media Dashboard</h1>
              <p className="text-muted-foreground">
                Track, organize, and discover all your favorite media
              </p>
            </div>
            <Button asChild>
              <Link to="/add" className="flex items-center">
                <Plus className="mr-1 h-4 w-4" /> Add Media
              </Link>
            </Button>
          </div>
        </AnimatedTransition>

        {!hasAnyMedia ? (
          <EmptyState />
        ) : (
          <>
            {/* Currently Watching Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PlayCircle className="mr-2 h-5 w-5 text-primary" />
                  <h2 className="text-xl font-medium">Currently Watching</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/library" className="flex items-center">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {currentlyWatching.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {currentlyWatching.map((item, index) => (
                    <MediaCard key={item.id} item={item} delay={index} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="noItems"
                  title="Nothing In Progress"
                  description="Start watching or reading something new."
                  actionLabel="Browse Your Library"
                  actionLink="/library"
                />
              )}
            </section>

            {/* Up Next Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  <h2 className="text-xl font-medium">Up Next</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/library" className="flex items-center">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {upNext.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {upNext.map((item, index) => (
                    <MediaCard key={item.id} item={item} delay={index} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="noItems"
                  title="Watchlist Empty"
                  description="Add some media to your watchlist."
                  actionLabel="Add Media"
                  actionLink="/add"
                />
              )}
            </section>

            {/* Recently Added Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  <h2 className="text-xl font-medium">Recently Added</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/library" className="flex items-center">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recentlyAdded.map((item, index) => (
                  <MediaCard key={item.id} item={item} delay={index} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
