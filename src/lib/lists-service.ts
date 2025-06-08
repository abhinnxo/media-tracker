
import { supabase } from './supabase';

export interface CustomList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  privacy_setting: 'private' | 'public';
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  media_id: string;
  position: number;
  added_at: string;
}

export interface FilterPreset {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
}

export const listsService = {
  // Custom Lists
  async getLists(userId: string): Promise<CustomList[]> {
    const { data, error } = await supabase
      .from('custom_lists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching lists:', error);
      return [];
    }

    return data || [];
  },

  async createList(userId: string, listData: Partial<CustomList>): Promise<CustomList | null> {
    const { data, error } = await supabase
      .from('custom_lists')
      .insert({
        user_id: userId,
        name: listData.name!,
        description: listData.description,
        privacy_setting: listData.privacy_setting || 'private',
        cover_image_url: listData.cover_image_url
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating list:', error);
      return null;
    }

    return data;
  },

  async updateList(listId: string, updates: Partial<CustomList>): Promise<CustomList | null> {
    const { data, error } = await supabase
      .from('custom_lists')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', listId)
      .select()
      .single();

    if (error) {
      console.error('Error updating list:', error);
      return null;
    }

    return data;
  },

  async deleteList(listId: string): Promise<boolean> {
    const { error } = await supabase
      .from('custom_lists')
      .delete()
      .eq('id', listId);

    if (error) {
      console.error('Error deleting list:', error);
      return false;
    }

    return true;
  },

  // List Items
  async getListItems(listId: string): Promise<ListItem[]> {
    const { data, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', listId)
      .order('position');

    if (error) {
      console.error('Error fetching list items:', error);
      return [];
    }

    return data || [];
  },

  async addItemToList(listId: string, mediaId: string, position?: number): Promise<ListItem | null> {
    // Get the current max position if position not specified
    if (position === undefined) {
      const { data: existingItems } = await supabase
        .from('list_items')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1);

      position = existingItems && existingItems.length > 0 ? existingItems[0].position + 1 : 0;
    }

    const { data, error } = await supabase
      .from('list_items')
      .insert({
        list_id: listId,
        media_id: mediaId,
        position: position
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item to list:', error);
      return null;
    }

    return data;
  },

  async removeItemFromList(listId: string, mediaId: string): Promise<boolean> {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('media_id', mediaId);

    if (error) {
      console.error('Error removing item from list:', error);
      return false;
    }

    return true;
  },

  async reorderListItems(listId: string, itemsWithPositions: { id: string; position: number }[]): Promise<boolean> {
    try {
      const updates = itemsWithPositions.map(item => 
        supabase
          .from('list_items')
          .update({ position: item.position })
          .eq('id', item.id)
      );

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error reordering list items:', error);
      return false;
    }
  },

  // Filter Presets
  async getFilterPresets(userId: string): Promise<FilterPreset[]> {
    const { data, error } = await supabase
      .from('filter_presets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching filter presets:', error);
      return [];
    }

    return data || [];
  },

  async saveFilterPreset(userId: string, name: string, filters: Record<string, any>): Promise<FilterPreset | null> {
    const { data, error } = await supabase
      .from('filter_presets')
      .insert({
        user_id: userId,
        name,
        filters
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving filter preset:', error);
      return null;
    }

    return data;
  },

  async deleteFilterPreset(presetId: string): Promise<boolean> {
    const { error } = await supabase
      .from('filter_presets')
      .delete()
      .eq('id', presetId);

    if (error) {
      console.error('Error deleting filter preset:', error);
      return false;
    }

    return true;
  }
};
