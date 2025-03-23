
import React, { useEffect } from 'react';
import { useProfileStore } from '@/lib/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profile-service';

export const ProfileEditor = () => {
  const profile = useProfileStore(state => state.profile);
  const updateProfileState = useProfileStore(state => state.updateProfile);
  const { user } = useAuth();
  
  const [name, setName] = React.useState(profile.name || '');
  const [username, setUsername] = React.useState(profile.username || '');
  const [about, setAbout] = React.useState(profile.about || '');
  const [pronouns, setPronouns] = React.useState(profile.pronouns || 'they/them');
  const [loading, setLoading] = React.useState(false);
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
          
          // Update global state
          updateProfileState(dbProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
  }, [user, updateProfileState]);
  
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
    
    setLoading(true);
    
    try {
      const updatedProfile = {
        ...profile,
        name,
        username,
        about,
        pronouns
      };
      
      // Save to Supabase
      const savedProfile = await profileService.updateProfile(updatedProfile, user.id);
      
      if (savedProfile) {
        // Update local state
        updateProfileState(updatedProfile);
        
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
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                disabled={loading}
              />
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
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
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
