
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profile-service';
import { useProfileStore } from '@/lib/profile';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { supabase } from '@/lib/supabase';

const Onboarding = () => {
  const { user } = useAuth();
  const updateProfile = useProfileStore(state => state.updateProfile);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [pronouns, setPronouns] = useState('they/them');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
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
  }, [username]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to complete your profile",
        variant: "destructive"
      });
      return;
    }
    
    if (!username || username.length < 3) {
      toast({
        title: "Username required",
        description: "Please enter a username with at least 3 characters",
        variant: "destructive"
      });
      return;
    }
    
    if (usernameAvailable === false) {
      toast({
        title: "Username not available",
        description: "Please choose a different username",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const profileData = {
        name,
        username,
        about,
        pronouns
      };
      
      // Save to Supabase
      const savedProfile = await profileService.updateProfile(profileData, user.id);
      
      if (savedProfile) {
        // Update local state
        updateProfile(profileData);
        
        toast({
          title: "Profile created",
          description: "Your profile has been set up successfully!"
        });
        
        // Redirect to library or profile page
        navigate('/library');
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getUsernameInputClasses = () => {
    let baseClasses = "flex h-10 w-full rounded-md border px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    
    if (usernameAvailable === true) {
      return `${baseClasses} border-green-500 focus-visible:ring-green-500`;
    } else if (usernameAvailable === false) {
      return `${baseClasses} border-red-500 focus-visible:ring-red-500`;
    }
    
    return `${baseClasses} border-input`;
  };
  
  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      <AnimatedTransition variant="fadeIn">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Set up your profile to get started with Media Tracker
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                    minLength={3}
                    required
                  />
                  {usernameChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!usernameChecking && username.length >= 3 && (
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
                {usernameAvailable === false && (
                  <p className="text-xs text-red-500">
                    This username is already taken
                  </p>
                )}
                {usernameAvailable === true && (
                  <p className="text-xs text-green-500">
                    Username is available
                  </p>
                )}
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
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || usernameAvailable === false}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Profile...
                  </span>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </AnimatedTransition>
    </div>
  );
};

export default Onboarding;
