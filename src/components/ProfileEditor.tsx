
import React from 'react';
import { useProfileStore } from '@/lib/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ProfileEditor = () => {
  const profile = useProfileStore(state => state.profile);
  const updateProfile = useProfileStore(state => state.updateProfile);
  
  const [name, setName] = React.useState(profile.name || '');
  const [username, setUsername] = React.useState(profile.username || '');
  const [about, setAbout] = React.useState(profile.about || '');
  const [pronouns, setPronouns] = React.useState(profile.pronouns || 'they/them');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a file reader to read the uploaded image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateProfile({ 
          ...profile,
          image: event.target.result as string 
        });
        toast({
          title: "Image updated",
          description: "Your profile image has been updated successfully"
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleSave = () => {
    updateProfile({
      ...profile,
      name,
      username,
      about,
      pronouns
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully"
    });
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
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
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
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
