import { MediaItem, MediaCategory, MediaStatus } from './types';

// Sample data for initial app state
const sampleData: MediaItem[] = [
  {
    id: "1",
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    category: MediaCategory.MOVIE,
    status: MediaStatus.COMPLETED,
    rating: 9,
    tags: ["sci-fi", "thriller"],
    startDate: "2023-01-15",
    endDate: "2023-01-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Stranger Things",
    description: "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzZWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
    category: MediaCategory.TV_SERIES,
    status: MediaStatus.IN_PROGRESS,
    tags: ["horror", "sci-fi"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    title: "Atomic Habits",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
    imageUrl: "https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UF1000,1000_QL80_.jpg",
    category: MediaCategory.BOOK,
    status: MediaStatus.TO_CONSUME,
    tags: ["self-help", "productivity"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    title: "Attack on Titan",
    description: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3OGYtNDdiMzNiNDZlMDAwXkEyXkFqcGdeQXVyNzI3NjY3NjQ@._V1_FMjpg_UX1000_.jpg",
    category: MediaCategory.ANIME,
    status: MediaStatus.ON_HOLD,
    rating: 8,
    tags: ["action", "dark-fantasy"],
    startDate: "2022-05-10",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "5",
    title: "Berserk",
    description: "A former mercenary, now known as the Black Swordsman, seeks revenge.",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BYzA0MGU2MjgtYzNhZC00MDI0LWFmNjktODY2YjM5OGFkYmIwXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_FMjpg_UX1000_.jpg",
    category: MediaCategory.MANGA,
    status: MediaStatus.DROPPED,
    rating: 7,
    tags: ["dark-fantasy", "action"],
    startDate: "2022-03-10",
    endDate: "2022-04-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to initialize storage
const initializeStorage = (): void => {
  const existingData = localStorage.getItem('media-items');
  if (!existingData) {
    localStorage.setItem('media-items', JSON.stringify(sampleData));
  }
};

// Media Store API
export const mediaStore = {
  // Initialize with sample data if empty
  initialize: (): void => {
    initializeStorage();
  },
  
  // Get all media items
  getAll: async (): Promise<MediaItem[]> => {
    initializeStorage();
    const data = localStorage.getItem('media-items');
    return data ? JSON.parse(data) : [];
  },
  
  // Get a single media item by ID
  getById: async (id: string): Promise<MediaItem | undefined> => {
    const items = await mediaStore.getAll();
    return items.find(item => item.id === id);
  },
  
  // Get items by category
  getByCategory: async (category: MediaCategory): Promise<MediaItem[]> => {
    const items = await mediaStore.getAll();
    return items.filter(item => item.category === category);
  },
  
  // Get items by status
  getByStatus: async (status: MediaStatus): Promise<MediaItem[]> => {
    const items = await mediaStore.getAll();
    return items.filter(item => item.status === status);
  },
  
  // Save a media item (create or update)
  save: async (item: MediaItem): Promise<MediaItem> => {
    const items = await mediaStore.getAll();
    const now = new Date().toISOString();
    
    // If item has an ID, update it
    if (item.id) {
      const updatedItem = { ...item, updatedAt: now };
      const newItems = items.map(i => i.id === item.id ? updatedItem : i);
      localStorage.setItem('media-items', JSON.stringify(newItems));
      return updatedItem;
    }
    
    // Otherwise create a new item
    const newItem = { 
      ...item, 
      id: crypto.randomUUID(), 
      createdAt: now, 
      updatedAt: now 
    };
    
    localStorage.setItem('media-items', JSON.stringify([...items, newItem]));
    return newItem;
  },
  
  // Delete a media item
  delete: async (id: string): Promise<void> => {
    const items = await mediaStore.getAll();
    localStorage.setItem(
      'media-items', 
      JSON.stringify(items.filter(i => i.id !== id))
    );
  },
  
  // Search and filter items
  filter: async (options: {
    category?: MediaCategory | null;
    status?: MediaStatus | null;
    search?: string;
    tags?: string[];
  }): Promise<MediaItem[]> => {
    let items = await mediaStore.getAll();
    
    if (options.category) {
      items = items.filter(item => item.category === options.category);
    }
    
    if (options.status) {
      items = items.filter(item => item.status === options.status);
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (options.tags && options.tags.length > 0) {
      items = items.filter(item => 
        options.tags!.some(tag => item.tags.includes(tag))
      );
    }
    
    return items;
  },
  
  // Export all data
  exportData: async (): Promise<string> => {
    const items = await mediaStore.getAll();
    return JSON.stringify(items);
  },
  
  // Import data
  importData: async (data: string): Promise<void> => {
    try {
      const items = JSON.parse(data);
      localStorage.setItem('media-items', JSON.stringify(items));
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  },
  
  // Get all unique tags
  getAllTags: async (): Promise<string[]> => {
    const items = await mediaStore.getAll();
    const allTags = items.flatMap(item => item.tags);
    return [...new Set(allTags)];
  }
};
