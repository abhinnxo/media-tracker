
import { supabase } from './supabase';
import { env } from './env';

export const storageService = {
  async uploadImage(file: File, userId: string): Promise<string | null> {
    try {
      // Validate file size
      if (file.size > env.storage.maxFileSize) {
        console.error('File size exceeds maximum allowed size');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(env.storage.bucketName)
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from(env.storage.bucketName)
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
        .from(env.storage.bucketName)
        .remove([fileName]);

      return !error;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
};
