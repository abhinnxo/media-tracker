
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfileSocialLink {
  platform: string;
  url: string;
}

export interface Profile {
  name?: string;
  username?: string;
  about?: string;
  image?: string;
  pronouns?: string;
  theme?: string;
  website?: string;
  showcaseIds?: string[];
  socialLinks?: ProfileSocialLink[];
}

interface ProfileState {
  profile: Profile;
  updateProfile: (updatedProfile: Profile) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: {},
      updateProfile: (updatedProfile) => set({ profile: updatedProfile }),
    }),
    {
      name: 'media-tracker-profile',
    }
  )
);
