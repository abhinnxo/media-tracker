import { MediaItem, MediaCategory, MediaStatus } from './types';
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';

// Media Store API
export const mediaStore = {
  // Get all media items for the current user
  getAll: async (): Promise<MediaItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
  
  // Get a single media item by ID
  getById: async (id: string): Promise<MediaItem | undefined> => {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data || undefined;
  },
  
  // Get items by category
  getByCategory: async (category: MediaCategory): Promise<MediaItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
  
  // Get items by status
  getByStatus: async (status: MediaStatus): Promise<MediaItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
  
  // Save a media item (create or update)
  save: async (item: MediaItem): Promise<MediaItem> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    
    // If item has an ID, update it
    if (item.id) {
      const { data, error } = await supabase
        .from('media_items')
        .update({ ...item, updated_at: now })
        .eq('id', item.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    
    // Otherwise create a new item
    const newItem = { 
      ...item, 
      id: crypto.randomUUID(), 
      created_at: now, 
      updated_at: now,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('media_items')
      .insert(newItem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  // Delete a media item
  delete: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },
  
  // Search and filter items
  filter: async (options: {
    category?: MediaCategory | null;
    status?: MediaStatus | null;
    search?: string;
    tags?: string[];
  }): Promise<MediaItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('media_items')
      .select('*')
      .eq('user_id', user.id);
    
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }
    
    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  
  // Export all data
  exportData: async (): Promise<string> => {
    const items = await mediaStore.getAll();
    return JSON.stringify(items);
  },
  
  // Import data
  importData: async (data: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const items = JSON.parse(data);
      const itemsWithUserId = items.map((item: MediaItem) => ({
        ...item,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('media_items')
        .insert(itemsWithUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  },
  
  // Get all unique tags
  getAllTags: async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('media_items')
      .select('tags')
      .eq('user_id', user.id);

    if (error) throw error;
    
    const allTags = data.flatMap(item => item.tags);
    return [...new Set(allTags)];
  }
};
