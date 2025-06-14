
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaCardMenuProps {
  onAddToShowcase?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canAddToShowcase?: boolean;
}

export const MediaCardMenu: React.FC<MediaCardMenuProps> = ({
  onAddToShowcase,
  onEdit,
  onDelete,
  canAddToShowcase = true,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="ml-1">
        <MoreHorizontal className="w-5 h-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {canAddToShowcase && (
        <DropdownMenuItem onClick={onAddToShowcase}>
          <Plus className="h-4 w-4 mr-2" />
          Add to showcase
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDelete} className="text-destructive">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
