
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Eye,
  Lock,
  Edit,
  Trash2,
  Share2,
  Users,
} from "lucide-react";
import { listsService } from "@/lib/lists-service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
}

interface EnhancedListCardProps {
  list: CustomList;
  itemCount?: number;
  averageRating?: number;
  onUpdateCover?: (listId: string, coverUrl: string | null) => Promise<void>;
  onDelete?: (listId: string) => Promise<void>;
  onUpdate?: () => void;
  showAuthor?: boolean;
  variant?: "default" | "compact";
  index?: number;
}

export const EnhancedListCard: React.FC<EnhancedListCardProps> = ({
  list,
  itemCount = 0,
  averageRating,
  onUpdateCover,
  onDelete,
  onUpdate,
  showAuthor = true,
  variant = "default",
  index,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);

  const isOwner = user?.id === list.user_id;

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (list.user_id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", list.user_id)
          .single();

        if (data) {
          setAuthorProfile(data);
        }
      }
    };

    fetchAuthorProfile();
  }, [list.user_id]);

  const handleView = () => {
    navigate(`/lists/${list.id}`);
  };

  const handleEdit = () => {
    // Open edit modal or navigate to edit page
    navigate(`/lists/${list.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this list?")) return;

    setIsLoading(true);
    try {
      if (onDelete) {
        await onDelete(list.id);
      } else {
        await listsService.deleteList(list.id);
        toast({
          title: "List deleted",
          description: "Your list has been successfully deleted.",
        });
      }
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting list:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete list. Please try again.",
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
        description: "List link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard.",
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Please login to like lists.",
      });
      return;
    }

    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    // TODO: Implement like functionality with API
  };

  const getPrivacyIcon = () => {
    return list.is_public ? (
      <Eye className="h-4 w-4" />
    ) : (
      <Lock className="h-4 w-4" />
    );
  };

  const getPrivacyText = () => {
    return list.is_public ? "Public" : "Private";
  };

  if (variant === "compact") {
    return (
      <Card
        className="w-full cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={handleView}
      >
        <CardContent className="p-0">
          <div className="flex h-32">
            {/* Image on the left */}
            <div className="w-48 flex-shrink-0">
              {list.image_url ? (
                <img
                  src={list.image_url}
                  alt={list.name}
                  className="w-full h-full object-cover rounded-l-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-l-lg flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary/40" />
                </div>
              )}
            </div>
            
            {/* Content on the right */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate pr-2">{list.name}</h3>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(); }}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {list.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {list.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {getPrivacyIcon()}
                    <span className="ml-1">{getPrivacyText()}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">{itemCount} items</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(list.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
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
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {showAuthor && authorProfile && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={authorProfile.avatar_url || ""}
                alt={authorProfile.full_name || "User"}
              />
              <AvatarFallback className="text-xs">
                {authorProfile.full_name
                  ? authorProfile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {authorProfile.full_name || "Anonymous"}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{itemCount} items</span>
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
              className={`gap-1 ${liked ? "text-red-500" : ""}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageCircle className="h-4 w-4" />0
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
