
import React, { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/profile';
import { MediaItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaCard } from '@/components/MediaCard';
import { toast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mediaStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, ShowcaseItem } from '@/lib/profile-service';

const MAX_SHOWCASE_ITEMS = 5;

export const ProfileShowcase = () => {
  const profile = useProfileStore(state => state.profile);
  const updateProfile = useProfileStore(state => state.updateProfile);
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Fetch all media items and showcase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [items, showcase] = await Promise.all([
          mediaStore.getAll(),
          profileService.getShowcaseItems(user.id)
        ]);
        
        setMediaItems(items);
        setShowcaseItems(showcase);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [user]);
  
  const addToShowcase = async (item: MediaItem) => {
    if (!user) return;
    
    if (showcaseItems.length >= MAX_SHOWCASE_ITEMS) {
      toast({
        title: "Showcase full",
        description: `You can only showcase up to ${MAX_SHOWCASE_ITEMS} items`,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const newShowcaseItem = await profileService.addToShowcase(
        user.id,
        item.category,
        item.id,
        item.title,
        item.image_url
      );
      
      if (newShowcaseItem) {
        setShowcaseItems([...showcaseItems, newShowcaseItem]);
        
        toast({
          title: "Item added",
          description: `"${item.title}" added to your showcase`
        });
      }
    } catch (error) {
      console.error('Error adding to showcase:', error);
      toast({
        title: "Error",
        description: "Failed to add item to showcase",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const removeFromShowcase = async (showcaseItem: ShowcaseItem) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const success = await profileService.removeFromShowcase(showcaseItem.id);
      
      if (success) {
        setShowcaseItems(showcaseItems.filter(item => item.id !== showcaseItem.id));
        
        toast({
          title: "Item removed",
          description: "Item removed from your showcase"
        });
      }
    } catch (error) {
      console.error('Error removing from showcase:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from showcase",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get media items that are in showcase
  const showcasedMediaItems = mediaItems.filter(item => 
    showcaseItems.some(showcase => showcase.item_id === item.id)
  );
  
  // Get available items not in showcase
  const availableItems = mediaItems.filter(item => 
    !showcaseItems.some(showcase => showcase.item_id === item.id)
  );
  
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
            {showcasedMediaItems.map(item => {
              const showcaseItem = showcaseItems.find(s => s.item_id === item.id);
              return (
                <div key={item.id} className="relative group">
                  <div onClick={() => navigate(`/details/${item.id}`)}>
                    <MediaCard 
                      item={item}
                      delay={0}
                    />
                  </div>
                  <Button
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (showcaseItem) removeFromShowcase(showcaseItem);
                    }}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
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
          
          {availableItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableItems
                .slice(0, 6)
                .map(item => (
                  <div key={item.id} className="relative group">
                    <div onClick={() => navigate(`/details/${item.id}`)}>
                      <MediaCard 
                        item={item}
                        delay={0}
                      />
                    </div>
                    <Button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                      onClick={() => addToShowcase(item)}
                      disabled={loading}
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
