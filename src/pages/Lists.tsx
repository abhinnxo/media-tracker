
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Grid, List } from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { listsService, CustomList } from '@/lib/lists-service';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { EnhancedListCard } from '@/components/EnhancedListCard';

const Lists: React.FC = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<CustomList[]>([]);
  const [listStats, setListStats] = useState<Record<string, { itemCount: number; averageRating: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user]);

  const fetchLists = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userLists = await listsService.getLists(user.id);
      setLists(userLists);
      
      // Fetch stats for each list
      const stats: Record<string, { itemCount: number; averageRating: number }> = {};
      
      for (const list of userLists) {
        const items = await listsService.getListItems(list.id);
        const itemCount = items.length;
        const ratingsWithValues = items
          .map(item => item.media_item?.rating)
          .filter((rating): rating is number => typeof rating === 'number' && rating > 0);
        
        const averageRating = ratingsWithValues.length > 0 
          ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length
          : 0;

        stats[list.id] = { itemCount, averageRating };
      }
      
      setListStats(stats);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteList = async (listId: string) => {
    const success = await listsService.deleteList(listId);
    if (success) {
      setLists(lists.filter(list => list.id !== listId));
      toast.success('List deleted successfully');
    } else {
      toast.error('Failed to delete list');
    }
  };

  const handleUpdateCover = async (listId: string, coverUrl: string | null) => {
    const success = await listsService.updateList(listId, { cover_image_url: coverUrl });
    if (success) {
      setLists(lists.map(list => 
        list.id === listId ? { ...list, cover_image_url: coverUrl } : list
      ));
      toast.success('Cover image updated successfully');
    } else {
      toast.error('Failed to update cover image');
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
        <AnimatedTransition variant="fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold mb-1">My Lists</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Create and organize custom collections of your media
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button asChild>
                <Link to="/lists/create">
                  <Plus className="mr-1 h-4 w-4" /> Create List
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedTransition>

        <AnimatedTransition variant="slideUp" delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredLists.length} {filteredLists.length === 1 ? 'list' : 'lists'}
            </div>
          </div>
        </AnimatedTransition>

        {filteredLists.length === 0 ? (
          <AnimatedTransition variant="fadeIn" delay={0.2}>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <List className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No lists found' : 'No lists yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first custom list to organize your media'
                }
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/lists/create">Create Your First List</Link>
                </Button>
              )}
            </div>
          </AnimatedTransition>
        ) : (
          <AnimatedTransition variant="fadeIn" delay={0.2}>
            <div className={
              viewMode === 'grid' 
                ? 'grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
            }>
              {filteredLists.map((list, index) => (
                <EnhancedListCard
                  key={list.id}
                  list={list}
                  itemCount={listStats[list.id]?.itemCount || 0}
                  averageRating={listStats[list.id]?.averageRating}
                  onUpdateCover={handleUpdateCover}
                  onDelete={handleDeleteList}
                  index={index}
                />
              ))}
            </div>
          </AnimatedTransition>
        )}
      </div>
    </Layout>
  );
};

export default Lists;
