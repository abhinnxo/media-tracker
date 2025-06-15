import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MediaItem, MediaStatus } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { DetailedMediaView } from '@/components/DetailedMediaView';
import { MediaSearchResult, mediaApi } from '@/lib/api';
import { MediaCategory } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Trash,
  Calendar,
  Tag,
  MessageCircle,
  Star,
  Film,
  Tv,
  Book,
  File
} from 'lucide-react';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailedMedia, setDetailedMedia] = useState<MediaSearchResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMediaItem = async () => {
      if (!id) return;

      try {
        const item = await mediaStore.getById(id);
        if (item) {
          setMediaItem(item);

          // Fix: Only setDetailedMedia if it's truly a MediaSearchResult, otherwise pass null.
          setDetailedMedia(null);
        } else {
          toast({
            title: "Media not found",
            description: "The requested media item couldn't be found",
            variant: "destructive",
          });
          navigate('/library');
        }
      } catch (error) {
        console.error('Error fetching media item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaItem();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!mediaItem) return;

    try {
      await mediaStore.delete(mediaItem.id);
      toast({
        title: "Media deleted",
        description: `${mediaItem.title} has been removed from your collection`,
      });
      navigate('/library');
    } catch (error) {
      console.error('Error deleting media item:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the media item",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: MediaStatus): string => {
    switch (status) {
      case MediaStatus.TO_CONSUME:
        return 'To Watch/Read';
      case MediaStatus.IN_PROGRESS:
        return 'In Progress';
      case MediaStatus.COMPLETED:
        return 'Completed';
      case MediaStatus.ON_HOLD:
        return 'On Hold';
      case MediaStatus.DROPPED:
        return 'Dropped';
      default:
        return status;
    }
  };

  const getCategoryIcon = () => {
    if (!mediaItem) return null;

    switch (mediaItem.category) {
      case 'movie':
        return <Film size={18} />;
      case 'tv-series':
      case 'anime':
        return <Tv size={18} />;
      case 'book':
      case 'manga':
        return <Book size={18} />;
      default:
        return <File size={18} />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = () => {
    if (!mediaItem) return '';

    switch (mediaItem.category) {
      case 'movie':
        return 'Movie';
      case 'tv-series':
        return 'TV Series';
      case 'anime':
        return 'Anime';
      case 'book':
        return 'Book';
      case 'manga':
        return 'Manga';
      default:
        return mediaItem.category;
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

  if (!mediaItem) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-2">Media Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The media item you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/library">Return to Library</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <div className=" gap-8">
          <AnimatedTransition variant="slideUp" className="space-y-6 order-1 md:order-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2 text-sm text-muted-foreground">
                  {getCategoryIcon()}
                  <span className="ml-1">{getCategoryLabel()}</span>
                </div>
                <h1 className="text-3xl font-semibold mb-3">{mediaItem.title}</h1>
                <StatusBadge status={mediaItem.status} size="lg" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to={`/edit/${mediaItem.id}`} className="flex items-center">
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                        <Trash size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{mediaItem.title}" from your collection. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User's personal notes section */}
            {mediaItem?.notes && (
              <div>
                <h2 className="flex items-center text-lg font-medium mb-2">
                  <MessageCircle size={18} className="mr-2" />
                  My Notes
                </h2>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="whitespace-pre-line">{mediaItem.notes}</p>
                </div>
              </div>
            )}

            {/* Display detailed media information */}
            {mediaItem && (
              <div className="mt-6">
                <DetailedMediaView item={mediaItem} />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                {mediaItem.start_date ? (
                  <span>Started on {formatDate(mediaItem.start_date)}</span>
                ) : mediaItem.end_date ? (
                  <span>Completed on {formatDate(mediaItem.end_date)}</span>
                ) : (
                  <span>No dates set</span>
                )}
              </div>

              {mediaItem.start_date && mediaItem.end_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>
                    {formatDate(mediaItem.start_date)} - {formatDate(mediaItem.end_date)}
                  </span>
                </div>
              )}

              {mediaItem.tags && mediaItem.tags.length > 0 && (
                <div>
                  <h2 className="flex items-center text-lg font-medium mb-2">
                    <Tag size={18} className="mr-2" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {mediaItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center bg-secondary px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatedTransition>
        </div>
      </div>
    </Layout>
  );
};

export default Details;
