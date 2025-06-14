
import React, { useState, useEffect } from "react";
import { MediaItem, MediaCategory, MediaStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, Edit, Star, Tag, User, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import { SeasonManagement } from "./SeasonManagement";

interface DetailedMediaViewProps {
  item: MediaItem;
}

export const DetailedMediaView: React.FC<DetailedMediaViewProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const categoryLabels = {
    [MediaCategory.MOVIE]: "Movie",
    [MediaCategory.TV_SERIES]: "TV Series",
    [MediaCategory.ANIME]: "Anime",
    [MediaCategory.BOOK]: "Book",
    [MediaCategory.MANGA]: "Manga",
  };

  const CategoryIcon = {
    [MediaCategory.MOVIE]: "🎬",
    [MediaCategory.TV_SERIES]: "📺",
    [MediaCategory.ANIME]: "🎌",
    [MediaCategory.BOOK]: "📚",
    [MediaCategory.MANGA]: "📖",
  }[item.category];

  const isShowCategory = item.category === MediaCategory.TV_SERIES || item.category === MediaCategory.ANIME;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image */}
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-muted">
            {!item.image_url || imageError ? (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {CategoryIcon}
              </div>
            ) : (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{categoryLabels[item.category]}</Badge>
              <StatusBadge status={item.status} />
            </div>
            <h1 className="text-4xl font-bold mb-4">{item.title}</h1>
            {item.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {item.rating && (
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="font-semibold">{item.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </CardContent>
              </Card>
            )}

            {item.year && (
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="font-semibold mb-1">{item.year}</div>
                  <p className="text-xs text-muted-foreground">Year</p>
                </CardContent>
              </Card>
            )}

            {isShowCategory && item.total_seasons && (
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="font-semibold mb-1">{item.total_seasons}</div>
                  <p className="text-xs text-muted-foreground">Seasons</p>
                </CardContent>
              </Card>
            )}

            {isShowCategory && item.overall_progress_percentage !== null && (
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="font-semibold mb-1">{item.overall_progress_percentage}%</div>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button asChild>
              <Link to={`/edit/${item.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue={isShowCategory ? "seasons" : "details"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {isShowCategory && (
            <TabsTrigger value="seasons" className="flex items-center gap-2">
              <Tv className="w-4 h-4" />
              Seasons & Progress
            </TabsTrigger>
          )}
          <TabsTrigger value="details">Details & Info</TabsTrigger>
        </TabsList>

        {isShowCategory && (
          <TabsContent value="seasons" className="mt-6">
            <SeasonManagement mediaItem={item} />
          </TabsContent>
        )}

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.creator && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Creator</p>
                      <p className="font-medium">{item.creator}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(item.start_date)}</p>
                  </div>
                </div>

                {item.end_date && (
                  <>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{formatDate(item.end_date)}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Added</p>
                    <p className="font-medium">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags and Notes */}
            <div className="space-y-6">
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {item.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {item.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
