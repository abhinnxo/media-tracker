import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
  MediaItem,
  MediaFilterOptions,
  MediaCategory,
  MediaStatus,
} from "@/lib/types";
import { mediaStore } from "@/lib/store";
import { MediaCard } from "@/components/MediaCard";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedTransition } from "@/components/AnimatedTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, LayoutList, Plus, Search, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaDeleteDialog } from "@/components/MediaDeleteDialog";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { profileService, ShowcaseItem } from "@/lib/profile-service";

const MAX_SHOWCASE_ITEMS = 3;

const Library: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<
    MediaCategory | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus | "all">(
    "all"
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const [items, showcase] = await Promise.all([
          mediaStore.getAll(),
          profileService.getShowcaseItems(user.id)
        ]);
        setMediaItems(items);
        setFilteredItems(items);
        setShowcaseItems(showcase);
      } catch (error) {
        console.error("Error fetching media items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = [...mediaItems];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.creator?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  }, [mediaItems, searchQuery, selectedCategory, selectedStatus]);

  // Handle showcase operations
  const handleAddToShowcase = async (item: MediaItem) => {
    if (!user) return;

    const isInShowcase = showcaseItems.some(s => s.item_id === item.id);
    
    if (isInShowcase) {
      // Remove from showcase
      const showcaseItem = showcaseItems.find(s => s.item_id === item.id);
      if (showcaseItem) {
        try {
          const success = await profileService.removeFromShowcase(showcaseItem.id);
          if (success) {
            setShowcaseItems(prev => prev.filter(s => s.id !== showcaseItem.id));
            toast({
              title: "Removed from showcase",
              description: `"${item.title}" was removed from your showcase.`,
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to remove item from showcase.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Add to showcase
      if (showcaseItems.length >= MAX_SHOWCASE_ITEMS) {
        toast({
          title: "Showcase full",
          description: `You can only showcase up to ${MAX_SHOWCASE_ITEMS} items. Remove an item first.`,
          variant: "destructive"
        });
        return;
      }

      try {
        const newShowcaseItem = await profileService.addToShowcase(
          user.id,
          item.category,
          item.id,
          item.title,
          item.image_url
        );

        if (newShowcaseItem) {
          setShowcaseItems(prev => [...prev, newShowcaseItem]);
          toast({
            title: "Added to showcase",
            description: `"${item.title}" was added to your showcase.`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add item to showcase.",
          variant: "destructive",
        });
      }
    }
  };

  // Edit handler
  const handleEdit = (item: MediaItem) => {
    navigate(`/edit/${item.id}`);
  };

  // Click delete (open modal, don't delete instantly)
  const handleDelete = (item: MediaItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await mediaStore.delete(itemToDelete.id);
      
      // Also remove from showcase if it's there
      const showcaseItem = showcaseItems.find(s => s.item_id === itemToDelete.id);
      if (showcaseItem && user) {
        await profileService.removeFromShowcase(showcaseItem.id);
        setShowcaseItems(prev => prev.filter(s => s.id !== showcaseItem.id));
      }
      
      setMediaItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      setFilteredItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      toast({
        title: "Deleted",
        description: `"${itemToDelete.title}" was removed from your library.`,
      });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <div className="space-y-4 sm:space-y-6">
        <AnimatedTransition
          variant="fadeIn"
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
          <div className="contents items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-semibold">
                  Your Library
                </h1>
                {showcaseItems.length > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Crown size={12} className="mr-1" />
                    Showcase: {showcaseItems.length}/{MAX_SHOWCASE_ITEMS}
                  </Badge>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                {mediaItems.length} {mediaItems.length === 1 ? "item" : "items"}{" "}
                in your collection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="sm:flex hidden"
              >
                {viewMode === "grid" ? (
                  <LayoutList size={16} />
                ) : (
                  <LayoutGrid size={16} />
                )}
              </Button>
              <Button asChild>
                <Link to="/add" className="flex items-center">
                  <Plus className="mr-1 h-4 w-4" /> Add Media
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedTransition>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs
            value={selectedCategory}
            onValueChange={(value) =>
              setSelectedCategory(value as MediaCategory | "all")
            }
            className="w-full overflow-x-auto"
          >
            <TabsList className="w-full sm:w-auto justify-start">
              <TabsTrigger value="all" className="whitespace-nowrap">
                All
              </TabsTrigger>
              <TabsTrigger
                value={MediaCategory.MOVIE}
                className="whitespace-nowrap"
              >
                Movies
              </TabsTrigger>
              <TabsTrigger
                value={MediaCategory.TV_SERIES}
                className="whitespace-nowrap"
              >
                TV Series
              </TabsTrigger>
              <TabsTrigger
                value={MediaCategory.ANIME}
                className="whitespace-nowrap"
              >
                Anime
              </TabsTrigger>
              <TabsTrigger
                value={MediaCategory.BOOK}
                className="whitespace-nowrap"
              >
                Books
              </TabsTrigger>
              <TabsTrigger
                value={MediaCategory.MANGA}
                className="whitespace-nowrap"
              >
                Manga
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as MediaStatus | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={MediaStatus.TO_CONSUME}>
                  To Watch/Read
                </SelectItem>
                <SelectItem value={MediaStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={MediaStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={MediaStatus.ON_HOLD}>On Hold</SelectItem>
                <SelectItem value={MediaStatus.DROPPED}>Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="sm:hidden flex"
            >
              {viewMode === "grid" ? (
                <LayoutList size={16} />
              ) : (
                <LayoutGrid size={16} />
              )}
            </Button>
          </div>
        </div>

        {mediaItems.length === 0 ? (
          <EmptyState />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            type="noResults"
            actionLabel="Clear Filters"
            actionLink="/library"
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6"
                : "space-y-4"
            }
          >
            {filteredItems.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                delay={index}
                variant={viewMode}
                onAddToShowcase={() => handleAddToShowcase(item)}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
                canAddToShowcase={true}
                isInShowcase={showcaseItems.some(s => s.item_id === item.id)}
                showcaseCount={showcaseItems.length}
                maxShowcaseItems={MAX_SHOWCASE_ITEMS}
              />
            ))}
            <MediaDeleteDialog
              open={deleteModalOpen}
              onOpenChange={setDeleteModalOpen}
              onConfirm={confirmDelete}
              isLoading={isLoading}
              title="Delete media?"
              description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Library;
