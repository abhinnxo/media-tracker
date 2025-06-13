
import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { supabaseStore } from '@/lib/supabase-store';
import { MediaItem } from '@/lib/types';
import { listsService } from '@/lib/lists-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Check } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  onItemAdded: () => void;
}

interface SearchResult extends MediaItem {
  isInList?: boolean;
  source: 'library' | 'api';
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  listId,
  onItemAdded,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [localResults, setLocalResults] = useState<SearchResult[]>([]);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch.trim() && user) {
      performSearch(debouncedSearch);
    } else {
      setLocalResults([]);
      setApiResults([]);
    }
  }, [debouncedSearch, user]);

  const performSearch = async (query: string) => {
    if (!user) return;

    setIsSearching(true);
    try {
      // Search local library
      const localItems = await supabaseStore.filter(
        { search: query },
        user.id
      );

      // Get existing list items to exclude them
      const existingItems = await listsService.getListItems(listId);
      const existingMediaIds = new Set(existingItems.map(item => item.media_id));

      const filteredLocalResults: SearchResult[] = localItems
        .filter(item => !existingMediaIds.has(item.id))
        .map(item => ({
          ...item,
          source: 'library' as const,
          isInList: false,
        }));

      setLocalResults(filteredLocalResults);

      // If local results are limited, search API
      if (filteredLocalResults.length < 5) {
        // TODO: Implement API search based on your external APIs
        // For now, we'll just use local results
        setApiResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: 'Failed to search for items. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async (item: SearchResult) => {
    if (!user || addingItems.has(item.id)) return;

    setAddingItems(prev => new Set([...prev, item.id]));

    try {
      // For API results, we might need to create the media item first
      let mediaId = item.id;
      
      if (item.source === 'api' && item.id === 'new') {
        // Create new media item from API result
        const newMediaItem = await supabaseStore.save(
          {
            ...item,
            id: 'new',
            user_id: user.id,
          },
          user.id
        );
        mediaId = newMediaItem.id;
      }

      // Add item to list
      await listsService.addItemToList(listId, mediaId, user.id);

      toast({
        title: 'Item Added',
        description: `"${item.title}" has been added to your list.`,
      });

      onItemAdded();
      
      // Remove from search results
      if (item.source === 'library') {
        setLocalResults(prev => prev.filter(result => result.id !== item.id));
      } else {
        setApiResults(prev => prev.filter(result => result.id !== item.id));
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add item to list. Please try again.',
      });
    } finally {
      setAddingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setLocalResults([]);
    setApiResults([]);
    onClose();
  };

  const SearchResultCard = ({ item }: { item: SearchResult }) => {
    const isAdding = addingItems.has(item.id);

    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {item.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.title}</h4>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
            {item.source === 'library' && (
              <Badge variant="outline" className="text-xs">
                In Library
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={() => handleAddItem(item)}
          disabled={isAdding || item.isInList}
          size="sm"
          className="flex-shrink-0"
        >
          {isAdding ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : item.isInList ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Items to List</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for items to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {isSearching && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-16 h-8" />
                </div>
              ))}
            </div>
          )}

          {!isSearching && localResults.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                From Your Library ({localResults.length})
              </h3>
              <div className="space-y-2">
                {localResults.map((item) => (
                  <SearchResultCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {!isSearching && apiResults.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Search Results ({apiResults.length})
              </h3>
              <div className="space-y-2">
                {apiResults.map((item) => (
                  <SearchResultCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {!isSearching && searchQuery && localResults.length === 0 && apiResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No items found for "{searchQuery}"</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}

          {!searchQuery && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Search for items to add to your list</p>
              <p className="text-sm">Type in the search box above to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
