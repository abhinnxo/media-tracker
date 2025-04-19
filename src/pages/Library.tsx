
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { MediaItem, MediaFilterOptions, MediaCategory } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { MediaCard } from '@/components/MediaCard';
import { MediaFilters } from '@/components/MediaFilters';
import { EmptyState } from '@/components/EmptyState';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { LayoutGrid, LayoutList, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Library: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [filters, setFilters] = useState<MediaFilterOptions>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await mediaStore.getAll();
        setMediaItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Error fetching media items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = async (newFilters: MediaFilterOptions) => {
    setFilters(newFilters);
    try {
      const filtered = await mediaStore.filter(newFilters);
      setFilteredItems(filtered);
    } catch (error) {
      console.error('Error filtering media items:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = category as MediaCategory | 'all';
    setSelectedCategory(newCategory);
    
    if (newCategory === 'all') {
      setFilteredItems(mediaItems);
    } else {
      const filtered = mediaItems.filter(item => item.category === newCategory);
      setFilteredItems(filtered);
    }
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

  return (
    <Layout>
      <div className="space-y-6">
        <AnimatedTransition variant="fadeIn" className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Your Library</h1>
            <p className="text-muted-foreground">
              {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'} in your collection
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="mr-2"
            >
              {viewMode === 'grid' ? <LayoutList size={16} /> : <LayoutGrid size={16} />}
            </Button>
            
            <Button asChild>
              <Link to="/add" className="flex items-center">
                <Plus className="mr-1 h-4 w-4" /> Add New Media
              </Link>
            </Button>
          </div>
        </AnimatedTransition>
        
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={MediaCategory.MOVIE}>Movies</TabsTrigger>
            <TabsTrigger value={MediaCategory.TV_SERIES}>TV Series</TabsTrigger>
            <TabsTrigger value={MediaCategory.ANIME}>Anime</TabsTrigger>
            <TabsTrigger value={MediaCategory.BOOK}>Books</TabsTrigger>
            <TabsTrigger value={MediaCategory.MANGA}>Manga</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Media Grid/List */}
        {mediaItems.length === 0 ? (
          <EmptyState />
        ) : filteredItems.length === 0 ? (
          <EmptyState 
            type="noResults" 
            actionLabel="Clear Filters" 
            actionLink="/library" 
          />
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
              : "space-y-4"
          }>
            {filteredItems.map((item, index) => (
              <MediaCard 
                key={item.id} 
                item={item} 
                delay={index} 
                variant={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Library;
