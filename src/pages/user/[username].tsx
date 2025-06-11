import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, BookOpen, Film, ThumbsUp, Calendar, LinkIcon, Lock } from 'lucide-react';
import { MediaCard } from '@/components/MediaCard';
import { MediaItem } from '@/lib/types';
import { ProfileSocialLink } from '@/lib/profile';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PublicListsSection } from '@/components/PublicListsSection';

interface ProfileData {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  about: string | null;
  pronouns: string | null;
  theme: string | null;
  website: string | null;
  location: string | null;
  is_public: boolean | null;
  user_id: string;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showcaseItems, setShowcaseItems] = useState<MediaItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<ProfileSocialLink[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, favoriteGenres: [], joinDate: '' });
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
        
        // Check if profile is public
        if (!profileData.is_public) {
          setLoading(false);
          return; // Don't load additional data for private profiles
        }
        
        // Get showcase items for this user (only if public)
        if (profileData.user_id) {
          // Get showcase items from profile_showcase table
          const { data: showcaseData } = await supabase
            .from('profile_showcase')
            .select('*')
            .eq('user_id', profileData.user_id)
            .order('sort_order');
          
          if (showcaseData && showcaseData.length > 0) {
            // Convert showcase data to MediaItem format
            const mediaItems = showcaseData.map(item => ({
              id: item.item_id,
              title: item.title,
              image_url: item.image_url,
              category: item.item_type,
              status: 'completed',
              rating: null,
              tags: [],
              description: null,
              start_date: null,
              end_date: null,
              notes: null,
              created_at: item.created_at,
              updated_at: item.created_at,
              user_id: item.user_id
            }));
            setShowcaseItems(mediaItems as MediaItem[]);
          }

          // Get social links
          const { data: socialData } = await supabase
            .from('profile_social_links')
            .select('*')
            .eq('user_id', profileData.user_id)
            .eq('is_visible', true)
            .order('sort_order');

          if (socialData) {
            const formattedLinks = socialData.map(link => ({
              platform: link.platform,
              url: link.url
            }));
            setSocialLinks(formattedLinks);
          }

          // Get user stats
          const { data: mediaData } = await supabase
            .from('media_items')
            .select('category, created_at')
            .eq('user_id', profileData.user_id);

          if (mediaData) {
            const totalItems = mediaData.length;
            const categories = mediaData.reduce((acc: any, item) => {
              acc[item.category] = (acc[item.category] || 0) + 1;
              return acc;
            }, {});
            
            const favoriteGenres = Object.entries(categories)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([genre]) => genre);

            const joinDate = mediaData.length > 0 
              ? new Date(Math.min(...mediaData.map(item => new Date(item.created_at).getTime())))
              : new Date();

            setStats({
              totalItems,
              favoriteGenres,
              joinDate: joinDate.toLocaleDateString()
            });
          }
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

  // Generate user initials for default avatar
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    return 'U';
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

  // Show private profile message
  if (profile && !profile.is_public) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <AnimatedTransition variant="fadeIn">
          <Card className="mb-8">
            <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
              <Lock className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Private Profile</h2>
              <p className="text-center text-muted-foreground mb-4">
                This profile is set to private by the user.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || profile?.username || ''} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{profile?.full_name || profile?.username}</h3>
                  {profile?.username && profile?.username !== profile?.full_name && (
                    <p className="text-muted-foreground">@{profile.username}</p>
                  )}
                </div>
              </div>
              <Link to="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </CardContent>
          </Card>
        </AnimatedTransition>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <AnimatedTransition variant="fadeIn">
        {/* Banner Section */}
        {profile?.banner_url && (
          <div 
            className="w-full h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg overflow-hidden mb-6"
            style={{
              backgroundImage: `url(${profile.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

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
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {getUserInitials()}
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
                {profile?.location && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.location}</p>
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
                  <div className="flex items-center gap-2 text-primary mb-4">
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

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
                    <div className="text-sm text-muted-foreground">Items Tracked</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">{stats.favoriteGenres.length}</div>
                    <div className="text-sm text-muted-foreground">Favorite Genres</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg col-span-2 md:col-span-1">
                    <div className="text-sm font-bold text-primary">{stats.joinDate}</div>
                    <div className="text-sm text-muted-foreground">Member Since</div>
                  </div>
                </div>

                {/* Favorite Genres */}
                {stats.favoriteGenres.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Top Categories</h4>
                    <div className="flex gap-2 flex-wrap">
                      {stats.favoriteGenres.map((genre, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
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
