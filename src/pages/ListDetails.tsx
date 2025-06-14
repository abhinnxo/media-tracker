
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listsService } from '@/lib/lists-service';
import { MediaItem } from '@/lib/types';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MediaCard } from '@/components/MediaCard';
import { EmptyState } from '@/components/EmptyState';
import { EditListModal } from '@/components/EditListModal';
import { AddItemModal } from '@/components/AddItemModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Eye,
  Lock,
  Plus,
  Users,
  Calendar,
  Tag,
  Grid,
  List
} from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';

interface CustomList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const ListDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [list, setList] = useState<CustomList | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!id) return;
    loadListData();
  }, [id]);

  const loadListData = async () => {
    if (!id || !user) return;

    setLoading(true);
    try {
      const [listData, itemsData] = await Promise.all([
        listsService.getListById(id),
        listsService.getListItems(id)
      ]);

      if (listData) {
        setList(listData);
        // Transform the list items data to match MediaItem interface
        const mediaItems = itemsData.map((item: any) => ({
          id: item.media_id || item.id,
          title: item.media_item?.title || item.title || 'Untitled',
          description: item.media_item?.description || item.description || '',
          image_url: item.media_item?.image_url || item.image_url || '',
          category: item.media_item?.category || item.category || 'other',
          status: item.media_item?.status || item.status || 'to-consume',
          rating: item.media_item?.rating || item.rating || null,
          notes: item.notes || '',
          tags: item.media_item?.tags || item.tags || [],
          start_date: item.media_item?.start_date || null,
          end_date: item.media_item?.end_date || null,
          user_id: user.id,
          created_at: item.added_at || item.created_at,
          updated_at: item.updated_at
        }));
        setItems(mediaItems);
      } else {
        toast({
          variant: "destructive",
          title: "List not found",
          description: "The list you're looking for doesn't exist or you don't have permission to view it."
        });
        navigate('/lists');
      }
    } catch (error) {
      console.error('Error loading list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load list details."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async () => {
    if (!list || !user) return;

    try {
      await listsService.deleteList(list.id);
      toast({
        title: "List deleted",
        description: "Your list has been successfully deleted."
      });
      navigate('/lists');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete list."
      });
    }
  };

  const handleShare = async () => {
    if (!list) return;

    const url = `${window.location.origin}/lists/${list.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "List link has been copied to clipboard."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard."
      });
    }
  };

  const handleListUpdate = (updatedList: CustomList) => {
    setList(updatedList);
    setIsEditModalOpen(false);
    toast({
      title: "List updated",
      description: "Your list has been successfully updated."
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!list || !user) return;

    try {
      await listsService.removeItemFromList(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Item removed",
        description: "Item has been removed from the list."
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item from list."
      });
    }
  };

  const handleItemAdded = () => {
    loadListData(); // Refresh the list
    setIsAddModalOpen(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!list) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="List not found"
            description="The list you're looking for doesn't exist or you don't have permission to view it."
          />
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate('/lists')}>
              Back to Lists
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === list.user_id;
  const getPrivacyIcon = () => list.is_public ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />;
  const getPrivacyText = () => list.is_public ? 'Public' : 'Private';

  return (
    <AnimatedTransition>
      <Layout>
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/lists')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lists
            </Button>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share List
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete List
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete List</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{list.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteList} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* List Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6">
                {list.image_url ? (
                  <img 
                    src={list.image_url} 
                    alt={list.name}
                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full md:w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-2xl mb-2">{list.name}</CardTitle>
                      {list.description && (
                        <CardDescription className="text-base">
                          {list.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getPrivacyIcon()}
                      {getPrivacyText()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {items.length} items
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(list.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items ({items.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </Button>
                  {isOwner && (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Items
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 gap-4'
                }>
                  {items.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No items in this list"
                  description={isOwner ? "Add some media items to get started." : "This list is empty."}
                />
              )}
              {items.length === 0 && isOwner && (
                <div className="flex justify-center mt-4">
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Items
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit List Modal */}
          {isEditModalOpen && (
            <EditListModal
              list={list}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleListUpdate}
            />
          )}

          {/* Add Item Modal */}
          {isAddModalOpen && (
            <AddItemModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              listId={list.id}
              onItemAdded={handleItemAdded}
            />
          )}
        </div>
      </Layout>
    </AnimatedTransition>
  );
};

export default ListDetails;
