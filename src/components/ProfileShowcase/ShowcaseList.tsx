
import React from "react";
import { MediaItem } from "@/lib/types";
import { ShowcaseItem } from "@/lib/profile-service";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";
import { useNavigate } from "react-router-dom";

interface ShowcaseListProps {
  items: MediaItem[];
  showcaseItems: ShowcaseItem[];
  loading: boolean;
  onRemove: (showcaseItem: ShowcaseItem) => void;
}

export const ShowcaseList: React.FC<ShowcaseListProps> = ({
  items,
  showcaseItems,
  loading,
  onRemove,
}) => {
  const navigate = useNavigate();

  if (!showcaseItems.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => {
        const showcaseItem = showcaseItems.find((s) => s.item_id === item.id);
        return (
          <div
            className="relative group"
            key={item.id}
          >
            <div className="flex bg-card rounded-lg border border-border hover:shadow-lg transition-all items-center pr-4 gap-2">
              <div
                className="shrink-0 w-32 cursor-pointer"
                onClick={() => navigate(`/details/${item.id}`)}
              >
                <MediaCard item={item} variant="list" />
              </div>
              <div className="flex-1" />
              <div className="absolute top-4 right-4 flex items-center">
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showcaseItem) onRemove(showcaseItem);
                  }}
                  disabled={loading}
                  aria-label="Remove from showcase"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
