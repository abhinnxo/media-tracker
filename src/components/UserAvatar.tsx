
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileStore } from '@/lib/profile';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 'md', 
  showName = false,
  className = '' 
}) => {
  const { user } = useAuth();
  const profile = useProfileStore(state => state.profile);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Generate user initials for fallback
  const getUserInitials = () => {
    if (profile.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (profile.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayName = profile.name || profile.username || user?.email?.split('@')[0] || 'User';

  if (showName) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={profile.image} alt={displayName} />
          <AvatarFallback className={`${textSizes[size]} bg-primary text-primary-foreground`}>
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className={`font-medium ${textSizes[size]}`}>{displayName}</span>
          {profile.username && profile.name && (
            <span className="text-xs text-muted-foreground">@{profile.username}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={profile.image} alt={displayName} />
      <AvatarFallback className={`${textSizes[size]} bg-primary text-primary-foreground`}>
        {getUserInitials()}
      </AvatarFallback>
    </Avatar>
  );
};
