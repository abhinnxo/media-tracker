
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, MoreHorizontal, Eye, Lock, Edit, Trash2, Share2, Users } from 'lucide-react';
import { CustomList } from '@/lib/types';
import { listsService } from '@/lib/lists-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EnhancedListCardProps {
  list: CustomList;
  onUpdate?: () => void;
  showAuthor?: boolean;
  variant?: 'default' | 'compact';
}

export const EnhancedListCard: React.FC<EnhancedListCardProps> = ({
  list,
  onUpdate,
  showAuthor = true,
  variant = 'default'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const isOwner = user?.id === list.user_id;

  const handleView = () => {
    navigate(`/lists/${list.id}`);
  };

  const handleEdit = () => {
    // Open edit modal or navigate to edit page
    navigate(`/lists/${list.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    setIsLoading(true);
    try {
      await listsService.deleteList(list.id, user!.id);
      toast({
        title: "List deleted",
        description: "Your list has been successfully deleted."
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete list. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
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

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Please login to like lists."
      });
      return;
    }

    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    
    // TODO: Implement like functionality with API
  };

  const getPrivacyIcon = () => {
    return list.is_public ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />;
  };

  const getPrivacyText = () => {
    return list.is_public ? 'Public' : 'Private';
  };

  if (variant === 'compact') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={handleView}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{list.name}</h3>
              {list.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{list.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getPrivacyIcon()}
                  <span className="ml-1">{getPrivacyText()}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">0 items</span>
              </div>
            </div>
            {list.image_url && (
              <img 
                src={list.image_url} 
                alt={list.name}
                className="w-12 h-12 rounded object-cover ml-3 flex-shrink-0"
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {list.image_url ? (
          <img 
            src={list.image_url} 
            alt={list.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Users className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            {getPrivacyIcon()}
            <span className="ml-1">{getPrivacyText()}</span>
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{list.name}</CardTitle>
            {list.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {list.description}
              </p>
            )}
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {showAuthor && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src="" alt="Author" />
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">by Username</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>0 items</span>
          <span>{new Date(list.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1 ${liked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageCircle className="h-4 w-4" />
              0
            </Button>
          </div>
          <Button onClick={handleView} size="sm">
            View List
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
