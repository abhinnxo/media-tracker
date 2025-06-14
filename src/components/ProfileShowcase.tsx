
import React, { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/profile';
import { MediaItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MediaCard } from '@/components/MediaCard';
import { toast } from '@/hooks/use-toast';
import { Plus, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mediaStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, ShowcaseItem } from '@/lib/profile-service';
import { ShowcaseList } from "./ProfileShowcase/ShowcaseList";
import { AvailableLibraryList } from "./ProfileShowcase/AvailableLibraryList";

const MAX_SHOWCASE_ITEMS = 3;

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
        description: `You can only showcase up to ${MAX_SHOWCASE_ITEMS} items. Remove an item first.`,
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
    <div className="space-y-8">
      {/* Showcase Items Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Label className="text-lg font-medium">Showcase Items</Label>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Crown size={12} className="mr-1" />
            {showcaseItems.length}/{MAX_SHOWCASE_ITEMS}
          </Badge>
        </div>
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
          <ShowcaseList
            items={showcasedMediaItems}
            showcaseItems={showcaseItems}
            loading={loading}
            onRemove={removeFromShowcase}
          />
        )}
      </div>

      {/* Available Items Section */}
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
            <AvailableLibraryList
              items={availableItems}
              loading={loading}
              onAdd={addToShowcase}
            />
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
