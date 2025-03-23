
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          about: string | null
          pronouns: string | null
          theme: string | null
          user_id: string
        }
        Insert: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          about?: string | null
          pronouns?: string | null
          theme?: string | null
          user_id: string
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          about?: string | null
          pronouns?: string | null
          theme?: string | null
          user_id?: string
        }
      }
      media_items: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          category: string
          status: string
          rating: number | null
          tags: string[]
          start_date: string | null
          end_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          category: string
          status: string
          rating?: number | null
          tags: string[]
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          category?: string
          status?: string
          rating?: number | null
          tags?: string[]
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      showcase_items: {
        Row: {
          id: string
          user_id: string
          media_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          media_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          media_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
