import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  X, 
  MoreVertical,
  Calendar,
  User
} from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { listsService, CustomList, ListItemWithMedia } from '@/lib/lists-service';
import { supabaseStore } from '@/lib/supabase-store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MediaItem } from '@/lib/types';
import { ListSortFilter, FilterOption } from '@/components/ListSortFilter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ListDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [list, setList] = useState<CustomList | null>(null);
  const [listItems, setListItems] = useState<ListItemWithMedia[]>([]);
  const [filteredAndSortedItems, setFilteredAndSortedItems] = useState<ListItemWithMedia[]>([]);
  const [availableMedia, setAvailableMedia] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('position');
  const [filter, setFilter] = useState<FilterOption>({
    dateRange: 'all',
    showMetadata: true
  });

  useEffect(() => {
    if (id && user) {
      fetchListDetails();
      fetchAvailableMedia();
    }
  }, [id, user]);

  useEffect(() => {
    let filtered = [...listItems];

    // Apply date range filter
    if (filter.dateRange !== 'all') {
      const now = new Date();
      let filterDate = new Date();
      
      switch (filter.dateRange) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.added_at) >= filterDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'position':
          return a.position - b.position;
        case 'date-newest':
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
        case 'date-oldest':
          return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
        case 'title-asc':
          return (a.media_item?.title || '').localeCompare(b.media_item?.title || '');
        case 'title-desc':
          return (b.media_item?.title || '').localeCompare(a.media_item?.title || '');
        case 'rating-high':
          return (b.media_item?.rating || 0) - (a.media_item?.rating || 0);
        case 'rating-low':
          return (a.media_item?.rating || 0) - (b.media_item?.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredAndSortedItems(filtered);
  }, [listItems, sortBy, filter]);

  const fetchListDetails = async () => {
    if (!id || !user) return;
    
    setIsLoading(true);
    try {
      const listData = await listsService.getListById(id);
      if (listData) {
        setList(listData);
        const items = await listsService.getListItems(id);
        setListItems(items);
      }
    } catch (error) {
      console.error('Error fetching list details:', error);
      toast.error('Failed to load list details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableMedia = async () => {
    if (!user) return;
    
    try {
      const media = await supabaseStore.getAll(user.id);
      setAvailableMedia(media);
    } catch (error) {
      console.error('Error fetching available media:', error);
    }
  };

  const handleAddItem = async (mediaItem: MediaItem) => {
    if (!list || !user) return;

    try {
      const newItem = await listsService.addItemToList(
        list.id,
        mediaItem.id,
        user.id
      );
      
      if (newItem) {
        toast.success('Item added to list');
        fetchListDetails();
        setIsAddDialogOpen(false);
      } else {
        toast.error('Failed to add item to list');
      }
    } catch (error) {
      console.error('Error adding item to list:', error);
      toast.error('Failed to add item to list');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const success = await listsService.removeItemFromList(itemId);
      if (success) {
        toast.success('Item removed from list');
        setListItems(listItems.filter(item => item.id !== itemId));
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const filteredMedia = availableMedia.filter(media => {
    const isNotInList = !listItems.some(item => item.media_id === media.id);
    const matchesSearch = media.title.toLowerCase().includes(searchQuery.toLowerCase());
    return isNotInList && matchesSearch;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!list) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">List not found</h2>
          <Button asChild>
            <Link to="/lists">Back to Lists</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <AnimatedTransition variant="fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lists">
                <ArrowLeft className="h-4 w-4" />
                Back to Lists
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-semibold">{list.name}</h1>
              {list.description && (
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  {list.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={list.privacy_setting === 'public' ? 'default' : 'secondary'}>
                  {list.privacy_setting}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {listItems.length} {listItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Items
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Items to List</DialogTitle>
                  <DialogDescription>
                    Select media items from your library to add to this list
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search your media..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredMedia.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {searchQuery ? 'No matching items found' : 'All your media items are already in this list'}
                      </p>
                    ) : (
                      filteredMedia.map((media) => (
                        <div
                          key={media.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => handleAddItem(media)}
                        >
                          <div className="w-12 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                            {media.image_url ? (
                              <img
                                src={media.image_url}
                                alt={media.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-secondary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{media.title}</h4>
                            <p className="text-sm text-muted-foreground">{media.category}</p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedTransition>

        {listItems.length === 0 ? (
          <AnimatedTransition variant="fadeIn" delay={0.1}>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">List is empty</h3>
              <p className="text-muted-foreground mb-4">
                Add some items to get started
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                Add Your First Item
              </Button>
            </div>
          </AnimatedTransition>
        ) : (
          <AnimatedTransition variant="fadeIn" delay={0.1}>
            <div className="space-y-4">
              <ListSortFilter
                sortBy={sortBy}
                onSortChange={setSortBy}
                filter={filter}
                onFilterChange={setFilter}
                itemCount={filteredAndSortedItems.length}
              />
              
              <div className="grid gap-4">
                {filteredAndSortedItems.map((item, index) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.media_item?.image_url ? (
                            <img
                              src={item.media_item.image_url}
                              alt={item.media_item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-lg">{item.media_item?.title}</h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {item.media_item?.category}
                              </p>
                              {item.media_item?.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {item.media_item.description}
                                </p>
                              )}
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  Remove from List
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {filter.showMetadata && (
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Position {item.position + 1}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </AnimatedTransition>
        )}
      </div>
    </Layout>
  );
};

export default ListDetails;
