
import { supabase } from './supabase';
import { MediaItem, MediaCategory, MediaStatus, MediaFilterOptions } from './types';

// Helper to convert from the Supabase data model to our app model
const convertDbToAppItem = (dbItem: any): MediaItem => {
  return {
    id: dbItem.id,
    title: dbItem.title,
    description: dbItem.description || undefined,
    imageUrl: dbItem.image_url || undefined,
    category: dbItem.category as MediaCategory,
    status: dbItem.status as MediaStatus,
    rating: dbItem.rating || undefined,
    tags: dbItem.tags || [],
    startDate: dbItem.start_date || undefined,
    endDate: dbItem.end_date || undefined,
    notes: dbItem.notes || undefined,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at
  };
};

// Helper to convert from our app model to the Supabase data model
const convertAppToDbItem = (item: MediaItem, userId: string): any => {
  return {
    id: item.id,
    title: item.title,
    description: item.description || null,
    image_url: item.imageUrl || null,
    category: item.category,
    status: item.status,
    rating: item.rating || null,
    tags: item.tags || [],
    start_date: item.startDate || null,
    end_date: item.endDate || null,
    notes: item.notes || null,
    created_at: item.createdAt,
    updated_at: new Date().toISOString(),
    user_id: userId
  };
};

export const supabaseStore = {
  // Initialize data if needed
  async initialize(userId: string): Promise<void> {
    const { data } = await supabase
      .from('media_items')
      .select('id')
      .eq('user_id', userId);
      
    // If user has no items, could initialize with sample data here if desired
  },
  
  // Get all media items for the user
  async getAll(userId: string): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching media items:', error);
      return [];
    }
    
    return data ? data.map(convertDbToAppItem) : [];
  },
  
  // Get a single media item by ID (ensuring it belongs to the user)
  async getById(id: string, userId: string): Promise<MediaItem | undefined> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching media item:', error);
      return undefined;
    }
    
    return data ? convertDbToAppItem(data) : undefined;
  },
  
  // Get items by category
  async getByCategory(category: MediaCategory, userId: string): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('category', category)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching media items by category:', error);
      return [];
    }
    
    return data ? data.map(convertDbToAppItem) : [];
  },
  
  // Get items by status
  async getByStatus(status: MediaStatus, userId: string): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('status', status)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching media items by status:', error);
      return [];
    }
    
    return data ? data.map(convertDbToAppItem) : [];
  },
  
  // Save a media item (create or update)
  async save(item: MediaItem, userId: string): Promise<MediaItem> {
    const now = new Date().toISOString();
    const dbItem = convertAppToDbItem(
      { 
        ...item, 
        updatedAt: now,
        createdAt: item.createdAt || now
      },
      userId
    );
    
    let result;
    
    // If item has an ID, update it
    if (item.id && item.id !== 'new') {
      result = await supabase
        .from('media_items')
        .update(dbItem)
        .eq('id', item.id)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Create a new item with generated UUID
      const { id, ...newItemWithoutId } = dbItem;
      result = await supabase
        .from('media_items')
        .insert(newItemWithoutId)
        .select()
        .single();
    }
    
    const { data, error } = result;
    
    if (error) {
      console.error('Error saving media item:', error);
      throw new Error('Failed to save media item');
    }
    
    return convertDbToAppItem(data);
  },
  
  // Delete a media item
  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error deleting media item:', error);
      throw new Error('Failed to delete media item');
    }
  },
  
  // Search and filter items
  async filter(options: MediaFilterOptions, userId: string): Promise<MediaItem[]> {
    let query = supabase
      .from('media_items')
      .select('*')
      .eq('user_id', userId);
    
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
      // For tags, we need to check if any of the specified tags exist in the tags array
      // This is a bit complex in Postgres, using the overlap operator
      options.tags.forEach(tag => {
        query = query.contains('tags', [tag]);
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error filtering media items:', error);
      return [];
    }
    
    return data ? data.map(convertDbToAppItem) : [];
  },
  
  // Get all unique tags for a user
  async getAllTags(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('tags')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
    
    // Combine all tag arrays and get unique values
    const allTags = data ? data.flatMap(item => item.tags || []) : [];
    return [...new Set(allTags)];
  },
  
  // Showcase management functions
  async getShowcaseItems(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('showcase_items')
      .select('media_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching showcase items:', error);
      return [];
    }
    
    return data ? data.map(item => item.media_id) : [];
  },
  
  async addToShowcase(mediaId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('showcase_items')
      .insert({
        user_id: userId,
        media_id: mediaId,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error adding item to showcase:', error);
      throw new Error('Failed to add item to showcase');
    }
  },
  
  async removeFromShowcase(mediaId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('showcase_items')
      .delete()
      .eq('media_id', mediaId)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error removing item from showcase:', error);
      throw new Error('Failed to remove item from showcase');
    }
  }
};
