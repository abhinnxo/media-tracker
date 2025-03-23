
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, BookOpen, Film, ThumbsUp, Calendar, LinkIcon } from 'lucide-react';
import { MediaCard } from '@/components/MediaCard';
import { MediaItem } from '@/lib/types';
import { ProfileSocialLink } from '@/lib/profile';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  about: string | null;
  pronouns: string | null;
  theme: string | null;
  website: string | null;
  user_id: string;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showcaseItems, setShowcaseItems] = useState<MediaItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<ProfileSocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      
      try {
        // Get profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
        
        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setProfile(profileData as ProfileData);
        
        // Get showcase items for this user
        if (profileData.user_id) {
          // First get IDs of showcased items
          const { data: showcaseData } = await supabase
            .from('showcase_items')
            .select('media_id')
            .eq('user_id', profileData.user_id);
          
          if (showcaseData && showcaseData.length > 0) {
            // Then get the actual media items
            const mediaIds = showcaseData.map(item => item.media_id);
            const { data: mediaData } = await supabase
              .from('media_items')
              .select('*')
              .in('id', mediaIds);
              
            if (mediaData) {
              setShowcaseItems(mediaData as MediaItem[]);
            }
          }
        }
        
        // Load social links from local storage (temporary solution)
        // In a real app, these would typically be stored in the database
        try {
          const storedProfile = localStorage.getItem('media-tracker-profile');
          if (storedProfile) {
            const profileData = JSON.parse(storedProfile);
            const profileState = profileData.state.profile;
            
            if (profileState && profileState.socialLinks) {
              setSocialLinks(profileState.socialLinks);
            }
          }
        } catch (e) {
          console.error('Error parsing profile data from storage:', e);
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchProfile();
    }
  }, [username]);
  
  const handleShareProfile = () => {
    const url = window.location.href;
    
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
  
  // Social icon mapping
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
      case 'instagram':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
      case 'github':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
      case 'website':
        return <LinkIcon size={16} />;
      default:
        return <LinkIcon size={16} />;
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  if (notFound) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-center text-muted-foreground mb-6">
              We couldn't find a user with the username "{username}".
            </p>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant="outline">Go Home</Button>
              </Link>
              <Link to="/register">
                <Button>Create Account</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <AnimatedTransition variant="fadeIn">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <Button variant="outline" onClick={handleShareProfile}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Share Profile
            </Button>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || profile?.username || ''} />
                  <AvatarFallback className="text-4xl">
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                
                {/* Username and pronouns */}
                <h2 className="text-xl font-bold">{profile?.full_name || profile?.username}</h2>
                {profile?.username && profile?.username !== profile?.full_name && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
                {profile?.pronouns && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.pronouns}</p>
                )}
                
                {/* Social links */}
                {socialLinks && socialLinks.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {socialLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                        title={link.platform}
                      >
                        {getSocialIcon(link.platform)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {/* About section */}
                {profile?.about && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">About</h3>
                    <p className="text-muted-foreground">{profile.about}</p>
                  </div>
                )}
                
                {/* Website */}
                {profile?.website && (
                  <div className="flex items-center gap-2 text-primary">
                    <LinkIcon size={16} />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Showcase items */}
        {showcaseItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Showcase</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {showcaseItems.map((item, index) => (
                <MediaCard key={item.id} item={item} delay={index} />
              ))}
            </div>
          </div>
        )}
      </AnimatedTransition>
    </div>
  );
};

export default UserProfile;
