
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MediaItem, MediaCategory, MediaStatus } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/CategoryCard';
import { QuickStatsOverview } from '@/components/QuickStatsOverview';
import { Plus, LayoutDashboard } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await mediaStore.getAll();
        setMediaItems(items);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processMediaData = () => {
    const categoryStats: Record<MediaCategory, { total: number; statusBreakdown: Record<MediaStatus, number> }> = {
      [MediaCategory.ANIME]: { total: 0, statusBreakdown: {} as Record<MediaStatus, number> },
      [MediaCategory.MANGA]: { total: 0, statusBreakdown: {} as Record<MediaStatus, number> },
      [MediaCategory.MOVIE]: { total: 0, statusBreakdown: {} as Record<MediaStatus, number> },
      [MediaCategory.BOOK]: { total: 0, statusBreakdown: {} as Record<MediaStatus, number> },
      [MediaCategory.TV_SERIES]: { total: 0, statusBreakdown: {} as Record<MediaStatus, number> },
    };

    // Initialize status breakdown for each category
    Object.values(MediaCategory).forEach(category => {
      Object.values(MediaStatus).forEach(status => {
        categoryStats[category].statusBreakdown[status] = 0;
      });
    });

    // Process media items
    mediaItems.forEach(item => {
      if (item.category && categoryStats[item.category]) {
        categoryStats[item.category].total += 1;
        if (item.status) {
          categoryStats[item.category].statusBreakdown[item.status] += 1;
        }
      }
    });

    return categoryStats;
  };

  const calculateQuickStats = () => {
    const totalItems = mediaItems.length;
    const completedItems = mediaItems.filter(item => item.status === MediaStatus.COMPLETED).length;
    const inProgressItems = mediaItems.filter(item => item.status === MediaStatus.IN_PROGRESS).length;
    
    const ratedItems = mediaItems.filter(item => item.rating && item.rating > 0);
    const averageRating = ratedItems.length > 0 
      ? ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length
      : 0;

    return {
      totalItems,
      completedItems,
      inProgressItems,
      averageRating
    };
  };

  const handleQuickAdd = (category: MediaCategory) => {
    navigate(`/add?category=${category}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const hasAnyMedia = mediaItems.length > 0;
  const categoryStats = processMediaData();
  const quickStats = calculateQuickStats();

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <AnimatedTransition variant="fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold mb-1">Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Overview of your media collection
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/add" className="flex items-center justify-center">
                <Plus className="mr-1 h-4 w-4" /> Add Media
              </Link>
            </Button>
          </div>
        </AnimatedTransition>

        {!hasAnyMedia ? (
          <div className="flex flex-col items-center justify-center text-center py-12 sm:py-20 px-4">
            <LayoutDashboard className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl sm:text-2xl font-medium">Welcome to your dashboard</h2>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md">
              Start building your media collection by adding your first movie, book, or show
            </p>
            <Button asChild>
              <Link to="/add">Add Your First Media</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Quick Stats Overview */}
            <AnimatedTransition variant="slideUp" delay={0.1}>
              <QuickStatsOverview {...quickStats} />
            </AnimatedTransition>

            {/* Category Cards */}
            <div className="space-y-4">
              <AnimatedTransition variant="slideUp" delay={0.2}>
                <h2 className="text-xl font-semibold">Categories</h2>
              </AnimatedTransition>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {Object.values(MediaCategory).map((category, index) => (
                  <AnimatedTransition key={category} variant="slideUp" delay={0.3 + index * 0.1}>
                    <CategoryCard
                      category={category}
                      totalCount={categoryStats[category].total}
                      statusBreakdown={categoryStats[category].statusBreakdown}
                      onQuickAdd={handleQuickAdd}
                    />
                  </AnimatedTransition>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <AnimatedTransition variant="slideUp" delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/library">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    View Full Library
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/lists">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom List
                  </Link>
                </Button>
              </div>
            </AnimatedTransition>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
