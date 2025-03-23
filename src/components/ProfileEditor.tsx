
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '@/lib/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Upload, LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profile-service';
import { supabase } from '@/lib/supabase';

export const ProfileEditor = () => {
  const profile = useProfileStore(state => state.profile);
  const updateProfileState = useProfileStore(state => state.updateProfile);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = React.useState(profile.name || '');
  const [username, setUsername] = React.useState(profile.username || '');
  const [about, setAbout] = React.useState(profile.about || '');
  const [pronouns, setPronouns] = React.useState(profile.pronouns || 'they/them');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = React.useState(false);
  const [originalUsername, setOriginalUsername] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Load profile from Supabase on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const dbProfile = await profileService.getProfile(user.id);
        if (dbProfile) {
          // Update local state
          setName(dbProfile.name || '');
          setUsername(dbProfile.username || '');
          setAbout(dbProfile.about || '');
          setPronouns(dbProfile.pronouns || 'they/them');
          setWebsiteUrl(dbProfile.website || '');
          setOriginalUsername(dbProfile.username || '');
          
          // Update global state
          updateProfileState(dbProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
  }, [user, updateProfileState]);
  
  // Check username availability with debounce
  useEffect(() => {
    // Skip check if username hasn't changed or is less than 3 characters
    if (!username || username.length < 3 || username === originalUsername) {
      setUsernameAvailable(null);
      return;
    }
    
    const checkUsername = async () => {
      setUsernameChecking(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();
        
        if (error) throw error;
        
        // Username is available if no data was returned
        setUsernameAvailable(!data);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    };
    
    const timer = setTimeout(checkUsername, 500);
    
    return () => clearTimeout(timer);
  }, [username, originalUsername]);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setLoading(true);
    
    try {
      // Upload to Supabase storage
      const avatarUrl = await profileService.uploadAvatar(file, user.id);
      
      if (avatarUrl) {
        // Update local profile state
        const updatedProfile = { 
          ...profile,
          image: avatarUrl 
        };
        
        // Save to Supabase and update local state
        await profileService.updateProfile(updatedProfile, user.id);
        updateProfileState(updatedProfile);
        
        toast({
          title: "Image updated",
          description: "Your profile image has been updated successfully"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleSave = async () => {
    if (!user) return;
    
    // Validate username
    if (!username || username.length < 3) {
      toast({
        title: "Username required",
        description: "Please enter a username with at least 3 characters",
        variant: "destructive"
      });
      return;
    }
    
    // Check if username is available (if it was changed)
    if (username !== originalUsername && usernameAvailable === false) {
      toast({
        title: "Username not available",
        description: "Please choose a different username",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const updatedProfile = {
        ...profile,
        name,
        username,
        about,
        pronouns,
        website: websiteUrl || null
      };
      
      // Save to Supabase
      const savedProfile = await profileService.updateProfile(updatedProfile, user.id);
      
      if (savedProfile) {
        // Update local state
        updateProfileState(updatedProfile);
        setOriginalUsername(username);
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully"
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleShareProfile = () => {
    if (!username) {
      toast({
        title: "No username set",
        description: "Please save your profile with a username first",
        variant: "destructive"
      });
      return;
    }
    
    const url = `${window.location.origin}/user/${username}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({
            title: "Profile URL copied",
            description: "Share this link with others to show them your profile!"
          });
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "Could not copy the URL to clipboard."
          });
        });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast({
          title: "Profile URL copied",
          description: "Share this link with others to show them your profile!"
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Could not copy the URL to clipboard."
        });
      }
      
      document.body.removeChild(textArea);
    }
  };
  
  const getUsernameInputClasses = () => {
    // Only show validation styles if username has been changed from original
    if (username === originalUsername) {
      return "";
    }
    
    if (usernameAvailable === true) {
      return "border-green-500 focus-visible:ring-green-500";
    } else if (usernameAvailable === false) {
      return "border-red-500 focus-visible:ring-red-500";
    }
    
    return "";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.image} alt={name} />
            <AvatarFallback className="text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={triggerFileUpload}
            className="mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </span>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
        </div>
        
        <div className="flex-1 space-y-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  disabled={loading}
                  className={getUsernameInputClasses()}
                  required
                  minLength={3}
                />
                {usernameChecking && username !== originalUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!usernameChecking && username.length >= 3 && username !== originalUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {usernameAvailable === true && (
                      <span className="text-green-500">✓</span>
                    )}
                    {usernameAvailable === false && (
                      <span className="text-red-500">✗</span>
                    )}
                  </div>
                )}
              </div>
              {username && username.length < 3 && (
                <p className="text-xs text-muted-foreground">
                  Username must be at least 3 characters
                </p>
              )}
              {usernameAvailable === false && username !== originalUsername && (
                <p className="text-xs text-red-500">
                  This username is already taken
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <Textarea 
              id="about" 
              value={about} 
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              type="url"
              value={websiteUrl} 
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              disabled={loading}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Pronouns</Label>
        <RadioGroup 
          value={pronouns} 
          onValueChange={setPronouns}
          className="flex flex-wrap gap-4"
          disabled={loading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="he/him" id="he-him" />
            <Label htmlFor="he-him">He/Him</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="she/her" id="she-her" />
            <Label htmlFor="she-her">She/Her</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="they/them" id="they-them" />
            <Label htmlFor="they-them">They/Them</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleShareProfile} 
          disabled={loading || !username}
        >
          <LinkIcon className="mr-2 h-4 w-4" />
          Share Profile
        </Button>
        
        <Button onClick={handleSave} disabled={loading || (username !== originalUsername && usernameAvailable === false)}>
          {loading ? (
            <span className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};
