
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, Edit, Trash2, Plus, Crown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaCardMenuProps {
  onAddToShowcase?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canAddToShowcase?: boolean;
  showcaseButtonState?: 'can-add' | 'in-showcase' | 'showcase-full';
  showcaseCount?: number;
  maxShowcaseItems?: number;
}

export const MediaCardMenu: React.FC<MediaCardMenuProps> = ({
  onAddToShowcase,
  onEdit,
  onDelete,
  canAddToShowcase = true,
  showcaseButtonState = 'can-add',
  showcaseCount = 0,
  maxShowcaseItems = 3,
}) => {
  const getShowcaseMenuItem = () => {
    switch (showcaseButtonState) {
      case 'in-showcase':
        return (
          <DropdownMenuItem onClick={onAddToShowcase}>
            <Minus className="h-4 w-4 mr-2" />
            Remove from showcase
          </DropdownMenuItem>
        );
      case 'showcase-full':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem disabled className="opacity-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to showcase
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Showcase full ({showcaseCount}/{maxShowcaseItems}). Remove an item to add new ones.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <DropdownMenuItem onClick={onAddToShowcase} disabled={!canAddToShowcase}>
            <Plus className="h-4 w-4 mr-2" />
            Add to showcase
          </DropdownMenuItem>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-1">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {getShowcaseMenuItem()}
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
  );
};
