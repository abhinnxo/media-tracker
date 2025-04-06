
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { tmdbApi } from '@/lib/api/tmdb';
import { Film, Play, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface TrailerResult {
  id: string;
  title: string;
  imageUrl: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  trailerKey?: string;
  overview: string;
}

export function TrendingTrailers() {
  const [trailers, setTrailers] = useState<TrailerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        setLoading(true);
        const results = await tmdbApi.getTrendingTrailers();
        setTrailers(results);
      } catch (error) {
        console.error('Error fetching trailers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailers();
  }, []);

  const handleWatchTrailer = (trailerKey: string | undefined) => {
    if (trailerKey) {
      setSelectedTrailer(trailerKey);
      setShowVideoModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading trending trailers...</span>
      </div>
    );
  }

  if (trailers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Film className="h-12 w-12 mb-2" />
        <p>No trending trailers available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {trailers.map((trailer) => (
          <Card key={trailer.id} className="overflow-hidden transition-all hover:shadow-lg">
            <div className="relative">
              <AspectRatio ratio={2/3}>
                {trailer.imageUrl ? (
                  <img 
                    src={trailer.imageUrl} 
                    alt={trailer.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Film className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="transition-transform hover:scale-105"
                  onClick={() => handleWatchTrailer(trailer.trailerKey)}
                  disabled={!trailer.trailerKey}
                >
                  <Play className="mr-1 h-4 w-4" />
                  Watch Trailer
                </Button>
              </div>
            </div>
            <CardHeader className="p-3">
              <CardTitle className="text-base line-clamp-1">{trailer.title}</CardTitle>
              <CardDescription className="flex items-center">
                <span className="capitalize">{trailer.mediaType}</span>
                {trailer.releaseDate && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{new Date(trailer.releaseDate).getFullYear()}</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* YouTube Trailer Modal */}
      <Sheet open={showVideoModal} onOpenChange={setShowVideoModal}>
        <SheetContent className="sm:max-w-xl w-full">
          <SheetHeader className="mb-4">
            <SheetTitle>Trailer</SheetTitle>
            <SheetDescription>
              Watch the official trailer
            </SheetDescription>
          </SheetHeader>
          {selectedTrailer && (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedTrailer}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
