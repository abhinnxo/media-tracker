import { supabase } from './supabase';
import { Profile } from '@/lib/profile';

export interface DbProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  about: string | null;
  pronouns: string | null;
  theme: string | null;
  website: string | null;
  location: string | null;
  is_public: boolean | null;
  custom_theme_settings: any | null;
  updated_at: string | null;
}

export interface SocialLink {
  id: number;
  platform: string;
  username: string;
  url: string;
  is_visible: boolean;
  sort_order: number;
}

export interface ShowcaseItem {
  id: number;
  item_type: string;
  item_id: string;
  title: string;
  image_url: string | null;
  sort_order: number;
}

export interface PrivacySettings {
  show_stats: boolean;
  show_lists: boolean;
  show_activity: boolean;
  show_social_links: boolean;
  show_showcase: boolean;
  allow_discovery: boolean;
}

// Convert database profile to app profile
export const dbProfileToAppProfile = (dbProfile: DbProfile): Profile => {
  return {
    name: dbProfile.full_name || undefined,
    username: dbProfile.username || undefined,
    image: dbProfile.avatar_url || undefined,
    about: dbProfile.about || undefined,
    pronouns: dbProfile.pronouns || undefined,
    theme: dbProfile.theme || undefined,
    website: dbProfile.website || undefined,
    // Add new fields
    bannerUrl: dbProfile.banner_url || undefined,
    location: dbProfile.location || undefined,
    isPublic: dbProfile.is_public || false,
    customThemeSettings: dbProfile.custom_theme_settings || {},
  };
};

// Convert app profile to database profile fields
export const appProfileToDbProfile = (profile: Profile, userId: string): Partial<DbProfile> => {
  return {
    user_id: userId,
    full_name: profile.name || null,
    username: profile.username || null,
    avatar_url: profile.image || null,
    banner_url: (profile as any).bannerUrl || null,
    about: profile.about || null,
    pronouns: profile.pronouns || null,
    theme: profile.theme || null,
    website: profile.website || null,
    location: (profile as any).location || null,
    is_public: (profile as any).isPublic || false,
    custom_theme_settings: (profile as any).customThemeSettings || {},
    updated_at: new Date().toISOString(),
  };
};

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data ? dbProfileToAppProfile(data as DbProfile) : null;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },

  async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile by username:', error);
        return null;
      }

      return data ? dbProfileToAppProfile(data as DbProfile) : null;
    } catch (error) {
      console.error('Error in getProfileByUsername:', error);
      return null;
    }
  },

  async updateProfile(profile: Profile, userId: string): Promise<Profile | null> {
    try {
      const dbProfileData = appProfileToDbProfile(profile, userId);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(dbProfileData)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new profile
        result = await supabase
          .from('profiles')
          .insert({ ...dbProfileData, user_id: userId })
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      return data ? dbProfileToAppProfile(data as DbProfile) : null;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  },

  async uploadAvatar(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error('Error uploading avatar:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return null;
    }
  },

  async uploadBannerImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/banner.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error('Error uploading banner:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadBannerImage:', error);
      return null;
    }
  },

  async getSocialLinks(userId: string): Promise<SocialLink[]> {
    try {
      const { data, error } = await supabase
        .from('profile_social_links')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order');

      if (error) {
        console.error('Error fetching social links:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSocialLinks:', error);
      return [];
    }
  },

  async addSocialLink(userId: string, platform: string, username: string, url: string): Promise<SocialLink | null> {
    try {
      const { data, error } = await supabase
        .from('profile_social_links')
        .insert({
          user_id: userId,
          platform,
          username,
          url,
          sort_order: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding social link:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addSocialLink:', error);
      return null;
    }
  },

  async updateSocialLink(id: number, data: Partial<SocialLink>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profile_social_links')
        .update(data)
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error in updateSocialLink:', error);
      return false;
    }
  },

  async deleteSocialLink(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profile_social_links')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error in deleteSocialLink:', error);
      return false;
    }
  },

  async getShowcaseItems(userId: string): Promise<ShowcaseItem[]> {
    try {
      const { data, error } = await supabase
        .from('profile_showcase')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order');

      if (error) {
        console.error('Error fetching showcase items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getShowcaseItems:', error);
      return [];
    }
  },

  async addToShowcase(userId: string, itemType: string, itemId: string, title: string, imageUrl?: string): Promise<ShowcaseItem | null> {
    try {
      // Check current count
      const { data: existing } = await supabase
        .from('profile_showcase')
        .select('id')
        .eq('user_id', userId);

      if (existing && existing.length >= 5) {
        throw new Error('Maximum 5 showcase items allowed');
      }

      const { data, error } = await supabase
        .from('profile_showcase')
        .insert({
          user_id: userId,
          item_type: itemType,
          item_id: itemId,
          title,
          image_url: imageUrl || null,
          sort_order: existing ? existing.length : 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding to showcase:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addToShowcase:', error);
      return null;
    }
  },

  async removeFromShowcase(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profile_showcase')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error in removeFromShowcase:', error);
      return false;
    }
  },

  async reorderShowcase(items: ShowcaseItem[]): Promise<boolean> {
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('profile_showcase')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      return true;
    } catch (error) {
      console.error('Error in reorderShowcase:', error);
      return false;
    }
  },

  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const { data, error } = await supabase
        .from('profile_privacy')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return defaults if not found
        return {
          show_stats: true,
          show_lists: true,
          show_activity: true,
          show_social_links: true,
          show_showcase: true,
          allow_discovery: true,
        };
      }

      return {
        show_stats: data.show_stats,
        show_lists: data.show_lists,
        show_activity: data.show_activity,
        show_social_links: data.show_social_links,
        show_showcase: data.show_showcase,
        allow_discovery: data.allow_discovery,
      };
    } catch (error) {
      console.error('Error in getPrivacySettings:', error);
      return {
        show_stats: true,
        show_lists: true,
        show_activity: true,
        show_social_links: true,
        show_showcase: true,
        allow_discovery: true,
      };
    }
  },

  async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profile_privacy')
        .upsert({
          user_id: userId,
          ...settings
        });

      return !error;
    } catch (error) {
      console.error('Error in updatePrivacySettings:', error);
      return false;
    }
  },

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        return false;
      }

      return !data; // Username is available if no data was returned
    } catch (error) {
      console.error('Error in checkUsernameAvailability:', error);
      return false;
    }
  }
};
