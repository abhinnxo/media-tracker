
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ImageUpload';
import { Camera, User } from 'lucide-react';

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
          <ImageUpload
            currentImage={currentImage}
            onImageUpload={onImageUpload}
            onImageRemove={onImageRemove}
            bucketName="avatars"
            acceptedTypes={['image/*']}
            maxSize={5}
          >
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {currentImage ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </ImageUpload>

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
