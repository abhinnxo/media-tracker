
import React, { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/profile';
import { MediaItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaCard } from '@/components/MediaCard';
import { toast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMediaItems } from '@/lib/store';

const MAX_SHOWCASE_ITEMS = 5;

export const ProfileShowcase = () => {
  const profile = useProfileStore(state => state.profile);
  const updateProfile = useProfileStore(state => state.updateProfile);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<MediaItem[]>([]);
  const navigate = useNavigate();
  
  // Fetch all media items
  useEffect(() => {
    const fetchMediaItems = async () => {
      const items = await getMediaItems();
      setMediaItems(items);
      
      // Filter items that are in the showcase
      if (profile.showcaseIds?.length) {
        const showcased = items.filter(item => 
          profile.showcaseIds?.includes(item.id)
        );
        setShowcaseItems(showcased);
      }
    };
    
    fetchMediaItems();
  }, [profile.showcaseIds]);
  
  const addToShowcase = (item: MediaItem) => {
    if (showcaseItems.length >= MAX_SHOWCASE_ITEMS) {
      toast({
        title: "Showcase full",
        description: `You can only showcase up to ${MAX_SHOWCASE_ITEMS} items`,
        variant: "destructive"
      });
      return;
    }
    
    // Add the item to the showcase
    const updatedShowcaseIds = [...(profile.showcaseIds || []), item.id];
    updateProfile({
      ...profile,
      showcaseIds: updatedShowcaseIds
    });
    
    toast({
      title: "Item added",
      description: `"${item.title}" added to your showcase`
    });
  };
  
  const removeFromShowcase = (itemId: string) => {
    const updatedShowcaseIds = (profile.showcaseIds || [])
      .filter(id => id !== itemId);
    
    updateProfile({
      ...profile,
      showcaseIds: updatedShowcaseIds
    });
    
    toast({
      title: "Item removed",
      description: "Item removed from your showcase"
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Showcase Items</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Display your favorite media (max {MAX_SHOWCASE_ITEMS} items)
        </p>
        
        {showcaseItems.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">Your showcase is empty</p>
            <Button 
              onClick={() => navigate('/library')}
              variant="secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Select items from your library
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {showcaseItems.map(item => (
              <div key={item.id} className="relative group">
                <MediaCard 
                  item={item} 
                  onClick={() => navigate(`/details/${item.id}`)}
                />
                <Button
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="icon"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromShowcase(item.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showcaseItems.length < MAX_SHOWCASE_ITEMS && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-medium">Available Library Items</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/library')}
            >
              Go to Library
            </Button>
          </div>
          
          {mediaItems.filter(item => !profile.showcaseIds?.includes(item.id)).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mediaItems
                .filter(item => !profile.showcaseIds?.includes(item.id))
                .slice(0, 6)
                .map(item => (
                  <div key={item.id} className="relative group">
                    <MediaCard item={item} />
                    <Button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                      onClick={() => addToShowcase(item)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">No other items in your library</p>
              <Button 
                onClick={() => navigate('/add')}
                variant="secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add new media
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
