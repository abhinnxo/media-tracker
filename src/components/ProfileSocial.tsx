
import React from 'react';
import { useProfileStore } from '@/lib/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Book, 
  Heart, 
  Globe, 
  Github, 
  Youtube, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, SocialLink } from '@/lib/profile-service';

// Define social platforms with their icons and placeholders
const socialPlatforms = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    placeholder: 'https://instagram.com/username',
    prefix: 'https://instagram.com/'
  },
  { 
    id: 'twitter', 
    name: 'Twitter', 
    icon: Twitter, 
    placeholder: 'https://twitter.com/username',
    prefix: 'https://twitter.com/'
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    placeholder: 'https://linkedin.com/in/username',
    prefix: 'https://linkedin.com/in/'
  },
  { 
    id: 'myanimelist', 
    name: 'MyAnimeList', 
    icon: Heart, 
    placeholder: 'https://myanimelist.net/profile/username',
    prefix: 'https://myanimelist.net/profile/'
  },
  { 
    id: 'goodreads', 
    name: 'Goodreads', 
    icon: Book, 
    placeholder: 'https://goodreads.com/user/show/username',
    prefix: 'https://goodreads.com/user/show/'
  },
  { 
    id: 'github', 
    name: 'GitHub', 
    icon: Github, 
    placeholder: 'https://github.com/username',
    prefix: 'https://github.com/'
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube, 
    placeholder: 'https://youtube.com/@username',
    prefix: 'https://youtube.com/@'
  },
  { 
    id: 'website', 
    name: 'Personal Website', 
    icon: Globe, 
    placeholder: 'https://yourwebsite.com',
    prefix: ''
  }
];

export const ProfileSocial = () => {
  const profile = useProfileStore(state => state.profile);
  const updateProfile = useProfileStore(state => state.updateProfile);
  const { user } = useAuth();
  
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>([]);
  const [selectedPlatform, setSelectedPlatform] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  // Load social links
  React.useEffect(() => {
    const loadSocialLinks = async () => {
      if (!user) return;
      
      try {
        const links = await profileService.getSocialLinks(user.id);
        setSocialLinks(links);
      } catch (error) {
        console.error('Error loading social links:', error);
      }
    };
    
    loadSocialLinks();
  }, [user]);
  
  const handleAddPlatform = async () => {
    if (!selectedPlatform || !user) return;
    
    // Check if platform already exists
    const exists = socialLinks.some(link => link.platform === selectedPlatform);
    if (exists) {
      toast({
        title: "Platform already added",
        description: "You've already added this platform",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Get platform details
      const platform = socialPlatforms.find(p => p.id === selectedPlatform);
      
      // Add new platform with empty URL
      const newLink = await profileService.addSocialLink(
        user.id,
        selectedPlatform,
        '',
        platform?.prefix || ''
      );
      
      if (newLink) {
        setSocialLinks([...socialLinks, newLink]);
        setSelectedPlatform('');
        
        toast({
          title: "Platform added",
          description: `${platform?.name} has been added to your profile`
        });
      }
    } catch (error) {
      console.error('Error adding platform:', error);
      toast({
        title: "Error",
        description: "Failed to add platform",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUrlChange = async (linkId: number, value: string) => {
    try {
      await profileService.updateSocialLink(linkId, { url: value });
      
      setSocialLinks(socialLinks.map(link => 
        link.id === linkId ? { ...link, url: value } : link
      ));
    } catch (error) {
      console.error('Error updating social link:', error);
    }
  };
  
  const handleRemovePlatform = async (linkId: number) => {
    setLoading(true);
    
    try {
      const success = await profileService.deleteSocialLink(linkId);
      
      if (success) {
        setSocialLinks(socialLinks.filter(link => link.id !== linkId));
        
        toast({
          title: "Platform removed",
          description: "Social link has been removed"
        });
      }
    } catch (error) {
      console.error('Error removing platform:', error);
      toast({
        title: "Error",
        description: "Failed to remove platform",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = () => {
    toast({
      title: "Social links updated",
      description: "Your social links have been updated successfully"
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Social Media Links</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your social profiles
        </p>
        
        {socialLinks.length > 0 ? (
          <div className="space-y-4">
            {socialLinks.map((link) => {
              const platform = socialPlatforms.find(p => p.id === link.platform);
              const Icon = platform?.icon || Globe;
              
              return (
                <div key={link.id} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Input
                    value={link.url}
                    onChange={(e) => handleUrlChange(link.id, e.target.value)}
                    placeholder={platform?.placeholder}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePlatform(link.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">No social links added yet</p>
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="platform">Add Platform</Label>
          <select
            id="platform"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            <option value="">Select a platform</option>
            {socialPlatforms
              .filter(platform => !socialLinks.some(link => link.platform === platform.id))
              .map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
          </select>
        </div>
        <Button 
          onClick={handleAddPlatform}
          disabled={!selectedPlatform || loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
