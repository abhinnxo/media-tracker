
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MediaCategory, MediaStatus } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileType, 
  Search, 
  FileText, 
  AlertCircle, 
  Edit,
  Loader,
  RefreshCw 
} from 'lucide-react';
import { MediaSearch } from '@/components/MediaSearch';
import { MediaSearchResult, mediaApi } from '@/lib/api';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';

interface DetectedMedia {
  id: string;
  title: string;
  type: MediaCategory;
  status: MediaStatus;
  searched?: boolean;
  searching?: boolean;
  imageUrl?: string;
  description?: string;
  year?: string;
  creator?: string;
  genres?: string[];
}

const ImportMedia: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectedMedia, setDetectedMedia] = useState<DetectedMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file extension
    const validExtensions = ['.md', '.txt', '.doc', '.docx'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please upload a file with one of the following extensions: ${validExtensions.join(', ')}`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For simplicity, we'll treat all files as text files
    // In a production app, you'd want to use specific libraries for doc/docx parsing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const detectMediaFromText = (text: string): DetectedMedia[] => {
    // This is a simplified detection algorithm
    // In a real application, you might use a more sophisticated NLP approach
    // or integrate with an API that can extract entities
    
    // Split text into lines and look for potential media titles
    const lines = text.split(/\r?\n/);
    const mediaPatterns = [
      { regex: /\b(?:watch|watching|watched|movie[s]?:?)\s+([^.!?]+)/i, type: MediaCategory.MOVIE },
      { regex: /\b(?:tv series|series|show[s]?:?|episode[s]?)\s+([^.!?]+)/i, type: MediaCategory.TV_SERIES },
      { regex: /\b(?:anime|watched anime|watching anime)\s+([^.!?]+)/i, type: MediaCategory.ANIME },
      { regex: /\b(?:manga|read manga|reading manga)\s+([^.!?]+)/i, type: MediaCategory.MANGA },
      { regex: /\b(?:book|read|reading)\s+([^.!?]+)/i, type: MediaCategory.BOOK },
    ];
    
    const detectedItems: DetectedMedia[] = [];
    
    // Also look for standalone titles (one title per line)
    lines.forEach(line => {
      line = line.trim();
      if (line.length > 3 && line.length < 100) {  // Reasonable title length
        let matched = false;
        
        // Try to match patterns first
        for (const pattern of mediaPatterns) {
          const match = line.match(pattern.regex);
          if (match && match[1]) {
            const title = match[1].trim();
            if (title.length > 2) {  // Avoid too short titles
              detectedItems.push({
                id: Math.random().toString(36).substring(2, 11),
                title,
                type: pattern.type,
                status: MediaStatus.TO_CONSUME,
                searched: false
              });
              matched = true;
              break;
            }
          }
        }
        
        // If no pattern matched and the line looks like a title, add it as a generic movie
        if (!matched && !line.includes(':') && line.length > 3) {
          // Filter out common non-title lines
          const commonWords = ['chapter', 'episode', 'volume', 'part', 'the end', 'conclusion'];
          const isCommonWord = commonWords.some(word => line.toLowerCase().includes(word));
          
          if (!isCommonWord) {
            detectedItems.push({
              id: Math.random().toString(36).substring(2, 11),
              title: line,
              type: MediaCategory.MOVIE, // Default to movie
              status: MediaStatus.TO_CONSUME,
              searched: false
            });
          }
        }
      }
    });
    
    // Remove duplicates based on title
    const uniqueItems = detectedItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.title.toLowerCase() === item.title.toLowerCase())
    );
    
    return uniqueItems;
  };

  const handleAnalyzeFile = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const text = await extractTextFromFile(file);
      const media = detectMediaFromText(text);
      
      if (media.length === 0) {
        setError("No media entries detected in the text. Try a different file or format.");
      } else {
        setDetectedMedia(media);
        setError(null);
        toast({
          title: "File analyzed successfully",
          description: `${media.length} media entries detected`,
        });
      }
    } catch (err) {
      console.error("Error analyzing file:", err);
      setError("Failed to analyze file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (id: string, newType: MediaCategory) => {
    setDetectedMedia(prev => 
      prev.map(item => 
        item.id === id ? { ...item, type: newType, searched: false } : item
      )
    );
    
    toast({
      title: "Media type updated",
      description: "The media type has been updated successfully.",
    });
  };

  const handleStatusChange = (id: string, newStatus: MediaStatus) => {
    setDetectedMedia(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    
    toast({
      title: "Watch status updated",
      description: "The watch status has been updated successfully.",
    });
  };

  const handleAddToLibrary = async (media: DetectedMedia) => {
    try {
      await mediaStore.add({
        title: media.title,
        description: media.description || null,
        image_url: media.imageUrl || null,
        category: media.type,
        status: media.status,
        rating: null,
        tags: media.genres || [],
        start_date: null,
        end_date: null,
        notes: null,
        year: media.year || null,
        creator: media.creator || null,
        genres: media.genres || null,
      });
      
      // Remove from the list
      setDetectedMedia(prev => prev.filter(item => item.id !== media.id));
      
      toast({
        title: "Added to library",
        description: `"${media.title}" has been added to your library.`,
      });
    } catch (error) {
      console.error("Error adding to library:", error);
      toast({
        title: "Error",
        description: "Failed to add media to your library.",
        variant: "destructive",
      });
    }
  };

  const handleResearch = (title: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(title)}`, '_blank');
  };

  const handleSearchAPI = async (media: DetectedMedia) => {
    setActiveSearchId(media.id);
    
    // Update the media item to show it's searching
    setDetectedMedia(prev => 
      prev.map(item => 
        item.id === media.id ? { ...item, searching: true } : item
      )
    );
    
    try {
      const results = await mediaApi.search(media.title, media.type);
      
      if (results.length > 0) {
        const firstResult = results[0];
        
        setDetectedMedia(prev => 
          prev.map(item => 
            item.id === media.id ? {
              ...item,
              searching: false,
              searched: true,
              title: firstResult.title,
              imageUrl: firstResult.imageUrl,
              description: firstResult.description,
              year: firstResult.year,
              creator: firstResult.creator,
              genres: firstResult.genres,
            } : item
          )
        );
        
        toast({
          title: "Media found",
          description: `Found detailed information for "${firstResult.title}"`,
        });
      } else {
        setDetectedMedia(prev => 
          prev.map(item => 
            item.id === media.id ? { ...item, searching: false } : item
          )
        );
        
        toast({
          title: "No results found",
          description: `Couldn't find information for "${media.title}"`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching API:", error);
      
      setDetectedMedia(prev => 
        prev.map(item => 
          item.id === media.id ? { ...item, searching: false } : item
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to search for media information.",
        variant: "destructive",
      });
    } finally {
      setActiveSearchId(null);
    }
  };

  const handleSelectMedia = (media: DetectedMedia, result: MediaSearchResult) => {
    setDetectedMedia(prev => 
      prev.map(item => 
        item.id === media.id ? {
          ...item,
          title: result.title,
          type: result.category,
          imageUrl: result.imageUrl,
          description: result.description,
          year: result.year,
          creator: result.creator,
          genres: result.genres,
          searched: true
        } : item
      )
    );
    
    toast({
      title: "Media selected",
      description: `Selected "${result.title}" from search results`,
    });
  };

  return (
    <Layout>
      <AnimatedTransition variant="fadeIn">
        <div className="container max-w-7xl mx-auto py-8">
          <h1 className="text-3xl font-bold mb-2">Import & Classify Media</h1>
          <p className="text-muted-foreground mb-6">
            Upload a text file containing media entries to automatically detect and add them to your library.
          </p>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload File
                </CardTitle>
                <CardDescription>
                  Upload a file (.md, .txt, .doc, .docx) containing your media list.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".md,.txt,.doc,.docx"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAnalyzeFile}
                      disabled={!file || isLoading}
                    >
                      {isLoading ? "Analyzing..." : "Analyze File"}
                    </Button>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {file && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>Selected file: {file.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {detectedMedia.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Detected Media ({detectedMedia.length})</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {detectedMedia.map((media) => (
                    <Card key={media.id} className="overflow-hidden">
                      <div className="flex flex-col h-full">
                        {media.searched ? (
                          <div className="flex flex-col md:flex-row h-full">
                            <div className="w-full md:w-1/3">
                              <div className="relative aspect-[2/3] w-full">
                                {media.imageUrl ? (
                                  <img 
                                    src={media.imageUrl} 
                                    alt={media.title}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=No+Image';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    No image available
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 p-4">
                              <h3 className="text-lg font-semibold mb-1">{media.title}</h3>
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="secondary">{media.type}</Badge>
                                {media.year && <Badge variant="outline">{media.year}</Badge>}
                              </div>
                              
                              {media.creator && (
                                <p className="text-sm mb-2">
                                  <span className="font-medium">
                                    {media.type === MediaCategory.BOOK || media.type === MediaCategory.MANGA ? 'Author: ' : 'Director: '}
                                  </span>
                                  {media.creator}
                                </p>
                              )}
                              
                              {media.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                  {media.description}
                                </p>
                              )}
                              
                              {media.genres && media.genres.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium mb-1">Genres:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {media.genres.map((genre, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {genre}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div>
                                  <label className="text-xs font-medium mb-1 block">Media Type</label>
                                  <Select
                                    value={media.type}
                                    onValueChange={(value) => handleTypeChange(media.id, value as MediaCategory)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={MediaCategory.MOVIE}>Movie</SelectItem>
                                      <SelectItem value={MediaCategory.TV_SERIES}>TV Series</SelectItem>
                                      <SelectItem value={MediaCategory.ANIME}>Anime</SelectItem>
                                      <SelectItem value={MediaCategory.BOOK}>Book</SelectItem>
                                      <SelectItem value={MediaCategory.MANGA}>Manga</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-medium mb-1 block">Status</label>
                                  <Select
                                    value={media.status}
                                    onValueChange={(value) => handleStatusChange(media.id, value as MediaStatus)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={MediaStatus.TO_CONSUME}>To Watch/Read</SelectItem>
                                      <SelectItem value={MediaStatus.IN_PROGRESS}>In Progress</SelectItem>
                                      <SelectItem value={MediaStatus.COMPLETED}>Completed</SelectItem>
                                      <SelectItem value={MediaStatus.ON_HOLD}>On Hold</SelectItem>
                                      <SelectItem value={MediaStatus.DROPPED}>Dropped</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <CardHeader>
                            <CardTitle className="text-lg">{media.title}</CardTitle>
                          </CardHeader>
                        )}
                        
                        {!media.searched && (
                          <CardContent>
                            <div className="grid gap-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Media Type</label>
                                  <Select
                                    value={media.type}
                                    onValueChange={(value) => handleTypeChange(media.id, value as MediaCategory)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={MediaCategory.MOVIE}>Movie</SelectItem>
                                      <SelectItem value={MediaCategory.TV_SERIES}>TV Series</SelectItem>
                                      <SelectItem value={MediaCategory.ANIME}>Anime</SelectItem>
                                      <SelectItem value={MediaCategory.BOOK}>Book</SelectItem>
                                      <SelectItem value={MediaCategory.MANGA}>Manga</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Status</label>
                                  <Select
                                    value={media.status}
                                    onValueChange={(value) => handleStatusChange(media.id, value as MediaStatus)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={MediaStatus.TO_CONSUME}>To Watch/Read</SelectItem>
                                      <SelectItem value={MediaStatus.IN_PROGRESS}>In Progress</SelectItem>
                                      <SelectItem value={MediaStatus.COMPLETED}>Completed</SelectItem>
                                      <SelectItem value={MediaStatus.ON_HOLD}>On Hold</SelectItem>
                                      <SelectItem value={MediaStatus.DROPPED}>Dropped</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <MediaSearch 
                                category={media.type}
                                onSelect={(result) => handleSelectMedia(media, result)}
                              />
                            </div>
                          </CardContent>
                        )}
                        
                        <CardFooter className="flex justify-between pt-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResearch(media.title)}
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Research
                            </Button>
                            
                            {media.searched ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSearchAPI(media)}
                                disabled={media.searching || activeSearchId === media.id}
                              >
                                {media.searching ? (
                                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                )}
                                Rescan
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSearchAPI(media)}
                                disabled={media.searching || activeSearchId === media.id}
                              >
                                {media.searching ? (
                                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Search className="h-4 w-4 mr-1" />
                                )}
                                Search API
                              </Button>
                            )}
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleAddToLibrary(media)}
                          >
                            Add to Library
                          </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default ImportMedia;
