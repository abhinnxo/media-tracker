
import { supabase } from './supabase';

export const storageService = {
  async uploadImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('media-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  },

  async deleteImage(url: string): Promise<boolean> {
    try {
      const fileName = url.split('/').pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from('media-images')
        .remove([fileName]);

      return !error;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
};
