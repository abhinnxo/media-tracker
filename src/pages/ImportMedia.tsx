
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
import { Upload, FileType, Search, FileText, AlertCircle } from 'lucide-react';

interface DetectedMedia {
  id: string;
  title: string;
  type: MediaCategory;
  status: MediaStatus;
}

const ImportMedia: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectedMedia, setDetectedMedia] = useState<DetectedMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
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
                status: MediaStatus.TO_CONSUME
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
              status: MediaStatus.TO_CONSUME
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
        item.id === id ? { ...item, type: newType } : item
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
        description: null,
        image_url: null,
        category: media.type,
        status: media.status,
        rating: null,
        tags: [],
        start_date: null,
        end_date: null,
        notes: null,
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {detectedMedia.map((media) => (
                    <Card key={media.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{media.title}</CardTitle>
                      </CardHeader>
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
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResearch(media.title)}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Research
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAddToLibrary(media)}
                        >
                          Add to Library
                        </Button>
                      </CardFooter>
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
