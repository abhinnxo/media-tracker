import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaItem, MediaCategory, MediaStatus } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface MediaFormProps {
  initialData?: MediaItem;
  onSuccess?: () => void;
}

export const MediaForm: React.FC<MediaFormProps> = ({ 
  initialData,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<Partial<MediaItem>>(
    initialData || {
      title: '',
      description: '',
      imageUrl: '',
      category: MediaCategory.MOVIE,
      status: MediaStatus.TO_CONSUME,
      rating: undefined,
      tags: [],
      startDate: undefined,
      endDate: undefined,
      notes: '',
    }
  );
  
  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle category change
  const handleCategoryChange = (value: MediaCategory) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  // Handle status change
  const handleStatusChange = (value: MediaStatus) => {
    setFormData(prev => ({ ...prev, status: value }));
  };
  
  // Handle rating change
  const handleRatingChange = (value: string) => {
    const rating = value === '' ? undefined : parseInt(value, 10);
    setFormData(prev => ({ ...prev, rating }));
  };
  
  // Handle tag input
  const [tagInput, setTagInput] = useState('');
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };
  
  // Handle date changes
  const handleStartDateChange = (date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      startDate: date ? date.toISOString() : undefined,
    }));
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      endDate: date ? date.toISOString() : undefined,
    }));
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'PPP');
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.status) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Save the media item
      await mediaStore.save(formData as MediaItem);
      
      toast({
        title: initialData ? "Media updated" : "Media added",
        description: initialData
          ? `${formData.title} has been updated successfully`
          : `${formData.title} has been added to your collection`,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/library');
      }
    } catch (error) {
      console.error('Error saving media:', error);
      toast({
        title: "Error",
        description: "There was an error saving your media item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            required
            placeholder="Enter title"
          />
        </div>
        
        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          {formData.imageUrl && (
            <div className="mt-2 w-24 h-32 rounded overflow-hidden border border-border">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=No+Image';
                }}
              />
            </div>
          )}
        </div>
        
        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
          
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Enter a brief description"
            rows={3}
          />
        </div>
        
        {/* Rating */}
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-10)</Label>
          <Select
            value={formData.rating?.toString() || ''}
            onValueChange={handleRatingChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Rating</SelectItem>
              {[...Array(11)].map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i} / 10
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
            >
              Add
            </Button>
          </div>
          
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center bg-secondary px-2 py-1 rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? formatDate(formData.startDate) : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate ? new Date(formData.startDate) : undefined}
                  onSelect={handleStartDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? formatDate(formData.endDate) : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate ? new Date(formData.endDate) : undefined}
                  onSelect={handleEndDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            placeholder="Add personal notes or thoughts"
            rows={4}
          />
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update' : 'Add'} Media
        </Button>
      </div>
    </form>
  );
};

export default MediaForm;
