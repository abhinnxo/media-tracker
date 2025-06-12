
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, User, Upload, X } from 'lucide-react';
import { storageService } from '@/lib/storage-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onImageUpload,
  onImageRemove,
  userName,
  size = 'lg',
  showUploadButton = true
}) => {
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const getUserInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    try {
      const imageUrl = await storageService.uploadImage(file, user.id);
      if (imageUrl) {
        onImageUpload(imageUrl);
        toast({
          title: "Success",
          description: "Profile image uploaded successfully"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image"
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentImage} alt={userName} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {currentImage ? <User className="h-8 w-8" /> : getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </div>

      {showUploadButton && (
        <div className="space-y-2">
          <label htmlFor="profile-image-upload">
            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
              <div>
                <Camera className="h-4 w-4" />
                {currentImage ? 'Change Photo' : 'Upload Photo'}
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </Button>
          </label>

          {currentImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onImageRemove}
              className="text-destructive hover:text-destructive"
            >
              Remove Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
