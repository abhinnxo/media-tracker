
import React from "react";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";
import { useNavigate } from "react-router-dom";

interface AvailableLibraryListProps {
  items: MediaItem[];
  loading: boolean;
  onAdd: (item: MediaItem) => void;
}

export const AvailableLibraryList: React.FC<AvailableLibraryListProps> = ({
  items,
  loading,
  onAdd,
}) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.slice(0, 6).map(item => (
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
                size="sm"
                variant="default"
                onClick={() => onAdd(item)}
                disabled={loading}
                aria-label="Add to showcase"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
