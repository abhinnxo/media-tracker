
import React, { useState, useEffect, useRef } from 'react';
import { MediaCategory } from '@/lib/types';
import { mediaApi, MediaSearchResult } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface MediaSearchProps {
  category?: MediaCategory;
  onSelect: (result: MediaSearchResult) => void;
  className?: string;
}

export const MediaSearch: React.FC<MediaSearchProps> = ({
  category: initialCategory,
  onSelect,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>(
    initialCategory || MediaCategory.MOVIE
  );
  const debouncedQuery = useDebounce(query, 500);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await mediaApi.search(debouncedQuery, selectedCategory);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (result: MediaSearchResult) => {
    onSelect(result);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as MediaCategory);
    setResults([]);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <Label htmlFor="mediaSearch">Search for media</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={16} />
          </div>
          <Input
            id="mediaSearch"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 3) {
                setIsOpen(true);
              }
            }}
            placeholder={`Search for ${selectedCategory.toLowerCase()}...`}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Select 
          value={selectedCategory} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select media type" />
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
      
      {isLoading && (
        <div className="absolute right-[160px] top-[42px]">
          <Loader2 size={16} className="animate-spin text-primary" />
        </div>
      )}
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <ul className="py-1 max-h-80 overflow-auto">
            {results.map((result) => (
              <li
                key={result.id}
                className="px-3 py-3 hover:bg-accent cursor-pointer"
                onClick={() => handleSelect(result)}
              >
                <div className="flex items-start gap-3">
                  {result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt={result.title}
                      className="h-20 w-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="h-20 w-16 bg-muted flex items-center justify-center rounded text-xs text-muted-foreground">
                      No img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium truncate">{result.title}</p>
                        {result.year && (
                          <p className="text-sm text-muted-foreground">
                            Released: {result.year}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2 self-start">
                        {result.category}
                      </Badge>
                    </div>
                    
                    {result.creator && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">{result.category === MediaCategory.BOOK || result.category === MediaCategory.MANGA ? 'Author: ' : 'Director: '}</span>
                        {result.creator}
                      </p>
                    )}
                    
                    {result.genres && result.genres.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {result.genres.slice(0, 3).map((genre, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {result.genres.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{result.genres.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {result.episodeCount && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Episodes: </span>
                        {result.episodeCount}
                      </p>
                    )}
                    
                    {result.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
