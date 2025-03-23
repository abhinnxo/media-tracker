
import { supabase } from './supabase';
import { Profile } from '@/lib/profile';

export interface DbProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  about: string | null;
  pronouns: string | null;
  theme: string | null;
  updated_at: string | null;
  website: string | null;
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
  };
};

// Convert app profile to database profile fields
export const appProfileToDbProfile = (profile: Profile, userId: string): Partial<DbProfile> => {
  return {
    user_id: userId,
    full_name: profile.name || null,
    username: profile.username || null,
    avatar_url: profile.image || null,
    about: profile.about || null,
    pronouns: profile.pronouns || null,
    theme: profile.theme || null,
    website: profile.website || null,
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
