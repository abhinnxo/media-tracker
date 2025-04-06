
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaCategory, MediaItem, MediaStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

interface MediaStoreState {
  items: MediaItem[];
  filteredItems: MediaItem[];
  setFilteredItems: (items: MediaItem[]) => void;
  getAll: () => Promise<MediaItem[]>;
  getById: (id: string) => Promise<MediaItem>;
  getByCategory: (category: MediaCategory) => Promise<MediaItem[]>;
  getByStatus: (status: MediaStatus) => Promise<MediaItem[]>;
  filter: (options: {
    category?: MediaCategory | null;
    status?: MediaStatus | null;
    search?: string;
    tags?: string[];
  }) => Promise<MediaItem[]>;
  update: (id: string, updates: Partial<MediaItem>) => Promise<MediaItem>;
  delete: (id: string) => Promise<void>;
  getAllTags: () => Promise<string[]>;
  add: (item: Omit<MediaItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<MediaItem>;
}

export const mediaStore = create<MediaStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      filteredItems: [],
      setFilteredItems: (items) => set({ filteredItems: items }),
      
      getAll: async () => {
        return get().items;
      },
      
      getById: async (id) => {
        const item = get().items.find((item) => item.id === id);
        if (!item) {
          throw new Error(`Item with ID ${id} not found`);
        }
        return item;
      },
      
      getByCategory: async (category) => {
        return get().items.filter((item) => item.category === category);
      },
      
      getByStatus: async (status) => {
        return get().items.filter((item) => item.status === status);
      },
      
      filter: async (options) => {
        let filtered = get().items;
        
        if (options.category) {
          filtered = filtered.filter((item) => item.category === options.category);
        }
        
        if (options.status) {
          filtered = filtered.filter((item) => item.status === options.status);
        }
        
        if (options.search) {
          const search = options.search.toLowerCase();
          filtered = filtered.filter((item) =>
            item.title.toLowerCase().includes(search) ||
            (item.description?.toLowerCase().includes(search) || false)
          );
        }
        
        if (options.tags && options.tags.length > 0) {
          filtered = filtered.filter((item) =>
            options.tags!.some((tag) => item.tags.includes(tag))
          );
        }
        
        set({ filteredItems: filtered });
        return filtered;
      },
      
      update: async (id, updates) => {
        const now = new Date().toISOString();
        const updatedItems = get().items.map((item) => {
          if (item.id === id) {
            return { ...item, ...updates, updated_at: now };
          }
          return item;
        });
        
        set({ items: updatedItems });
        
        return get().items.find((item) => item.id === id)!;
      },
      
      delete: async (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      
      getAllTags: async () => {
        const allTags = new Set<string>();
        get().items.forEach((item) => {
          item.tags.forEach((tag) => allTags.add(tag));
        });
        return Array.from(allTags);
      },
      
      add: async (item) => {
        const now = new Date().toISOString();
        const newItem: MediaItem = {
          ...item,
          id: uuidv4(),
          created_at: now,
          updated_at: now,
          user_id: 'local-user', // This would be replaced with the actual user ID in a real app
        };
        
        set({ items: [...get().items, newItem] });
        return newItem;
      },
    }),
    {
      name: 'media-store',
    }
  )
);
