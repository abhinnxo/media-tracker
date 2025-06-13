import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Settings, Trash2 } from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { listsService, CustomList, ListItemWithMedia } from '@/lib/lists-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AddItemModal } from '@/components/AddItemModal';
import { EditListModal } from '@/components/EditListModal';
import { Badge } from '@/components/ui/badge';

interface RouteParams {
  listId?: string;
}

export const ListDetails: React.FC = () => {
  const { listId } = useParams<RouteParams>();
  const router = useNavigate();
  const { user } = useAuth();
  const [list, setList] = useState<CustomList | null>(null);
  const [items, setItems] = useState<ListItemWithMedia[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listId && user) {
      fetchListDetails();
      fetchListItems();
    }
  }, [listId, user]);

  const fetchListDetails = async () => {
    if (!listId) return;

    setIsLoading(true);
    try {
      const listDetails = await listsService.getListById(listId);
      if (listDetails) {
        setList(listDetails);
      } else {
        setError('List not found');
      }
    } catch (error: any) {
      console.error('Error fetching list details:', error);
      setError(error.message || 'Failed to fetch list details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchListItems = async () => {
    if (!listId) return;

    setIsLoading(true);
    try {
      const listItems = await listsService.getListItems(listId);
      setItems(listItems);
    } catch (error: any) {
      console.error('Error fetching list items:', error);
      setError(error.message || 'Failed to fetch list items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;
    
    const success = await listsService.removeItemFromList(itemId);
    if (success) {
      setItems(items.filter(item => item.id !== itemId));
      toast.success('Item removed from list');
    } else {
      toast.error('Failed to remove item');
    }
  };

  const ListItemCard = ({ item }: { item: ListItemWithMedia }) => {
    if (!item.media_item) return null;

    return (
      <div className="group relative bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {item.media_item.image_url ? (
            <img
              src={item.media_item.image_url}
              alt={item.media_item.title}
              className="w-16 h-16 object-cover rounded flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {item.media_item.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{item.media_item.title}</h4>
            {item.media_item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.media_item.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {item.media_item.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Added {new Date(item.added_at).toLocaleDateString()}
              </span>
            </div>
            {item.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{item.notes}"
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveItem(item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
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

  if (error) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center text-center">
          <div>
            <h2 className="text-lg font-medium mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <AnimatedTransition variant="fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold">{list?.name}</h1>
                {list?.description && (
                  <p className="text-muted-foreground mt-1">{list.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Items
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AnimatedTransition>

        {list?.cover_image_url && (
          <AnimatedTransition variant="slideUp" delay={0.1}>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img
                src={list.cover_image_url}
                alt={list.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </AnimatedTransition>
        )}

        <AnimatedTransition variant="slideUp" delay={0.2}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium">
                Items ({items.length})
              </h2>
            </div>
          </div>
        </AnimatedTransition>

        {items.length === 0 ? (
          <AnimatedTransition variant="fadeIn" delay={0.3}>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your list by adding some items
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Item
              </Button>
            </div>
          </AnimatedTransition>
        ) : (
          <AnimatedTransition variant="fadeIn" delay={0.3}>
            <div className="space-y-4">
              {items.map((item) => (
                <ListItemCard key={item.id} item={item} />
              ))}
            </div>
          </AnimatedTransition>
        )}

        {/* Add Item Modal */}
        <AddItemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          listId={listId!}
          onItemAdded={fetchListItems}
        />

        {/* Edit List Modal */}
        {list && (
          <EditListModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            list={list}
            onListUpdated={fetchListDetails}
          />
        )}
      </div>
    </Layout>
  );
};

export default ListDetails;
