
import React from 'react';
import { useProfileStore } from '@/lib/profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const colorThemes = [
  {
    id: 'purple',
    name: 'Purple Haze',
    colors: ['#8F87F1', '#C68EFD', '#E9A5F1', '#FED2E2'],
    cssVars: {
      '--primary': '256 93% 74%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '269 97% 77%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '292 86% 80%',
      '--secondary-foreground': '0 0% 100%',
      '--muted': '336 100% 91%',
      '--muted-foreground': '0 0% 30%',
    }
  },
  {
    id: 'brown',
    name: 'Earthy Tones',
    colors: ['#FFDAB3', '#C8AAAA', '#9F8383', '#574964'],
    cssVars: {
      '--primary': '35 100% 85%',
      '--primary-foreground': '0 0% 20%',
      '--accent': '0 27% 73%',
      '--accent-foreground': '0 0% 20%',
      '--secondary': '0 19% 57%',
      '--secondary-foreground': '0 0% 100%',
      '--muted': '285 19% 34%',
      '--muted-foreground': '0 0% 90%',
    }
  },
  {
    id: 'default',
    name: 'Default Theme',
    colors: [],
    cssVars: {}
  }
];

export const ProfileAppearance = () => {
  const profile = useProfileStore(state => state.profile);
  const updateProfile = useProfileStore(state => state.updateProfile);
  
  const applyTheme = (themeId: string) => {
    const theme = colorThemes.find(t => t.id === themeId);
    if (!theme) return;
    
    if (themeId === 'default') {
      // Reset to the default theme
      document.documentElement.removeAttribute('data-theme');
      Object.keys(colorThemes[0].cssVars).forEach(key => {
        document.documentElement.style.removeProperty(key);
      });
    } else {
      // Apply custom theme
      document.documentElement.setAttribute('data-theme', themeId);
      Object.entries(theme.cssVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value as string);
      });
    }
    
    updateProfile({
      ...profile,
      theme: themeId
    });
    
    toast({
      title: "Theme updated",
      description: `Applied theme: ${theme.name}`
    });
  };
  
  // Apply saved theme on component mount
  React.useEffect(() => {
    if (profile.theme) {
      applyTheme(profile.theme);
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Theme Options</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a theme to personalize your experience
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {colorThemes.map((theme) => (
            <div 
              key={theme.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                profile.theme === theme.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => applyTheme(theme.id)}
            >
              <div className="font-medium mb-2">{theme.name}</div>
              
              {theme.colors.length > 0 ? (
                <div className="flex gap-1">
                  {theme.colors.map((color, idx) => (
                    <div 
                      key={idx}
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Default system theme</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => applyTheme('default')}
          className="mr-2"
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};
