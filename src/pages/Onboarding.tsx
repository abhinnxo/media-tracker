import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { toast } from '@/hooks/use-toast';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');

  useEffect(() => {
    // Check if user already has a profile
    const checkProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking profile:', error);
        return;
      }

      // If user already has a username, redirect to home
      if (data && data.username) {
        navigate('/');
      }

      // Pre-fill display name if available from auth
      if (user.user_metadata?.full_name) {
        setDisplayName(user.user_metadata.full_name);
      }
    };

    checkProfile();
  }, [user, navigate]);

  const handleProfileImageUpload = (imageUrl: string) => {
    setProfileImage(imageUrl);
  };

  const handleProfileImageRemove = () => {
    setProfileImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: displayName,
          about: bio,
          avatar_url: profileImage || null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile created!",
        description: "Your profile has been set up successfully."
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome! Let's set up your profile</CardTitle>
            <CardDescription>
              Tell us a bit about yourself to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <ProfileImageUpload
                  currentImage={profileImage}
                  onImageUpload={handleProfileImageUpload}
                  onImageRemove={handleProfileImageRemove}
                  userName={displayName}
                  size="lg"
                />
                <p className="text-sm text-muted-foreground text-center">
                  You can skip this step and add a profile picture later
                </p>
              </div>

              {/* Existing form fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your-username"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Display Name"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Setting up profile...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
