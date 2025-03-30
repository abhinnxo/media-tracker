
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, BookmarkPlus, Star, Youtube, Users, MapPin } from 'lucide-react';
import { MediaCategory } from '@/lib/types';
import { MediaSearchResult } from '@/lib/api';
import { mediaDetailsApi } from '@/lib/api/mediaDetails';

interface DetailedMediaViewProps {
  media: MediaSearchResult;
}

export const DetailedMediaView: React.FC<DetailedMediaViewProps> = ({ media }) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const detailedInfo = await mediaDetailsApi.getDetails(media.id, media.category);
        setDetails(detailedInfo);
      } catch (error) {
        console.error('Error fetching detailed media info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [media.id, media.category]);
  
  const getCategoryLabel = (category: MediaCategory) => {
    switch (category) {
      case MediaCategory.MOVIE:
        return 'Movie';
      case MediaCategory.TV_SERIES:
        return 'TV Series';
      case MediaCategory.ANIME:
        return 'Anime';
      case MediaCategory.MANGA:
        return 'Manga';
      case MediaCategory.BOOK:
        return 'Book';
      default:
        return 'Media';
    }
  };
  
  return (
    <Card className="w-full overflow-hidden border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Media Poster/Cover */}
        <div className="md:col-span-1 p-6">
          <div className="aspect-[2/3] rounded-md overflow-hidden bg-muted">
            {media.imageUrl ? (
              <img 
                src={media.imageUrl} 
                alt={`${media.title} cover`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-3">
            <Button variant="outline" className="w-full">
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Add to Library
            </Button>
            
            <Button variant="outline" className="w-full">
              <Star className="mr-2 h-4 w-4" />
              Rate & Review
            </Button>
            
            {details?.externalLinks?.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-sm">External Links</h4>
                {details.externalLinks.map((link: any, index: number) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {link.site}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Media Details */}
        <div className="md:col-span-2 p-6 pt-0 md:pt-6">
          <CardHeader className="px-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>{getCategoryLabel(media.category)}</Badge>
              {media.year && <Badge variant="outline">{media.year}</Badge>}
              {media.episodeCount && (
                <Badge variant="outline">{media.episodeCount} Episodes</Badge>
              )}
            </div>
            
            <CardTitle className="text-2xl md:text-3xl">{media.title}</CardTitle>
            
            {media.creator && (
              <CardDescription className="text-base">
                {media.category === MediaCategory.BOOK || media.category === MediaCategory.MANGA 
                  ? `By ${media.creator}` 
                  : `Directed by ${media.creator}`}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="px-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {(media.category === MediaCategory.MOVIE || media.category === MediaCategory.TV_SERIES) && (
                  <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                )}
                {details?.trailer && (
                  <TabsTrigger value="trailer">Trailer</TabsTrigger>
                )}
                {details?.whereToWatch && (
                  <TabsTrigger value="watch">Where to Watch</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-4">
                  {media.genres && media.genres.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {media.genres.map((genre, index) => (
                          <Badge key={index} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Synopsis</h3>
                    <p className="text-sm text-muted-foreground">
                      {media.description || 'No description available.'}
                    </p>
                  </div>
                  
                  {details?.rating && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Rating</h3>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        <span>{details.rating}</span>
                        {details.voteCount && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({details.voteCount} votes)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {(media.category === MediaCategory.MOVIE || media.category === MediaCategory.TV_SERIES) && (
                <TabsContent value="cast" className="mt-0">
                  {loading ? (
                    <div className="h-40 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : details?.cast ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Cast</h3>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {details.cast.map((person: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span className="font-medium">{person.name}</span>
                                <span className="text-muted-foreground">{person.character}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      {details.crew && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Crew</h3>
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                              {details.crew.map((person: any, index: number) => (
                                <div key={index} className="flex justify-between">
                                  <span className="font-medium">{person.name}</span>
                                  <span className="text-muted-foreground">{person.job}</span>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p>No cast information available</p>
                    </div>
                  )}
                </TabsContent>
              )}
              
              {details?.trailer && (
                <TabsContent value="trailer" className="mt-0">
                  <div className="aspect-video rounded-md overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${details.trailer}`}
                      title={`${media.title} trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </TabsContent>
              )}
              
              {details?.whereToWatch && (
                <TabsContent value="watch" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium mb-2">Where to Watch</h3>
                    
                    {details.whereToWatch.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {details.whereToWatch.map((platform: any, index: number) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            className="h-auto py-2"
                            asChild
                          >
                            <a href={platform.url} target="_blank" rel="noopener noreferrer">
                              {platform.logo ? (
                                <img 
                                  src={platform.logo} 
                                  alt={platform.name} 
                                  className="h-6 mr-2" 
                                />
                              ) : (
                                <MapPin className="mr-2 h-4 w-4" />
                              )}
                              {platform.name}
                            </a>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p>No streaming information available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};
