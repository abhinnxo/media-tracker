
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Edit3,
  Eye,
  EyeOff,
  Star,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomList } from '@/lib/lists-service';
import { ImageUpload } from '@/components/ImageUpload';
import { Link } from 'react-router-dom';
import { AnimatedTransition } from '@/components/AnimatedTransition';

interface EnhancedListCardProps {
  list: CustomList;
  itemCount?: number;
  averageRating?: number;
  onUpdateCover: (listId: string, coverUrl: string | null) => void;
  onDelete: (listId: string) => void;
  index?: number;
}

export const EnhancedListCard: React.FC<EnhancedListCardProps> = ({
  list,
  itemCount = 0,
  averageRating,
  onUpdateCover,
  onDelete,
  index = 0
}) => {
  const [isEditCoverOpen, setIsEditCoverOpen] = useState(false);

  const handleCoverChange = (imageUrl: string | null) => {
    onUpdateCover(list.id, imageUrl);
    setIsEditCoverOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPrivacyIcon = () => {
    return list.privacy_setting === 'public' ? (
      <Eye className="h-3 w-3" />
    ) : (
      <EyeOff className="h-3 w-3" />
    );
  };

  return (
    <AnimatedTransition variant="slideUp" delay={0.1 * index}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden">
        {/* Cover Image Section */}
        <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          {list.cover_image_url ? (
            <img
              src={list.cover_image_url}
              alt={`${list.name} cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">
                  {list.name.substring(0, 20)}
                  {list.name.length > 20 ? '...' : ''}
                </p>
              </div>
            </div>
          )}
          
          {/* Edit Cover Button - appears on hover */}
          <Dialog open={isEditCoverOpen} onOpenChange={setIsEditCoverOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Cover Image</DialogTitle>
                <DialogDescription>
                  Upload a new cover image or provide an image URL for "{list.name}"
                </DialogDescription>
              </DialogHeader>
              <ImageUpload
                currentImage={list.cover_image_url || undefined}
                onImageChange={handleCoverChange}
              />
            </DialogContent>
          </Dialog>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                <Link to={`/lists/${list.id}`}>
                  {list.name}
                </Link>
              </CardTitle>
              
              {list.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {list.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/lists/${list.id}`}>View List</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/lists/${list.id}/edit`}>Edit Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditCoverOpen(true)}>
                  Edit Cover
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(list.id)}
                >
                  Delete List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="font-medium">{itemCount}</span>
              <span>{itemCount === 1 ? 'item' : 'items'}</span>
            </div>
            
            {averageRating && averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Privacy and Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge 
              variant={list.privacy_setting === 'public' ? 'default' : 'secondary'}
              className="h-5 px-2 py-0 text-xs"
            >
              <span className="flex items-center gap-1">
                {getPrivacyIcon()}
                {list.privacy_setting}
              </span>
            </Badge>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Updated {formatDate(list.updated_at)}</span>
            </div>
          </div>

          {/* Creation Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>Created {formatDate(list.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
};
