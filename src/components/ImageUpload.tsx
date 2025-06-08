
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { storageService } from '@/lib/storage-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  className = ''
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const imageUrl = await storageService.uploadImage(file, user.id);
      if (imageUrl) {
        onImageChange(imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setUrlInput('');
      setUseUrl(false);
      toast.success('Image URL added');
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Cover Image</Label>
      
      {currentImage ? (
        <div className="relative">
          <div className="w-full h-48 bg-muted rounded-lg overflow-hidden border">
            <img
              src={currentImage}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {!useUrl ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop image here or click to browse</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseUrl(true)}
                >
                  Or use image URL instead
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button type="button" onClick={handleUrlSubmit}>
                  Add
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUseUrl(false)}
              >
                Or upload file instead
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </div>
  );
};
